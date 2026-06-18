import { useEffect } from 'react';

const PING_INTERVAL_MS = 5 * 60 * 1000;

export function useSessionKeepAlive(enabled = true) {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const ping = () => {
            fetch('/session/ping', {
                method: 'GET',
                credentials: 'same-origin',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    Accept: 'application/json',
                },
            }).catch(() => {});
        };

        const intervalId = window.setInterval(ping, PING_INTERVAL_MS);

        return () => window.clearInterval(intervalId);
    }, [enabled]);
}
