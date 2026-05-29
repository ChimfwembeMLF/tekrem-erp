declare global {
    interface Window {
        Echo: any;
        Pusher: any;
    }
}

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
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
});

window.Echo = echo;

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
    channel.listen('.chat.message',  (e: any) => { handlers.onMessage?.(e); });
    channel.listen('.chat.edit',     handlers.onEdit     ?? (() => {}));
    channel.listen('.chat.reaction', handlers.onReaction ?? (() => {}));
    channel.listen('.chat.pin',      handlers.onPin      ?? (() => {}));
    channel.listen('.chat.comment',  handlers.onComment  ?? (() => {}));
    channel.listen('.chat.typing',   handlers.onTyping   ?? (() => {}));
    channel.listen('.chat.read',     handlers.onRead     ?? (() => {}));
    return channel;
}

export default echo;