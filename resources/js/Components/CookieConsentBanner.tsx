import React, { useEffect, useState } from 'react';

import { Cookie, ChevronDown, ShieldCheck, BarChart2, Megaphone, Info } from 'lucide-react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Button, Card, CardContent, CardFooter, Label, SelectSeparator, Badge, Tooltip, TooltipContent, TooltipTrigger, Switch, Separator, Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/index';

const COOKIE_KEY = 'cookie_consent_v2';

const COOKIE_CATEGORIES = [
  {
    id: 'necessary',
    icon: ShieldCheck,
    label: 'Strictly Necessary',
    description: 'Essential for the website to function. Cannot be disabled.',
    required: true,
    defaultEnabled: true,
  },
  {
    id: 'analytics',
    icon: BarChart2,
    label: 'Analytics',
    description: 'Help us understand how visitors interact with our website.',
    required: false,
    defaultEnabled: false,
  },
  {
    id: 'marketing',
    icon: Megaphone,
    label: 'Marketing',
    description: 'Used to deliver personalized advertisements.',
    required: false,
    defaultEnabled: false,
  },
];

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [preferences, setPreferences] = useState(
    Object.fromEntries(COOKIE_CATEGORIES.map((c) => [c.id, c.defaultEnabled]))
  );

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (!stored) setVisible(true);
  }, []);

  const saveConsent = (prefs) => {
    localStorage.setItem(
      COOKIE_KEY,
      JSON.stringify({ preferences: prefs, timestamp: Date.now() })
    );
    setVisible(false);
  };

  const acceptAll = () => {
    const all = Object.fromEntries(COOKIE_CATEGORIES.map((c) => [c.id, true]));
    setPreferences(all);
    saveConsent(all);
  };

  const declineAll = () => {
    const none = Object.fromEntries(COOKIE_CATEGORIES.map((c) => [c.id, c.required]));
    setPreferences(none);
    saveConsent(none);
  };

  const saveCustom = () => saveConsent(preferences);

  const toggle = (id) =>
    setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));

  if (!visible) return null;

  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center p-4 sm:p-6">
        <Card
          className={[
            'w-full max-w-7xl shadow-2xl overflow-hidden',
            // Border
            'border border-brandBlue/20 dark:border-brandMauve/20',
            // Background
            'bg-white dark:bg-[#0a1628]',
          ].join(' ')}
        >
          {/* ── Gradient accent bar ─────────────────────────────── */}
          <div className="h-1 w-full bg-gradient-to-r from-primary via-brandMauve to-primary dark:from-brandMauve dark:via-primary dark:to-brandMauve" />

          <CardContent className="pt-5 pb-2 px-6">
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              {/* Icon */}
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-brandMauve shrink-0 mt-0.5 shadow-md shadow-primary/25 dark:shadow-brandMauve/20">
                <Cookie className="h-4 w-4 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-base text-brandBlue dark:text-white">
                    We value your privacy
                  </h2>
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-4 border-brandMauve/50 text-brandMauve font-normal"
                  >
                    GDPR
                  </Badge>
                </div>
                <p className="text-sm text-brandBlue/65 dark:text-white/55 leading-relaxed">
                  We use cookies to enhance your browsing experience and analyse site traffic. See
                  our{' '}
                  <a
                    href="/privacy"
                    className="font-medium underline underline-offset-2 text-brandMauve hover:text-primary dark:hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>{' '}
                  for more details.
                </p>
              </div>
            </div>

            {/* Expandable preferences */}
            <Collapsible open={expanded} onOpenChange={setExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full flex items-center justify-between px-0 h-8 text-brandBlue/45 dark:text-white/35 hover:text-primary dark:hover:text-white hover:bg-transparent"
                >
                  <span className="text-xs font-semibold tracking-widest uppercase">
                    Manage Preferences
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      expanded ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                <Separator className="my-3 bg-brandBlue/10 dark:bg-white/10" />

                <div className="space-y-2.5 py-0.5">
                  {COOKIE_CATEGORIES.map(({ id, icon: Icon, label, description, required }) => (
                    <div
                      key={id}
                      className={[
                        'flex items-center justify-between gap-4 rounded-lg px-3 py-2.5',
                        'bg-brandBlue/[0.035] dark:bg-white/[0.04]',
                        'border border-brandBlue/[0.07] dark:border-white/[0.08]',
                      ].join(' ')}
                    >
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Category icon */}
                        <div className="p-1.5 rounded-md bg-gradient-to-br from-primary/10 to-brandMauve/10 dark:from-primary/25 dark:to-brandMauve/25 shrink-0 mt-0.5">
                          <Icon className="h-3.5 w-3.5 text-primary dark:text-brandMauve" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <Label
                              htmlFor={`cookie-${id}`}
                              className="text-sm font-medium cursor-pointer text-brandBlue dark:text-white/90"
                            >
                              {label}
                            </Label>
                            {required && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary dark:border-brandMauve/40 dark:text-brandMauve"
                              >
                                Required
                              </Badge>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-brandBlue/30 dark:text-white/30 cursor-help shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent
                                side="top"
                                className="max-w-[200px] text-xs bg-brandBlue text-white border-0 dark:bg-[#1a3560]"
                              >
                                {description}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xs text-brandBlue/50 dark:text-white/40 mt-0.5 truncate">
                            {description}
                          </p>
                        </div>
                      </div>

                      <Switch
                        id={`cookie-${id}`}
                        checked={preferences[id]}
                        onCheckedChange={() => !required && toggle(id)}
                        disabled={required}
                        // Checked: blue in light, mauve in dark
                        className="shrink-0 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-brandMauve disabled:opacity-40"
                        aria-label={`Toggle ${label} cookies`}
                      />
                    </div>
                  ))}
                </div>

                <SelectSeparator className="mt-3 bg-brandBlue/10 dark:bg-white/10" />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>

          <CardFooter className="px-6 pb-5 pt-3 flex flex-col sm:flex-row gap-2 justify-end">
            {/* Save custom — only visible when expanded */}
            {expanded && (
              <Button
                variant="outline"
                size="sm"
                onClick={saveCustom}
                className={[
                  'w-full sm:w-auto order-2 sm:order-first sm:mr-auto',
                  // Light: blue outline → filled on hover
                  'border-primary/40 text-primary hover:bg-primary hover:text-white',
                  // Dark: mauve outline → filled on hover
                  'dark:border-brandMauve/50 dark:text-brandMauve dark:hover:bg-brandMauve dark:hover:text-white',
                  'transition-all duration-150',
                ].join(' ')}
              >
                Save Preferences
              </Button>
            )}

            {/* Decline */}
            <Button
              variant="outline"
              size="sm"
              onClick={declineAll}
              className={[
                'w-full sm:w-auto',
                'border-brandBlue/20 text-brandBlue/60 hover:bg-brandBlue/5 hover:text-brandBlue hover:border-brandBlue/40',
                'dark:border-white/15 dark:text-white/45 dark:hover:bg-white/5 dark:hover:text-white dark:hover:border-white/30',
                'transition-all duration-150',
              ].join(' ')}
            >
              Decline All
            </Button>

            {/* Accept — gradient CTA */}
            <Button
              size="sm"
              onClick={acceptAll}
              className={[
                'w-full sm:w-auto border-0',
                // Light: blue gradient
                'bg-gradient-to-r from-primary to-[#1a5299] hover:from-[#0a2f57] hover:to-primary',
                // Dark: mauve → blue gradient (reversed)
                'dark:from-brandMauve dark:to-primary dark:hover:from-primary dark:hover:to-brandMauve',
                'text-white shadow-md shadow-primary/30 dark:shadow-brandMauve/25',
                'transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 dark:hover:shadow-brandMauve/25',
              ].join(' ')}
            >
              Accept All
            </Button>
          </CardFooter>
        </Card>
      </div>
    </TooltipProvider>
  );
}