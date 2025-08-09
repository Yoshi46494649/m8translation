/**
 * Session Resolution API
 * Resolves secure session tokens to ServiceM8 credentials
 */

// Vercel will auto-detect this as a serverless function

export default async function handler(req, res) {
    // CORS and security headers
    res.setHeader('Access-Control-Allow-Origin', 'https://app.servicem8.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { session_token } = req.body;

        if (!session_token) {
            return res.status(400).json({ 
                error: 'Missing session token' 
            });
        }

        // Resolve session token
        const sessionData = resolveSessionToken(session_token);
        
        if (!sessionData) {
            return res.status(401).json({ 
                error: 'Invalid or expired session' 
            });
        }

        // Return only the necessary data for API calls
        return res.status(200).json({
            company_uuid: sessionData.company_uuid,
            access_token: sessionData.access_token,
            job_uuid: sessionData.job_uuid
        });

    } catch (error) {
        console.error('Session resolution error:', error);
        return res.status(500).json({ 
            error: 'Session service error' 
        });
    }
}

/**
 * Resolve session token to ServiceM8 credentials
 * In production, this should use Redis/KV store
 */
function resolveSessionToken(sessionToken) {
    if (!global.sessionStore) {
        return null;
    }

    const sessionData = global.sessionStore.get(sessionToken);
    
    if (!sessionData) {
        return null;
    }

    // Check expiration
    if (sessionData.expires_at < Date.now()) {
        global.sessionStore.delete(sessionToken);
        return null;
    }

    return sessionData;
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions() {
    if (!global.sessionStore) {
        return;
    }

    const now = Date.now();
    for (const [key, value] of global.sessionStore) {
        if (value.expires_at < now) {
            global.sessionStore.delete(key);
        }
    }
}