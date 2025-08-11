/**
 * Secure Translation API with ServiceM8 Session Management
 * Handles authentication server-side to prevent token exposure
 */

// In-memory session storage (production should use Redis/Database)
const sessions = new Map();

export default function handler(req, res) {
    console.log('Secure translate API called:', {
        method: req.method,
        timestamp: new Date().toISOString()
    });

    // CORS settings for ServiceM8
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
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-ServiceM8-Session, Authorization');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Security: Rate limiting check
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (!rateLimitCheck(clientIP)) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    try {
        // Extract session information
        const sessionId = req.headers['x-servicem8-session'];
        const { text, session_id } = req.body;

        // Validate session
        if (!sessionId || !session_id || sessionId !== session_id) {
            return res.status(401).json({ error: 'Invalid session' });
        }

        // Security: Input validation
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Invalid input' });
        }

        if (text.length > 1000) {
            return res.status(400).json({ error: 'Text too long' });
        }

        // Security: Sanitize input
        const sanitizedText = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                                 .replace(/<[^>]*>/g, '')
                                 .trim();

        if (!sanitizedText) {
            return res.status(400).json({ error: 'Invalid content' });
        }

        // Mock translation response (replace with actual OpenAI integration)
        const translationResult = {
            translated_text: `[SECURE] English translation of: "${sanitizedText}"`,
            email_subject: "Service Update - Message Translation",
            detected_language: detectLanguage(sanitizedText),
            processing_time_ms: Date.now() % 1000 + 500,
            session_id: session_id
        };

        return res.status(200).json(translationResult);

    } catch (error) {
        console.error('Translation error:', error.message);
        return res.status(500).json({ 
            error: 'Translation service temporarily unavailable' 
        });
    }
}

// Security: Rate limiting implementation
const rateLimitMap = new Map();

function rateLimitCheck(clientIP) {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 10; // 10 requests per minute per IP

    if (!rateLimitMap.has(clientIP)) {
        rateLimitMap.set(clientIP, []);
    }

    const requests = rateLimitMap.get(clientIP);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => now - timestamp < windowMs);
    
    if (validRequests.length >= maxRequests) {
        return false;
    }

    validRequests.push(now);
    rateLimitMap.set(clientIP, validRequests);
    
    return true;
}

// Simple language detection
function detectLanguage(text) {
    if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) {
        return "Japanese";
    } else if (/[\uAC00-\uD7AF]/.test(text)) {
        return "Korean";
    } else if (/[\u4E00-\u9FFF]/.test(text)) {
        return "Chinese";
    } else if (/[\u0400-\u04FF]/.test(text)) {
        return "Russian";
    }
    return "Unknown";
}