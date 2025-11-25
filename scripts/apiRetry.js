/**
 * API Retry Utility
 * Implements exponential backoff for failed API requests
 */

import configPromise from './config.js';

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if HTTP status code is retryable
 * @param {number} status - HTTP status code
 * @param {Array<number>} retryableStatusCodes - List of retryable status codes
 * @returns {boolean}
 */
function isRetryableStatus(status, retryableStatusCodes) {
    return retryableStatusCodes.includes(status);
}

/**
 * Calculate delay for retry attempt using exponential backoff
 * @param {number} attempt - Current attempt number (0-based)
 * @param {number} initialDelay - Initial delay in milliseconds
 * @param {number} multiplier - Backoff multiplier
 * @param {number} maxDelay - Maximum delay in milliseconds
 * @returns {number} Delay in milliseconds
 */
function calculateBackoffDelay(attempt, initialDelay, multiplier, maxDelay) {
    const delay = initialDelay * Math.pow(multiplier, attempt);
    return Math.min(delay, maxDelay);
}

/**
 * Fetch with retry and exponential backoff
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @param {Object} retryConfig - Optional retry configuration override
 * @returns {Promise<Response>} Fetch response
 * 
 * @example
 * const response = await fetchWithRetry('/api/data', {
 *   method: 'GET',
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 * 
 * @example Retry policy with default config (API_MAX_RETRIES=3, multiplier=2, initial=1000ms):
 * - Attempt 1: Immediate
 * - Attempt 2: Wait 1000ms (1s)
 * - Attempt 3: Wait 2000ms (2s)
 * - Attempt 4: Wait 4000ms (4s)
 * Total max time: ~7 seconds
 */
export async function fetchWithRetry(url, options = {}, retryConfig = null) {
    const config = retryConfig || await configPromise;
    
    const {
        apiMaxRetries,
        apiRetryInitialDelayMs,
        apiRetryBackoffMultiplier,
        apiRetryMaxDelayMs,
        apiRetryableStatusCodes,
        verboseApiLogging,
    } = config;
    
    let lastError = null;
    
    for (let attempt = 0; attempt <= apiMaxRetries; attempt++) {
        try {
            if (verboseApiLogging) {
                console.log(`[API] Attempt ${attempt + 1}/${apiMaxRetries + 1}: ${options.method || 'GET'} ${url}`);
            }
            
            const response = await fetch(url, options);
            
            // Check if response is retryable
            if (!response.ok && isRetryableStatus(response.status, apiRetryableStatusCodes)) {
                // This is a retryable error
                if (attempt < apiMaxRetries) {
                    const delay = calculateBackoffDelay(
                        attempt,
                        apiRetryInitialDelayMs,
                        apiRetryBackoffMultiplier,
                        apiRetryMaxDelayMs
                    );
                    
                    if (verboseApiLogging) {
                        console.warn(
                            `[API] Retryable error ${response.status} on attempt ${attempt + 1}. ` +
                            `Retrying in ${delay}ms...`
                        );
                    }
                    
                    await sleep(delay);
                    continue; // Retry
                } else {
                    // Max retries reached
                    if (verboseApiLogging) {
                        console.error(`[API] Max retries (${apiMaxRetries}) reached for ${url}`);
                    }
                    return response; // Return failed response
                }
            }
            
            // Success or non-retryable error
            if (verboseApiLogging && response.ok) {
                console.log(`[API] Success on attempt ${attempt + 1}: ${response.status} ${url}`);
            }
            
            return response;
            
        } catch (error) {
            // Network error or other exception
            lastError = error;
            
            if (attempt < apiMaxRetries) {
                const delay = calculateBackoffDelay(
                    attempt,
                    apiRetryInitialDelayMs,
                    apiRetryBackoffMultiplier,
                    apiRetryMaxDelayMs
                );
                
                if (verboseApiLogging) {
                    console.warn(
                        `[API] Network error on attempt ${attempt + 1}: ${error.message}. ` +
                        `Retrying in ${delay}ms...`
                    );
                }
                
                await sleep(delay);
                continue; // Retry
            } else {
                // Max retries reached, throw error
                if (verboseApiLogging) {
                    console.error(`[API] Max retries (${apiMaxRetries}) reached. Throwing error.`);
                }
                throw lastError;
            }
        }
    }
    
    // Should never reach here, but just in case
    throw lastError || new Error('Unexpected error in fetchWithRetry');
}

