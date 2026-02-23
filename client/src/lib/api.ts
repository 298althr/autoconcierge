const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface ApiOptions extends RequestInit {
    token?: string | null;
    body?: any;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
    const { token, body, ...customConfig } = options;

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method: body ? 'POST' : 'GET',
        ...customConfig,
        headers: {
            ...headers,
            ...(customConfig.headers as Record<string, string>),
        },
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (response.ok) {
        return data;
    } else {
        throw new Error(data.message || data.error || 'Something went wrong');
    }
}