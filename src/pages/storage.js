// In-memory storage (localStorage yerine - Artifacts ortamıyla uyumlu)
const memStore = {};

export const STORAGE_KEYS = {
    ratings: 'vividai:ratings',
    favorites: 'vividai:favorites',
    history: 'vividai:history',
    searches: 'vividai:searches',
};

export function dbGet(key) {
    const val = memStore[key];
    if (val === undefined) return null;
    try {
        return JSON.parse(val);
    } catch {
        return null;
    }
}

export function dbSet(key, value) {
    memStore[key] = JSON.stringify(value);
}