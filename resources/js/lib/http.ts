export function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export function getXsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export function sessionJsonHeaders(contentType: string | null = 'application/json'): Record<string, string> {
    const headers: Record<string, string> = {
        'X-Requested-With': 'XMLHttpRequest',
        Accept: 'application/json',
    };

    const xsrf = getXsrfToken();
    if (xsrf) {
        headers['X-XSRF-TOKEN'] = xsrf;
    }

    const csrf = getCsrfToken();
    if (csrf) {
        headers['X-CSRF-TOKEN'] = csrf;
    }

    if (contentType) {
        headers['Content-Type'] = contentType;
    }

    return headers;
}

export class SessionExpiredError extends Error {
    constructor() {
        super('Session expired');
        this.name = 'SessionExpiredError';
    }
}

export function notifySessionExpired(): void {
    window.dispatchEvent(new CustomEvent('session-expired'));
}

export async function fetchWithSession(input: RequestInfo, init: RequestInit = {}): Promise<Response> {
    const isFormData = init.body instanceof FormData;
    const response = await fetch(input, {
        ...init,
        credentials: 'same-origin',
        headers: {
            ...sessionJsonHeaders(isFormData ? null : 'application/json'),
            ...(init.headers as Record<string, string> | undefined),
        },
    });

    if (response.status === 419) {
        notifySessionExpired();
        throw new SessionExpiredError();
    }

    return response;
}
