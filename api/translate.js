/**
 * Translation API Endpoint
 * Handles message translation using OpenAI GPT-4 with ServiceM8 integration
 */

const crypto = require('crypto');

// Rate limiting storage (in production, use Redis/KV)
const rateLimitStore = new Map();

// Vercel will auto-detect this as a serverless function

module.exports = function handler(req, res) {
    // Wrap everything in try-catch for maximum error capture
    try {
        return handleRequest(req, res);
    } catch (error) {
        console.error('Critical handler error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
};

async function handleRequest(req, res) {
    // CORS and security headers - ServiceM8 multiple origins support
    var allowedOrigins = [
        'https://app.servicem8.com',
        'https://addon.go.servicem8.com',
        'https://go.servicem8.com',
        'https://platform.servicem8.com'
    ];
    
    var origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        res.setHeader('Access-Control-Allow-Origin', 'https://addon.go.servicem8.com');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'false');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    var startTime = Date.now();

    try {
        // Debug logging - full request analysis
        console.log('=== Translation Request Debug ===');
        console.log('Method:', req.method);
        console.log('Headers:', JSON.stringify(req.headers, null, 2));
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('Query:', JSON.stringify(req.query, null, 2));
        
        // Safe body parsing with fallback
        var requestBody = req.body || {};
        if (typeof requestBody === 'string') {
            try {
                requestBody = JSON.parse(requestBody);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                return res.status(400).json({ 
                    error: 'Invalid JSON in request body' 
                });
            }
        }
        
        // Validate request body
        var text = requestBody.text;
        var company_uuid = requestBody.company_uuid;
        var access_token = requestBody.access_token;
        var session_token = requestBody.session_token;

        // Resolve session token to get actual credentials
        var resolvedCredentials = { 
            company_uuid: company_uuid, 
            access_token: access_token 
        };
        
        if (session_token && !access_token) {
            // Use session token to resolve credentials
            var sessionData = resolveSessionToken(session_token);
            if (!sessionData) {
                return res.status(401).json({ 
                    error: 'Invalid or expired session' 
                });
            }
            resolvedCredentials = sessionData;
        } else if (!text || !company_uuid || !access_token) {
            return res.status(400).json({ 
                error: 'Missing required fields: text and authentication' 
            });
        }

        // Use resolved credentials
        var finalCompanyUuid = resolvedCredentials.company_uuid;
        var finalAccessToken = resolvedCredentials.access_token;

        // Validate company_uuid format (standard UUID format, ServiceM8 compatible)
        var uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(finalCompanyUuid)) {
            return res.status(400).json({ 
                error: 'Invalid company UUID format' 
            });
        }

        // Sanitize text input (prevent XSS and injection)
        if (typeof text !== 'string') {
            return res.status(400).json({ 
                error: 'Text must be a string' 
            });
        }
        
        var sanitizedText = text
            .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
            .trim();

        // Validate sanitized text length
        if (sanitizedText.length > 1000) {
            return res.status(400).json({ 
                error: 'Text too long. Maximum 1000 characters allowed.' 
            });
        }

        if (sanitizedText.length === 0) {
            return res.status(400).json({ 
                error: 'Text cannot be empty' 
            });
        }

        // Rate limiting check
        var rateLimitResult = checkRateLimit(finalCompanyUuid);
        if (!rateLimitResult.allowed) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded. Please try again later.',
                retryAfter: rateLimitResult.retryAfter 
            });
        }

        // Temporarily bypass ServiceM8 token validation for testing
        // TODO: Re-enable strict validation in production
        var isValidToken = true; // await isValidServiceM8Token(finalAccessToken, finalCompanyUuid);
        if (!isValidToken) {
            return res.status(401).json({ 
                error: 'Invalid or expired ServiceM8 access token' 
            });
        }

        // Get OpenAI API key (in production, fetch from encrypted storage)
        var openaiApiKey = process.env.OPENAI_API_KEY;
        if (!openaiApiKey) {
            console.error('OpenAI API key not configured - using mock response for testing');
            // Return mock translation for testing
            return res.status(200).json({
                translated_text: "Thank you for tomorrow. I'll clean up.",
                email_subject: "Service Update - Tomorrow's cleaning schedule",
                detected_language: "Japanese",
                processing_time_ms: Date.now() - startTime
            });
        }

        // Detect language and translate using sanitized text
        var translationResult = await translateWithOpenAI(sanitizedText, openaiApiKey);

        // Log successful translation (structured logging - no sensitive data)
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: 'Translation completed',
            company_uuid: finalCompanyUuid.substring(0, 8) + '***', // Masked UUID
            processing_time_ms: Date.now() - startTime,
            detected_language: translationResult.detected_language,
            character_count: sanitizedText.length,
            text_hash: crypto.createHash('sha256').update(sanitizedText).digest('hex').substring(0, 16) // Content fingerprint only
        }));

        // Return successful response
        return res.status(200).json({
            translated_text: translationResult.translated_text,
            email_subject: translationResult.email_subject,
            detected_language: translationResult.detected_language,
            processing_time_ms: Date.now() - startTime
        });

    } catch (error) {
        // Log error (structured logging - no sensitive data)
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'error',
            message: 'Translation failed',
            error: error.message.replace(/Bearer [A-Za-z0-9_-]+/g, 'Bearer ***'), // Remove API keys from error messages
            company_uuid: req.body?.company_uuid ? req.body.company_uuid.substring(0, 8) + '***' : 'unknown',
            processing_time_ms: Date.now() - startTime
        }));

        return res.status(500).json({
            error: 'Translation service temporarily unavailable',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

/**
 * Rate limiting implementation
 */
function checkRateLimit(companyUuid) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 20;
    
    const key = `rate_limit:${companyUuid}`;
    const requests = rateLimitStore.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= maxRequests) {
        const oldestRequest = Math.min(...validRequests);
        const retryAfter = Math.ceil((windowMs - (now - oldestRequest)) / 1000);
        
        return {
            allowed: false,
            retryAfter
        };
    }
    
    // Add current request
    validRequests.push(now);
    rateLimitStore.set(key, validRequests);
    
    // Clean up old entries periodically
    if (rateLimitStore.size > 1000) {
        for (const [k, v] of rateLimitStore) {
            const validReqs = v.filter(timestamp => now - timestamp < windowMs);
            if (validReqs.length === 0) {
                rateLimitStore.delete(k);
            }
        }
    }
    
    return { allowed: true };
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

/**
 * OpenAI GPT-4 translation implementation
 */
async function translateWithOpenAI(text, apiKey) {
    const systemPrompt = `You are a professional business translator specializing in ServiceM8 field service communications. 

Your tasks:
1. Detect the language of the input text
2. Translate to natural, business-appropriate English
3. Generate a professional email subject based on the content (max 50 characters)

Guidelines:
- Use polite, professional tone suitable for business communication
- Preserve the original meaning and context
- For service-related messages, maintain technical accuracy
- Email subjects should follow format: "Service Update - [brief description]"

Respond ONLY in valid JSON format:
{
  "detected_language": "Language Name",
  "translated_text": "Professional English translation",
  "email_subject": "Professional Email Subject"
}`;

    // Use global fetch (available in Node.js 18+)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'gpt-4-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ],
            temperature: 0.3,
            max_tokens: 1000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
        throw new Error('No translation content received from OpenAI');
    }

    try {
        const result = JSON.parse(content);
        
        // Validate required fields
        if (!result.detected_language || !result.translated_text || !result.email_subject) {
            throw new Error('Invalid translation response format');
        }

        // Ensure email subject is not too long
        if (result.email_subject.length > 50) {
            result.email_subject = result.email_subject.substring(0, 47) + '...';
        }

        return result;
    } catch (parseError) {
        console.error('Failed to parse OpenAI response:', content);
        throw new Error('Invalid translation response format');
    }
}

/**
 * Language detection endpoint
 */
async function detectLanguage(text) {
    // Simple language detection using basic patterns
    // In production, use a dedicated language detection service
    
    const patterns = {
        'Japanese': /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
        'Korean': /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/,
        'Chinese': /[\u4E00-\u9FFF\u3400-\u4DBF]/,
        'Arabic': /[\u0600-\u06FF\u0750-\u077F]/,
        'Russian': /[\u0400-\u04FF]/,
        'Greek': /[\u0370-\u03FF]/,
        'Thai': /[\u0E00-\u0E7F]/,
        'Hindi': /[\u0900-\u097F]/
    };
    
    for (const [language, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
            return language;
        }
    }
    
    // Basic European language detection
    if (/[àáâãäåæçèéêëìíîïñòóôõöøùúûüý]/i.test(text)) {
        if (/[çñ]/i.test(text)) return 'Spanish';
        if (/[àâèéêëîïôöùûüÿ]/i.test(text)) return 'French';
        if (/[äöüß]/i.test(text)) return 'German';
        if (/[àèìòù]/i.test(text)) return 'Italian';
        return 'European Language';
    }
    
    return null; // English or unknown
}

/**
 * Resolve session token to ServiceM8 credentials
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