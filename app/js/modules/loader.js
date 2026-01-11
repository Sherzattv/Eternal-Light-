/**
 * loader.js - Dynamic data loading module
 * Implements lazy loading for Bible translation data
 */

// Cache for loaded translations
const loadedTranslations = new Map();

// Loading state tracking
const loadingPromises = new Map();

/**
 * Get a translation database, loading it if necessary
 * @param {string} code - Translation code (RST, NRT, KTB)
 * @returns {Promise<Object>} Translation database
 */
export async function getTranslation(code) {
    // Return from cache if available
    if (loadedTranslations.has(code)) {
        return loadedTranslations.get(code);
    }

    // Return existing promise if already loading
    if (loadingPromises.has(code)) {
        return loadingPromises.get(code);
    }

    // Check if already loaded globally (legacy support)
    const globalData = getGlobalData(code);
    if (globalData) {
        loadedTranslations.set(code, globalData);
        return globalData;
    }

    // Start loading
    const promise = loadTranslationData(code);
    loadingPromises.set(code, promise);

    try {
        const data = await promise;
        loadedTranslations.set(code, data);
        loadingPromises.delete(code);
        return data;
    } catch (error) {
        loadingPromises.delete(code);
        throw error;
    }
}

/**
 * Check for globally loaded data (from script tags)
 * @param {string} code 
 * @returns {Object|null}
 */
function getGlobalData(code) {
    switch (code) {
        case 'RST':
            return window.BIBLE_DATA || null;
        case 'NRT':
            return window.NRT_DATA || null;
        case 'KTB':
            return window.KTB_DATA || null;
        default:
            return null;
    }
}

/**
 * Load translation data dynamically
 * @param {string} code - Translation code
 * @returns {Promise<Object>}
 */
async function loadTranslationData(code) {
    const filename = getFilename(code);

    // For now, use script injection since data files aren't ES modules yet
    // In future (S2-02), this will use dynamic import()
    return new Promise((resolve, reject) => {
        // Check if already loaded
        const existing = getGlobalData(code);
        if (existing) {
            resolve(existing);
            return;
        }

        const script = document.createElement('script');
        script.src = `js/data/${filename}`;
        script.async = true;

        script.onload = () => {
            const data = getGlobalData(code);
            if (data) {
                resolve(data);
            } else {
                reject(new Error(`Failed to load ${code} data`));
            }
        };

        script.onerror = () => {
            reject(new Error(`Failed to load ${filename}`));
        };

        document.head.appendChild(script);
    });
}

/**
 * Get filename for translation code
 * @param {string} code 
 * @returns {string}
 */
function getFilename(code) {
    switch (code) {
        case 'RST':
            return 'bible_data.js';
        case 'NRT':
            return 'nrt_data.js';
        case 'KTB':
            return 'ktb_data.js';
        default:
            throw new Error(`Unknown translation: ${code}`);
    }
}

/**
 * Preload a translation in the background
 * @param {string} code - Translation code
 */
export function preloadTranslation(code) {
    if (loadedTranslations.has(code) || loadingPromises.has(code)) {
        return; // Already loaded or loading
    }

    // Use requestIdleCallback if available for non-blocking load
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            getTranslation(code).catch(err => {
                console.warn(`Preload failed for ${code}:`, err);
            });
        });
    } else {
        // Fallback: delay slightly
        setTimeout(() => {
            getTranslation(code).catch(err => {
                console.warn(`Preload failed for ${code}:`, err);
            });
        }, 1000);
    }
}

/**
 * Check if a translation is loaded
 * @param {string} code 
 * @returns {boolean}
 */
export function isLoaded(code) {
    return loadedTranslations.has(code) || getGlobalData(code) !== null;
}

/**
 * Check if a translation is currently loading
 * @param {string} code 
 * @returns {boolean}
 */
export function isLoading(code) {
    return loadingPromises.has(code);
}

/**
 * Get Kazakh book mapping if available
 * @returns {Object|null}
 */
export function getKtbBookMap() {
    return window.KTB_BOOK_MAP || null;
}

/**
 * Get loading progress info
 * @returns {Object} Loading status
 */
export function getLoadingStatus() {
    return {
        loaded: Array.from(loadedTranslations.keys()),
        loading: Array.from(loadingPromises.keys()),
        available: ['RST', 'NRT', 'KTB']
    };
}
