/**
 * Simple Test API - Always returns success response
 */

export default function handler(req, res) {
    console.log('Test API called:', {
        method: req.method,
        headers: req.headers,
        body: req.body
    });

    // CORS設定
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
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Always return success - no matter what
    const inputText = req.body?.text || 'test text';
    
    return res.status(200).json({
        translated_text: `[TEST SUCCESS] English translation of: "${inputText}"`,
        email_subject: "Test Translation - ServiceM8",
        detected_language: "Test Language",
        processing_time_ms: 100,
        status: "success",
        api_version: "test-v1"
    });
}