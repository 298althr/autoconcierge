const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

if (!API_URL && typeof window !== 'undefined') {
    console.warn('⚠️ NEXT_PUBLIC_API_URL is not set. API calls may fail if not on the same domain.');
}

interface ApiOptions extends RequestInit {
    token?: string | null;
    body?: any;
}

export function getAssetUrl(path: string | null | undefined) {
    if (!path) return '/logo/placeholder-car.jpg';
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const base = API_URL.replace(/\/api$/, '');
    return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

export function getVehicleImages(images: any): string[] {
    if (!images) return [];
    if (Array.isArray(images)) return images;

    if (typeof images === 'string') {
        // Try JSON parse first
        if (images.startsWith('[') || images.startsWith('{')) {
            try {
                const parsed = JSON.parse(images);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                // fall through to plain string check
            }
        }
        // If it's a comma-separated list or just a single URL
        if (images.includes(',')) return images.split(',').map(s => s.trim());
        return [images.trim()];
    }

    return [];
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
    const { token, body, ...customConfig } = options;
    const url = `${API_URL}${endpoint}`;

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

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (response.ok) {
            return data;
        } else {
            throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
        }
    } catch (err: any) {
        console.error(`[apiFetch Error] ${endpoint}:`, err.message);
        if (err.message === 'Failed to fetch') {
            throw new Error(`API Connection Failed: Attempted to reach [${url}]. Ensure NEXT_PUBLIC_API_URL is set in Railway for the frontend service and you have RE-DEPLOYED after setting it.`);
        }
        throw err;
    }
}
