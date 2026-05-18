import './bootstrap';          // Echo lives here now
import '../css/app.css';
import './i18n';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { RouteContext } from '@/Hooks/useRoute';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { initializeTheme } from '@/lib/themes';
import CookieConsentBanner from '@/Components/CookieConsentBanner';

initializeTheme();

const appName =
    window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
    title:    title => `${title} - ${appName}`,
    progress: { color: '#4B5563' },
    resolve: name => {
        const pages    = import.meta.glob('./Pages/**/*.tsx');
        const jsxPages = import.meta.glob('./Pages/**/*.jsx');
        if (pages[`./Pages/${name}.tsx`]) {
            return resolvePageComponent(`./Pages/${name}.tsx`, pages);
        }
        return resolvePageComponent(`./Pages/${name}.jsx`, jsxPages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <RouteContext.Provider value={(window as any).route}>
                <>
                    <App {...props} />
                    <CookieConsentBanner />
                </>
            </RouteContext.Provider>
        );
    },
});