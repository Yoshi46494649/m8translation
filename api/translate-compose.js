/**
 * Main Entry Point for ServiceM8 Translation Add-on
 * Serves the translation interface HTML page
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Vercel will auto-detect this as a serverless function

module.exports = async function handler(req, res) {
    // Security headers for iframe embedding
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // CORS headers for ServiceM8
    res.setHeader('Access-Control-Allow-Origin', 'https://app.servicem8.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Extract ServiceM8 context from query parameters
        const { job_uuid, company_uuid, access_token } = req.query;

        // Basic validation of required parameters
        if (!company_uuid || !access_token) {
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Authorization Required</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                        .error { color: #dc3545; }
                        .container { max-width: 400px; margin: 0 auto; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="error">Authorization Required</h1>
                        <p>Missing ServiceM8 authentication parameters.</p>
                        <p>Please ensure the add-on is properly installed and authorized.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // Log access (for monitoring and analytics)
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Translation interface accessed',
            company_uuid,
            job_uuid: job_uuid || 'none',
            user_agent: req.headers['user-agent'],
            ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress
        }));

        // Read the HTML template
        const htmlPath = path.join(process.cwd(), 'public', 'translate-compose.html');
        let htmlContent;

        try {
            htmlContent = fs.readFileSync(htmlPath, 'utf8');
        } catch (error) {
            console.error('Failed to read HTML template:', error);
            return res.status(500).send('Internal server error');
        }

        // Create secure session token instead of exposing access_token
        const sessionToken = crypto.randomBytes(32).toString('hex');
        
        // Store session mapping securely (in production, use Redis/KV)
        // This is a critical security fix - never expose access_token to client
        if (!global.sessionStore) {
            global.sessionStore = new Map();
        }
        global.sessionStore.set(sessionToken, {
            company_uuid,
            access_token,
            job_uuid,
            expires_at: Date.now() + (30 * 60 * 1000) // 30 minutes
        });
        
        // Clean up expired sessions
        for (const [key, value] of global.sessionStore) {
            if (value.expires_at < Date.now()) {
                global.sessionStore.delete(key);
            }
        }

        // Inject ServiceM8 context and configuration (secure version)
        const injectedHtml = injectConfiguration(htmlContent, {
            job_uuid,
            company_uuid,
            session_token: sessionToken, // Use session token instead of access_token
            api_base_url: `https://${req.headers.host}`,
            servicem8_context: {
                job_uuid,
                company_uuid,
                session_token: sessionToken, // Never expose access_token to client
                timestamp: new Date().toISOString()
            }
        });

        // Set appropriate content type and caching headers
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        return res.status(200).send(injectedHtml);

    } catch (error) {
        console.error('Translation interface error:', error);
        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Service Error</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                    .error { color: #dc3545; }
                    .container { max-width: 400px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="error">Service Temporarily Unavailable</h1>
                    <p>Please try again in a few moments.</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
            </body>
            </html>
        `);
    }
}

/**
 * Inject configuration and context into HTML template
 */
function injectConfiguration(htmlContent, config) {
    // Create secure configuration script (NO ACCESS TOKEN EXPOSED)
    const configScript = `
    <script>
        // ServiceM8 Translation Add-on Configuration (Secure Version)
        window.SERVICEM8_CONFIG = {
            job_uuid: ${JSON.stringify(config.job_uuid)},
            company_uuid: ${JSON.stringify(config.company_uuid)},
            session_token: ${JSON.stringify(config.session_token)}, // Secure session token only
            api_base_url: ${JSON.stringify(config.api_base_url)},
            version: "1.0.0",
            timestamp: ${JSON.stringify(config.servicem8_context.timestamp)}
        };
        
        // Initialize context on page load
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof TranslationApp !== 'undefined') {
                window.translationApp = new TranslationApp();
            }
        });
    </script>
    `;

    // Inject configuration before closing head tag
    const injectedHtml = htmlContent.replace(
        '</head>',
        `    ${configScript}\n</head>`
    );

    return injectedHtml;
}

/**
 * Validate ServiceM8 request parameters
 */
function validateServiceM8Request(params) {
    const { company_uuid, access_token } = params;

    // Basic validation
    if (!company_uuid || !access_token) {
        return {
            valid: false,
            error: 'Missing required ServiceM8 parameters'
        };
    }

    // Validate company_uuid format (basic UUID validation)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(company_uuid)) {
        return {
            valid: false,
            error: 'Invalid company UUID format'
        };
    }

    // Validate access_token format
    if (!access_token.startsWith('AT_') || access_token.length < 20) {
        return {
            valid: false,
            error: 'Invalid access token format'
        };
    }

    return { valid: true };
}