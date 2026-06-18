#!/usr/bin/env bash
#
# TekRem ERP — Ubuntu + CyberPanel + LiteSpeed
# One-shot incident response, cleanup, and hardening script.
#
# Usage:
#   sudo bash scripts/ubuntu-cyberpanel-security.sh
#
# Optional environment overrides:
#   APP_ROOT=/home/example.com/erp
#   SITE_USER=example.com
#   PHP_BIN=/usr/local/lsws/lsphp83/bin/php
#   LEAVE_MAINTENANCE=1          # do not disable maintenance at the end
#   SKIP_LITESPEED_RESTART=1
#
set -euo pipefail

# ─── CONFIG (edit if auto-detect fails) ───────────────────────────────────────
APP_ROOT="${APP_ROOT:-}"
SITE_USER="${SITE_USER:-}"
PHP_BIN="${PHP_BIN:-}"
BACKUP_DIR="${BACKUP_DIR:-/root/erp-security-backups/$(date +%Y%m%d-%H%M%S)}"
LOG_FILE="${LOG_FILE:-/var/log/erp-security-$(date +%Y%m%d-%H%M%S).log}"

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $*" | tee -a "$LOG_FILE"; }
warn() { echo -e "${YELLOW}[!]${NC} $*" | tee -a "$LOG_FILE"; }
err()  { echo -e "${RED}[x]${NC} $*" | tee -a "$LOG_FILE"; }

require_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    err "Run as root: sudo bash $0"
    exit 1
  fi
}

detect_app_root() {
  if [[ -n "$APP_ROOT" && -f "$APP_ROOT/artisan" ]]; then
    return 0
  fi

  local candidates=(
    "/home/*/erp"
    "/home/*/public_html"
    "/home/*/*/public_html"
    "/var/www/*/erp"
    "/var/www/html"
  )

  for pattern in "${candidates[@]}"; do
    for path in $pattern; do
      [[ -f "$path/artisan" ]] || continue
      APP_ROOT="$path"
      log "Detected APP_ROOT: $APP_ROOT"
      return 0
    done
  done

  err "Could not detect Laravel root. Set APP_ROOT=/path/to/erp and re-run."
  exit 1
}

detect_site_user() {
  if [[ -n "$SITE_USER" ]]; then
    return 0
  fi

  SITE_USER="$(stat -c '%U' "$APP_ROOT")"
  log "Detected SITE_USER: $SITE_USER"
}

detect_php() {
  if [[ -n "$PHP_BIN" && -x "$PHP_BIN" ]]; then
    return 0
  fi

  local candidates=(
    /usr/local/lsws/lsphp83/bin/php
    /usr/local/lsws/lsphp82/bin/php
    /usr/local/lsws/lsphp81/bin/php
    /usr/local/lsws/lsphp80/bin/php
    /usr/bin/php
  )

  for bin in "${candidates[@]}"; do
    if [[ -x "$bin" ]]; then
      PHP_BIN="$bin"
      log "Using PHP: $PHP_BIN ($("$PHP_BIN" -r 'echo PHP_VERSION;'))"
      return 0
    fi
  done

  err "PHP not found. Set PHP_BIN=/path/to/php and re-run."
  exit 1
}

malware_scan() {
  local report="$BACKUP_DIR/malware-scan.txt"
  mkdir -p "$BACKUP_DIR"

  log "Scanning for common webshell patterns..."
  {
    echo "=== Malware scan $(date) ==="
    echo "APP_ROOT=$APP_ROOT"
    echo

    local patterns=(
      'eval[[:space:]]*\([[:space:]]*base64_decode'
      'eval[[:space:]]*\([[:space:]]*gzinflate'
      'eval[[:space:]]*\([[:space:]]*str_rot13'
      'assert[[:space:]]*\([[:space:]]*base64_decode'
      'preg_replace.*/e'
      'shell_exec[[:space:]]*\('
      'passthru[[:space:]]*\('
      'system[[:space:]]*\('
      'proc_open[[:space:]]*\('
    )

    local search_paths=(
      "$APP_ROOT/public"
      "$APP_ROOT/bootstrap"
      "$APP_ROOT/app"
      "$APP_ROOT/config"
      "$APP_ROOT/routes"
      "$APP_ROOT/storage"
    )

    for path in "${search_paths[@]}"; do
      [[ -d "$path" ]] || continue
      echo "--- $path ---"
      for pattern in "${patterns[@]}"; do
        grep -RIn --include='*.php' -E "$pattern" "$path" 2>/dev/null || true
      done
      echo
    done

    echo "--- Recently modified PHP (last 14 days) ---"
    find "$APP_ROOT/public" "$APP_ROOT/bootstrap" "$APP_ROOT/storage" \
      -name '*.php' -mtime -14 -printf '%TY-%Tm-%Td %TH:%TM %p\n' 2>/dev/null | sort -r | head -100 || true
  } | tee "$report"

  if grep -qE 'eval[[:space:]]*\([[:space:]]*base64_decode' "$report"; then
    warn "Suspicious patterns found — see $report"
    warn "Backups of touched core files are in $BACKUP_DIR"
  else
    log "No obvious eval/base64 patterns in scan output."
  fi
}

backup_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0
  local dest="$BACKUP_DIR/$(echo "$file" | tr '/' '_')"
  cp -a "$file" "$dest"
  log "Backed up: $file -> $dest"
}

restore_clean_index_php() {
  local index="$APP_ROOT/public/index.php"
  backup_file "$index"

  if grep -qE 'eval[[:space:]]*\([[:space:]]*base64_decode' "$index" 2>/dev/null; then
    warn "Infected index.php detected — restoring clean Laravel entry file."
  else
    log "index.php looks clean, but rewriting known-good copy anyway."
  fi

  cat > "$index" <<'PHP'
<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
PHP

  chown "$SITE_USER:$SITE_USER" "$index"
  chmod 644 "$index"
  log "Restored clean public/index.php"
}

write_public_htaccess() {
  local htaccess="$APP_ROOT/public/.htaccess"
  backup_file "$htaccess"

  # Merge hardening rules if file exists; otherwise write full file from repo.
  if [[ -f "$htaccess" ]] && grep -q 'Block direct access to sensitive artifacts' "$htaccess"; then
    log "public/.htaccess already has security rules."
    return 0
  fi

  if [[ ! -f "$htaccess" ]]; then
    cat > "$htaccess" <<'HTACCESS'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    RewriteRule ^\.env - [F,L]
    RewriteRule ^(composer\.(json|lock)|package(-lock)?\.json|yarn\.lock)$ - [F,L]

    RewriteRule ^(build|storage)/ - [L]

    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    RewriteCond %{HTTP:x-xsrf-token} .
    RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]

    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
HTACCESS
    log "Created public/.htaccess"
  else
    # Prepend security rules after RewriteEngine On if missing
    if ! grep -q 'RewriteRule \^\\\.env' "$htaccess"; then
      sed -i '/RewriteEngine On/a\
\
    # Block direct access to sensitive artifacts\
    RewriteRule ^\\.env - [F,L]\
    RewriteRule ^(composer\\.(json|lock)|package(-lock)?\\.json|yarn\\.lock)$ - [F,L]' "$htaccess"
      log "Injected security rules into existing public/.htaccess"
    fi
  fi

  chown "$SITE_USER:$SITE_USER" "$htaccess"
  chmod 644 "$htaccess"
}

write_storage_htaccess() {
  local dir="$APP_ROOT/storage/app/public"
  local htaccess="$dir/.htaccess"
  mkdir -p "$dir"

  cat > "$htaccess" <<'HTACCESS'
# Block script execution in upload directories (LiteSpeed / Apache compatible)
<IfModule mod_authz_core.c>
    <FilesMatch "\.(?i:php|php3|php4|php5|php7|php8|phtml|phar|pl|py|cgi|asp|aspx|jsp|sh)$">
        Require all denied
    </FilesMatch>
</IfModule>

<IfModule !mod_authz_core.c>
    <FilesMatch "\.(?i:php|php3|php4|php5|php7|php8|phtml|phar|pl|py|cgi|asp|aspx|jsp|sh)$">
        Order allow,deny
        Deny from all
    </FilesMatch>
</IfModule>
HTACCESS

  chown -R "$SITE_USER:$SITE_USER" "$dir"
  chmod 644 "$htaccess"
  log "Wrote storage/app/public/.htaccess (blocks PHP in uploads)"
}

fix_permissions() {
  log "Applying file permissions..."

  chown -R "$SITE_USER:$SITE_USER" "$APP_ROOT"

  find "$APP_ROOT" -type d -exec chmod 755 {} \;
  find "$APP_ROOT" -type f -exec chmod 644 {} \;

  chmod 755 "$APP_ROOT/artisan"
  [[ -x "$APP_ROOT/vendor/bin/pest" ]] && chmod 755 "$APP_ROOT/vendor/bin/"* 2>/dev/null || true

  chmod -R ug+rwx "$APP_ROOT/storage" "$APP_ROOT/bootstrap/cache"
  chmod 644 "$APP_ROOT/public/index.php"

  # Prevent web user from owning deploy-critical files if group is shared
  chown "$SITE_USER:$SITE_USER" "$APP_ROOT/public/index.php" "$APP_ROOT/artisan"

  log "Permissions applied (storage + bootstrap/cache writable)."
}

enable_maintenance() {
  if [[ -f "$APP_ROOT/artisan" ]]; then
    sudo -u "$SITE_USER" "$PHP_BIN" "$APP_ROOT/artisan" down --retry=60 --refresh=15 2>/dev/null || \
      warn "Could not enable maintenance mode (may already be down)."
  fi
}

disable_maintenance() {
  if [[ "${LEAVE_MAINTENANCE:-0}" == "1" ]]; then
    warn "LEAVE_MAINTENANCE=1 — site stays in maintenance mode."
    return 0
  fi
  sudo -u "$SITE_USER" "$PHP_BIN" "$APP_ROOT/artisan" up 2>/dev/null || true
  log "Maintenance mode disabled."
}

run_artisan_checks() {
  log "Running Laravel integrity check..."
  if sudo -u "$SITE_USER" "$PHP_BIN" "$APP_ROOT/artisan" security:integrity-check >>"$LOG_FILE" 2>&1; then
    log "security:integrity-check passed."
  else
    warn "security:integrity-check FAILED — review $LOG_FILE and $BACKUP_DIR/malware-scan.txt"
  fi

  log "Clearing caches..."
  sudo -u "$SITE_USER" "$PHP_BIN" "$APP_ROOT/artisan" config:clear >>"$LOG_FILE" 2>&1 || true
  sudo -u "$SITE_USER" "$PHP_BIN" "$APP_ROOT/artisan" route:clear >>"$LOG_FILE" 2>&1 || true
  sudo -u "$SITE_USER" "$PHP_BIN" "$APP_ROOT/artisan" view:clear >>"$LOG_FILE" 2>&1 || true
  sudo -u "$SITE_USER" "$PHP_BIN" "$APP_ROOT/artisan" config:cache >>"$LOG_FILE" 2>&1 || true
  sudo -u "$SITE_USER" "$PHP_BIN" "$APP_ROOT/artisan" route:cache >>"$LOG_FILE" 2>&1 || true
}

install_cron() {
  local cron_line="0 */6 * * * cd $APP_ROOT && $PHP_BIN artisan security:integrity-check >> /var/log/erp-integrity.log 2>&1"
  local cron_file="/etc/cron.d/erp-integrity-check"

  if [[ -f "$cron_file" ]]; then
    log "Cron already installed: $cron_file"
    return 0
  fi

  cat > "$cron_file" <<CRON
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# TekRem ERP integrity check every 6 hours
0 */6 * * * $SITE_USER cd $APP_ROOT && $PHP_BIN artisan security:integrity-check >> /var/log/erp-integrity.log 2>&1
CRON

  chmod 644 "$cron_file"
  log "Installed cron: $cron_file"
}

restart_litespeed() {
  if [[ "${SKIP_LITESPEED_RESTART:-0}" == "1" ]]; then
    warn "SKIP_LITESPEED_RESTART=1 — not restarting LiteSpeed."
    return 0
  fi

  if systemctl is-active --quiet lsws 2>/dev/null; then
    systemctl restart lsws
    log "Restarted LiteSpeed (systemctl restart lsws)."
  elif systemctl is-active --quiet openlitespeed 2>/dev/null; then
    systemctl restart openlitespeed
    log "Restarted OpenLiteSpeed."
  elif [[ -x /usr/local/lsws/bin/lswsctrl ]]; then
    /usr/local/lsws/bin/lswsctrl restart
    log "Restarted LiteSpeed via lswsctrl."
  else
    warn "LiteSpeed service not found — restart manually from CyberPanel."
  fi
}

print_post_incident_checklist() {
  cat <<EOF

${YELLOW}═══════════════════════════════════════════════════════════════${NC}
${GREEN}Script finished. Manual steps still required:${NC}
${YELLOW}═══════════════════════════════════════════════════════════════${NC}

1. ${RED}Rotate ALL secrets${NC} (assume breach):
   - Admin passwords, DB password, APP_KEY, PawaPay, mail, SSH/FTP/CyberPanel

2. Review scan report:
   $BACKUP_DIR/malware-scan.txt

3. Check CyberPanel / server for:
   - Unknown FTP/SSH users
   - crontab -u $SITE_USER -l
   - Other sites on this server

4. Redeploy from clean git if multiple files are infected:
   git pull && composer install --no-dev && npm run build

5. CyberPanel: Website → your domain → confirm Document Root = .../public

6. Enable Cloudflare WAF (if using proxy) + restrict CyberPanel port 8090 to your IP

Log file: $LOG_FILE
Backups:  $BACKUP_DIR

EOF
}

main() {
  require_root
  mkdir -p "$(dirname "$LOG_FILE")"
  mkdir -p "$BACKUP_DIR"

  log "TekRem ERP security script — Ubuntu / CyberPanel / LiteSpeed"
  log "Log: $LOG_FILE"

  detect_app_root
  detect_site_user
  detect_php

  enable_maintenance
  malware_scan
  restore_clean_index_php
  write_public_htaccess
  write_storage_htaccess
  fix_permissions
  run_artisan_checks
  install_cron
  restart_litespeed
  disable_maintenance
  print_post_incident_checklist
}

main "$@"
