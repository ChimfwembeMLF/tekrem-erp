import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
    broadcaster: 'pusher',
    key: '79e6bb61450790bc0624', // Replace with your PUSHER_APP_KEY
    wsHost: window.location.hostname,
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
});

window.Echo = echo;

// Helper: subscribe to all livechat events for a channel
export function subscribeLiveChatEvents(channelName, handlers) {
    const channel = echo.private(channelName);
    channel.listen('.chat.message', handlers.onMessage || (() => {}));
    channel.listen('.chat.edit', handlers.onEdit || (() => {}));
    channel.listen('.chat.reaction', handlers.onReaction || (() => {}));
    channel.listen('.chat.pin', handlers.onPin || (() => {}));
    channel.listen('.chat.comment', handlers.onComment || (() => {}));
    channel.listen('.chat.typing', handlers.onTyping || (() => {}));
    channel.listen('.chat.read', handlers.onRead || (() => {}));
    return channel;
}

export default echo;
