# Copilot Instructions for TekRem ERP

## Project Architecture
- **Backend:** Laravel 12 (PHP) with Jetstream (Inertia + React), organized in `app/` (Controllers, Models, Services, Policies, etc.)
- **Frontend:** React (TypeScript) with TailwindCSS and shadcn/ui, integrated via Inertia.js
- **Database:** MySQL, migrations in `database/migrations/`, seeders in `database/seeders/`
- **Testing:** Cypress for E2E (`cypress/`), PHPUnit for backend
- **RBAC:** Uses spatie/laravel-permission for roles/permissions
- **Localization:** mcamara/laravel-localization
- **Logging:** spatie/laravel-activitylog
- **Realtime:** Laravel Echo + Pusher or WebSockets

## Key Workflows
- **Setup:**
  - `composer install` (PHP deps), `npm install` (JS deps)
  - Copy `.env.example` to `.env`, set DB config
  - `php artisan key:generate`, `php artisan migrate --seed`
  - `php artisan serve` (backend), `npm run dev` (frontend)
- **Testing:**
  - Backend: `phpunit`
  - Frontend/E2E: `npm run cypress:open` (interactive) or `npm run cypress:run` (headless)
- **Migrations/Models:** Use `php artisan make:model ModelName -m` for new models/migrations
- **Cypress:**
  - Test data in `cypress/fixtures/`
  - Page objects in `cypress/support/page-objects/`
  - Use `data-testid` for selectors

## Project Conventions
- **Frontend modules** are organized by business domain (e.g., CRM, HR, Projects)
- **Controllers/Services**: Business logic in `app/Http/Controllers/` and `app/Services/`
- **Policies/Authorization**: In `app/Policies/`, enforced via middleware and policies
- **Notifications**: Email and toast notifications, see `app/Notifications/`
- **Routes**: API in `routes/api.php`, web in `routes/web.php`
- **Environment variables**: Set in `.env`, see `config/` for available options
- **RBAC**: Assign roles/permissions using spatie/laravel-permission
- **Localization**: Add translations in `resources/lang/`

## Integration Points
- **Frontend/Backend:** Inertia.js bridges React and Laravel
- **Realtime:** Configure Pusher/WebSockets in `.env` and `config/broadcasting.php`
- **CI/CD:** Cypress tests run in GitHub Actions (see `cypress/README.md` for example)

## Examples
- Add a new model: `php artisan make:model Invoice -m`
- Add a new Cypress test: Place in `cypress/e2e/`, use `cy.loginAsAdmin()` for auth
- Add a translation: Edit `resources/lang/{locale}/`

## References
- See `README.md` for setup, `cypress/README.md` for E2E details
- Key configs: `config/`, `database/`, `resources/`, `routes/`, `app/`

---
For new patterns or changes, update this file and the relevant README(s).