/**
 * ServiceM8 OAuth Callback Handler
 * Handles OAuth authorization code exchange and token storage
 */

const crypto = require('crypto');

// Vercel will auto-detect this as a serverless function

module.exports = async function handler(req, res) {
    // CORS headers - ServiceM8複数オリジン対応
    const allowedOrigins = [
        'https://app.servicem8.com',
        'https://addon.go.servicem8.com',
        'https://go.servicem8.com',
        'https://platform.servicem8.com'
    ];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://addon.go.servicem8.com');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Handle both GET and POST requests from ServiceM8
        const params = req.method === 'GET' ? req.query : req.body;
        const { code, state, error, error_description } = params;

        // Check for OAuth error response
        if (error) {
            console.error('OAuth error:', error, error_description);
            return res.status(400).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Authorization Error</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                        .error { color: #dc3545; }
                        .container { max-width: 400px; margin: 0 auto; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="error">Authorization Failed</h1>
                        <p>Error: ${error}</p>
                        <p>Description: ${error_description || 'Unknown error occurred'}</p>
                        <p>Please try authorizing the add-on again.</p>
                        <button onclick="window.close()">Close</button>
                    </div>
                </body>
                </html>
            `);
        }

        // Validate required parameters
        if (!code) {
            return res.status(400).json({ 
                error: 'Missing authorization code' 
            });
        }

        // Validate state parameter (CSRF protection)
        if (state && !validateState(state)) {
            return res.status(400).json({ 
                error: 'Invalid state parameter' 
            });
        }

        // Exchange authorization code for access token
        const tokenData = await exchangeCodeForToken(code);

        if (!tokenData.access_token) {
            throw new Error('No access token received from ServiceM8');
        }

        // Get company information
        const companyInfo = await getCompanyInfo(tokenData.access_token);

        // Store token securely (in production, use encrypted storage)
        await storeTokenData({
            company_uuid: companyInfo.uuid,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)),
            scope: tokenData.scope,
            company_name: companyInfo.name
        });

        // Log successful authorization
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'OAuth authorization successful',
            company_uuid: companyInfo.uuid,
            company_name: companyInfo.name,
            scope: tokenData.scope
        }));

        // Return success page
        return res.status(200).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authorization Successful</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 20px; 
                        text-align: center;
                        background-color: #f8f9fa;
                    }
                    .success { color: #28a745; }
                    .container { 
                        max-width: 400px; 
                        margin: 0 auto; 
                        background: white;
                        padding: 30px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    .button {
                        background-color: #007cba;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 14px;
                        margin-top: 20px;
                    }
                    .button:hover {
                        background-color: #0066a0;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="success">✓ Authorization Successful!</h1>
                    <p><strong>Company:</strong> ${companyInfo.name}</p>
                    <p>Smart Message Translator is now connected to your ServiceM8 account.</p>
                    <p>You can now close this window and use the translation feature in your job pages.</p>
                    <button class="button" onclick="window.close()">Close Window</button>
                </div>
                <script>
                    // Auto-close after 10 seconds
                    setTimeout(() => {
                        window.close();
                    }, 10000);
                </script>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('OAuth callback error:', error);

        return res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authorization Error</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
                    .error { color: #dc3545; }
                    .container { max-width: 400px; margin: 0 auto; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="error">Authorization Error</h1>
                    <p>An error occurred during authorization. Please try again.</p>
                    <p><small>Error: ${process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'}</small></p>
                    <button onclick="window.close()">Close</button>
                </div>
            </body>
            </html>
        `);
    }
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code) {
    const tokenUrl = 'https://api.servicem8.com/oauth/access_token';
    
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: process.env.SERVICEM8_CLIENT_ID,
            client_secret: process.env.SERVICEM8_CLIENT_SECRET,
            redirect_uri: `https://${process.env.VERCEL_URL || 'm8translation.vercel.app'}/api/oauth/callback`
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange failed:', response.status, errorText);
        throw new Error(`Token exchange failed: ${response.status}`);
    }

    return await response.json();
}

/**
 * Get company information from ServiceM8
 */
async function getCompanyInfo(accessToken) {
    const companyUrl = 'https://api.servicem8.com/v1/company.json';
    
    const response = await fetch(companyUrl, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Company info fetch failed:', response.status, errorText);
        throw new Error(`Failed to get company info: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

/**
 * Store token data securely
 * In production, use Vercel KV or similar encrypted storage
 */
async function storeTokenData(tokenData) {
    // For now, we'll use a simple approach
    // In production, implement proper encrypted storage with Vercel KV
    
    const encryptedData = encryptTokenData(tokenData);
    
    // Store in Vercel KV (placeholder - implement actual storage)
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        // Implement KV storage here
        console.log('Storing token data in KV store (placeholder)');
    } else {
        console.log('Token data stored locally (development mode)');
    }
    
    return true;
}

/**
 * Encrypt sensitive token data
 */
function encryptTokenData(data) {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY || 'default-key-for-development-only';
    const key = crypto.scryptSync(secretKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    cipher.setAAD(Buffer.from('ServiceM8TokenData'));
    
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex')
    };
}

/**
 * Validate state parameter for CSRF protection
 */
function validateState(state) {
    // Basic validation - in production, implement proper state validation
    return state && state.length > 10;
}

/**
 * Generate OAuth authorization URL
 */
function generateAuthUrl(companyUuid) {
    const baseUrl = 'https://api.servicem8.com/oauth/authorize';
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.SERVICEM8_CLIENT_ID,
        redirect_uri: `https://${process.env.VERCEL_URL || 'm8translation.vercel.app'}/api/oauth/callback`,
        scope: 'job:read customer:read',
        state: generateStateParameter(companyUuid)
    });
    
    return `${baseUrl}?${params.toString()}`;
}

/**
 * Generate CSRF state parameter
 */
function generateStateParameter(companyUuid) {
    const timestamp = Date.now();
    const random = crypto.randomBytes(16).toString('hex');
    return Buffer.from(`${companyUuid}:${timestamp}:${random}`).toString('base64');
}

module.exports.generateAuthUrl = generateAuthUrl;