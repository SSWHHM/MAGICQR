import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'magicqr_session_id';

export function getSessionId() {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
        id = uuidv4();
        localStorage.setItem(SESSION_KEY, id);
    }
    return id;
}

/**
 * Copies text to clipboard.
 * Strategy (in priority order):
 *   1. navigator.clipboard.writeText  — modern browsers, HTTPS only
 *   2. document.execCommand('copy')   — fallback for WebViews, older Safari,
 *                                       and any context where the Clipboard API
 *                                       is unavailable or blocked by permissions
 *
 * Returns true on success, false on complete failure.
 */
export async function copyToClipboard(text) {
    // --- Path 1: Modern async Clipboard API ---
    // Requires: HTTPS (or localhost) + user gesture + Permissions API grant
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Common failures:
            //  - NotAllowedError: permission denied (e.g. WebView without perm)
            //  - SecurityError: called outside a user gesture
            // Fall through to execCommand fallback below.
            console.warn('[clipboard] Modern API failed, trying execCommand:', err.name);
        }
    }

    // --- Path 2: Legacy execCommand fallback ---
    // Works in: older Safari, Android WebViews, UC Browser, in-app browsers
    // Must be called synchronously within a user gesture (we are, since this
    // function is always invoked from a click/tap handler).
    return _execCommandCopy(text);
}

function _execCommandCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    // Keep out of the viewport so it doesn't cause a scroll jump
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    // readOnly=false is required for iOS Safari to allow selection
    textarea.readOnly = false;

    document.body.appendChild(textarea);

    // iOS Safari requires a specific focus + setSelectionRange sequence
    textarea.focus();
    textarea.setSelectionRange(0, textarea.value.length);
    // Standard select for all other browsers
    textarea.select();

    let success = false;
    try {
        success = document.execCommand('copy');
        if (!success) {
            console.warn('[clipboard] execCommand returned false — copy may have failed');
        }
    } catch (err) {
        console.warn('[clipboard] execCommand threw:', err);
    } finally {
        document.body.removeChild(textarea);
    }

    return success;
}

export function openGoogleReview(placeId) {
    const url = `https://search.google.com/local/writereview?placeid=${placeId}`;
    window.open(url, '_blank', 'noopener');
}
