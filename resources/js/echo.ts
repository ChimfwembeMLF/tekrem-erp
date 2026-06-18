declare global {
    interface Window {
        Echo: any;
        Pusher: any;
    }
}

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { getCsrfToken, getXsrfToken, notifySessionExpired } from '@/lib/http';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster:       'reverb',
    key:               import.meta.env.VITE_REVERB_APP_KEY,
    Pusher,
    wsHost:            import.meta.env.VITE_REVERB_HOST,
    wsPort:            Number(import.meta.env.VITE_REVERB_PORT) || 8080,
    wssPort:           Number(import.meta.env.VITE_REVERB_PORT) || 443,
    forceTLS:          (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel) => ({
        authorize: (socketId, callback) => {
            fetch('/broadcasting/auth', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    ...(getXsrfToken() ? { 'X-XSRF-TOKEN': getXsrfToken() } : { 'X-CSRF-TOKEN': getCsrfToken() }),
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    socket_id: socketId,
                    channel_name: channel.name,
                }),
            })
                .then((response) => {
                    if (response.status === 419) {
                        notifySessionExpired();
                        callback(new Error('Session expired'), null);
                        return;
                    }
                    if (!response.ok) {
                        callback(new Error(`Broadcast auth failed (${response.status})`), null);
                        return;
                    }
                    return response.json().then((data) => callback(null, data));
                })
                .catch((error) => callback(error, null));
        },
    }),
});

window.Echo = echo;

if (window.axios) {
    window.axios.interceptors.request.use((config) => {
        const socketId = echo.socketId();
        if (socketId) {
            config.headers['X-Socket-Id'] = socketId;
        }
        return config;
    });
}

export function getBroadcastHeaders(contentType: string | null = 'application/json'): Record<string, string> {
    const headers: Record<string, string> = {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    };

    const xsrf = getXsrfToken();
    if (xsrf) {
        headers['X-XSRF-TOKEN'] = xsrf;
    } else {
        const csrf = getCsrfToken();
        if (csrf) {
            headers['X-CSRF-TOKEN'] = csrf;
        }
    }

    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    const socketId = echo.socketId?.();
    if (socketId) {
        headers['X-Socket-Id'] = socketId;
    }

    return headers;
}

export function subscribeLiveChatEvents(channelName: string, handlers: {
    onMessage?:  (e: any) => void;
    onEdit?:     (e: any) => void;
    onReaction?: (e: any) => void;
    onPin?:      (e: any) => void;
    onComment?:  (e: any) => void;
    onTyping?:   (e: any) => void;
    onRead?:     (e: any) => void;
}) {
    const channel = echo.private(channelName);
    channel.listen('.MessageSent', (e: any) => { handlers.onMessage?.(e); });
    channel.listen('.chat.edit',     handlers.onEdit     ?? (() => {}));
    channel.listen('.chat.reaction', handlers.onReaction ?? (() => {}));
    channel.listen('.chat.pin',      handlers.onPin      ?? (() => {}));
    channel.listen('.chat.comment',  handlers.onComment  ?? (() => {}));
    channel.listen('.user.typing',   handlers.onTyping   ?? (() => {}));
    channel.listen('.chat.read',     handlers.onRead     ?? (() => {}));
    return channel;
}

export default echo;
