import './bootstrap';
import './echo';
import '../css/app.css';
import './i18n';

// Ensure Laravel XSRF-TOKEN cookie is set for axios / fetch CSRF
fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' }).catch(() => {});
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp, router } from '@inertiajs/react';
import { RouteContext } from '@/Hooks/useRoute';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { initializeTheme } from '@/lib/themes';
import CookieConsentBanner from '@/Components/CookieConsentBanner';

initializeTheme();

function handleSessionExpired() {
    if ((window as { __sessionExpiredHandled?: boolean }).__sessionExpiredHandled) {
        return;
    }
    (window as { __sessionExpiredHandled?: boolean }).__sessionExpiredHandled = true;
    window.location.href = '/login';
}

window.addEventListener('session-expired', handleSessionExpired);

router.on('invalid', (event) => {
    if (event.detail.response?.status === 419) {
        event.preventDefault();
        handleSessionExpired();
    }
});

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