/**
 * Settings Management API
 * Handles OpenAI API key configuration and other user settings
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

export const config = {
    runtime: 'nodejs18.x',
    maxDuration: 10
};

export default async function handler(req, res) {
    // CORS and security headers
    res.setHeader('Access-Control-Allow-Origin', 'https://app.servicem8.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { company_uuid, access_token } = req.body || req.query;

        // Validate ServiceM8 authentication
        if (!company_uuid || !access_token) {
            return res.status(401).json({ 
                error: 'Missing authentication parameters' 
            });
        }

        // Validate ServiceM8 access token with API verification
        const isValidToken = await isValidServiceM8Token(access_token, company_uuid);
        if (!isValidToken) {
            return res.status(401).json({ 
                error: 'Invalid or expired ServiceM8 access token' 
            });
        }

        switch (req.method) {
            case 'GET':
                return await handleGetSettings(req, res, company_uuid);
            case 'POST':
            case 'PUT':
                return await handleUpdateSettings(req, res, company_uuid);
            default:
                return res.status(405).json({ error: 'Method not allowed' });
        }

    } catch (error) {
        console.error('Settings API error:', error);
        return res.status(500).json({
            error: 'Settings service error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Get current settings for a company
 */
async function handleGetSettings(req, res, companyUuid) {
    try {
        const settings = await getCompanySettings(companyUuid);
        
        // Never return sensitive data like API keys
        const safeSettings = {
            company_uuid: settings.company_uuid,
            has_openai_key: !!settings.openai_api_key,
            created_at: settings.created_at,
            updated_at: settings.updated_at,
            usage_count: settings.usage_count || 0,
            last_used: settings.last_used,
            translation_preferences: settings.translation_preferences || {
                default_tone: 'professional',
                include_context: true,
                auto_generate_subject: true
            },
            rate_limit_info: {
                current_window_requests: await getCurrentWindowRequests(companyUuid),
                max_requests_per_minute: 20,
                reset_time: getNextResetTime()
            }
        };

        return res.status(200).json(safeSettings);

    } catch (error) {
        console.error('Get settings error:', error);
        return res.status(500).json({ error: 'Failed to retrieve settings' });
    }
}

/**
 * Update settings for a company
 */
async function handleUpdateSettings(req, res, companyUuid) {
    try {
        const { openai_api_key, translation_preferences } = req.body;

        // Validate OpenAI API key if provided
        if (openai_api_key) {
            const isValidKey = await validateOpenAIApiKey(openai_api_key);
            if (!isValidKey) {
                return res.status(400).json({ 
                    error: 'Invalid OpenAI API key. Please check your key and try again.' 
                });
            }
        }

        // Validate translation preferences
        if (translation_preferences) {
            const validationError = validateTranslationPreferences(translation_preferences);
            if (validationError) {
                return res.status(400).json({ error: validationError });
            }
        }

        // Update settings
        const updatedSettings = await updateCompanySettings(companyUuid, {
            openai_api_key,
            translation_preferences,
            updated_at: new Date().toISOString()
        });

        // Log settings update
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Settings updated',
            company_uuid: companyUuid,
            has_openai_key: !!openai_api_key,
            preferences_updated: !!translation_preferences
        }));

        // Return success response (without sensitive data)
        return res.status(200).json({
            success: true,
            message: 'Settings updated successfully',
            has_openai_key: !!updatedSettings.openai_api_key,
            updated_at: updatedSettings.updated_at
        });

    } catch (error) {
        console.error('Update settings error:', error);
        return res.status(500).json({ error: 'Failed to update settings' });
    }
}

/**
 * Get company settings from storage
 */
async function getCompanySettings(companyUuid) {
    // In production, retrieve from Vercel KV or database
    // For now, return default settings
    
    const defaultSettings = {
        company_uuid: companyUuid,
        openai_api_key: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        last_used: null,
        translation_preferences: {
            default_tone: 'professional',
            include_context: true,
            auto_generate_subject: true,
            preferred_formality: 'business',
            custom_instructions: ''
        }
    };

    // TODO: Implement actual KV storage retrieval
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        // Implement KV retrieval here
        console.log('Retrieving settings from KV store (placeholder)');
    }

    return defaultSettings;
}

/**
 * Update company settings in storage
 */
async function updateCompanySettings(companyUuid, updates) {
    const currentSettings = await getCompanySettings(companyUuid);
    
    const updatedSettings = {
        ...currentSettings,
        ...updates
    };

    // Encrypt sensitive data
    if (updates.openai_api_key) {
        updatedSettings.openai_api_key = encryptApiKey(updates.openai_api_key);
    }

    // TODO: Implement actual KV storage update
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
        // Implement KV update here
        console.log('Updating settings in KV store (placeholder)');
    }

    return updatedSettings;
}

/**
 * Validate OpenAI API key by making a test request
 */
async function validateOpenAIApiKey(apiKey) {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        return response.ok;
    } catch (error) {
        console.error('OpenAI key validation error:', error);
        return false;
    }
}

/**
 * Validate translation preferences object
 */
function validateTranslationPreferences(preferences) {
    const validTones = ['professional', 'casual', 'formal', 'friendly'];
    const validFormalities = ['business', 'casual', 'formal'];

    if (preferences.default_tone && !validTones.includes(preferences.default_tone)) {
        return `Invalid default_tone. Must be one of: ${validTones.join(', ')}`;
    }

    if (preferences.preferred_formality && !validFormalities.includes(preferences.preferred_formality)) {
        return `Invalid preferred_formality. Must be one of: ${validFormalities.join(', ')}`;
    }

    if (preferences.custom_instructions && preferences.custom_instructions.length > 500) {
        return 'Custom instructions must be 500 characters or less';
    }

    return null;
}

/**
 * Encrypt API key for storage with proper AES-256-GCM
 */
function encryptApiKey(apiKey) {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY;
    
    if (!secretKey || secretKey.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters');
    }
    
    // Use a random salt for each encryption
    const salt = crypto.randomBytes(16);
    const key = crypto.scryptSync(secretKey, salt, 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipherGCM(algorithm, key, iv);
    
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
        encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm
    };
}

/**
 * Decrypt API key from storage with proper validation
 */
function decryptApiKey(encryptedData) {
    if (typeof encryptedData === 'string') {
        // For development only - never use unencrypted keys in production
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Unencrypted API keys not allowed in production');
        }
        return encryptedData;
    }

    if (!encryptedData.salt || !encryptedData.iv || !encryptedData.authTag || !encryptedData.encrypted) {
        throw new Error('Invalid encrypted data format');
    }

    const algorithm = encryptedData.algorithm || 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY;
    
    if (!secretKey || secretKey.length < 32) {
        throw new Error('ENCRYPTION_KEY must be at least 32 characters');
    }
    
    try {
        const salt = Buffer.from(encryptedData.salt, 'hex');
        const key = crypto.scryptSync(secretKey, salt, 32);
        const iv = Buffer.from(encryptedData.iv, 'hex');
        
        const decipher = crypto.createDecipherGCM(algorithm, key, iv);
        decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
        
        let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        throw new Error('Failed to decrypt API key: ' + error.message);
    }
}

/**
 * Get current window request count for rate limiting
 */
async function getCurrentWindowRequests(companyUuid) {
    // This should be implemented with actual rate limiting storage
    return Math.floor(Math.random() * 10); // Placeholder
}

/**
 * Get next rate limit reset time
 */
function getNextResetTime() {
    const now = new Date();
    const nextMinute = new Date(now);
    nextMinute.setSeconds(0);
    nextMinute.setMilliseconds(0);
    nextMinute.setMinutes(nextMinute.getMinutes() + 1);
    
    return nextMinute.toISOString();
}

/**
 * ServiceM8 token validation with proper API verification
 */
async function isValidServiceM8Token(token, companyUuid) {
    if (!token || token.length < 20 || !token.startsWith('AT_')) {
        return false;
    }
    
    try {
        // Verify token with ServiceM8 API
        const response = await fetch('https://api.servicem8.com/v1/company.json', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            },
            timeout: 5000
        });
        
        if (!response.ok) {
            return false;
        }
        
        const companyData = await response.json();
        return companyData.uuid === companyUuid;
        
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
}

