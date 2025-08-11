/**
 * Simple Translation API for debugging ServiceM8 integration
 * Minimal implementation following ServiceM8 guidelines
 */

// Vercel runtime configuration
export const config = {
    runtime: 'nodejs',
    maxDuration: 10
};

export default async function handler(req, res) {
    console.log('=== Simple Translation API Debug ===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    // CORS設定 - ServiceM8互換
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
    
    // HTTPS強制
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        console.log('Preflight request handled');
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        console.log('Method not allowed:', req.method);
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get text from request
        const { text } = req.body || {};
        
        if (!text) {
            return res.status(400).json({ 
                error: 'Missing text parameter' 
            });
        }

        console.log('Text to translate:', text);

        // Check OpenAI API key
        const openaiApiKey = process.env.OPENAI_API_KEY;
        console.log('OpenAI API key status:', openaiApiKey ? `Present (${openaiApiKey.length} chars)` : 'Missing');

        if (!openaiApiKey) {
            console.log('Using mock response - no API key');
            return res.status(200).json({
                translated_text: `[MOCK] English translation of: ${text}`,
                email_subject: "Translation Test - ServiceM8",
                detected_language: "Auto-detected",
                processing_time_ms: 100
            });
        }

        // Simple OpenAI API call
        console.log('Making OpenAI API request...');
        
        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a translator. Translate the given text to English and respond only in JSON format: {"translated_text": "...", "email_subject": "...", "detected_language": "..."}'
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ],
                temperature: 0.3,
                max_tokens: 500
            })
        });

        console.log('OpenAI response status:', openaiResponse.status);

        if (!openaiResponse.ok) {
            const errorData = await openaiResponse.json().catch(() => ({}));
            console.error('OpenAI API error:', errorData);
            
            return res.status(200).json({
                translated_text: `[FALLBACK] English translation of: ${text}`,
                email_subject: "Translation Service - ServiceM8",
                detected_language: "Unknown",
                processing_time_ms: 200,
                note: "Used fallback due to API error"
            });
        }

        const data = await openaiResponse.json();
        console.log('OpenAI response data:', JSON.stringify(data, null, 2));
        
        const content = data.choices[0]?.message?.content;
        
        if (!content) {
            console.error('No content in OpenAI response');
            return res.status(200).json({
                translated_text: `[FALLBACK] English translation of: ${text}`,
                email_subject: "Translation Service - ServiceM8",
                detected_language: "Unknown",
                processing_time_ms: 300
            });
        }

        try {
            const result = JSON.parse(content);
            console.log('Parsed result:', result);
            
            return res.status(200).json({
                translated_text: result.translated_text || `Translation of: ${text}`,
                email_subject: result.email_subject || "ServiceM8 Translation",
                detected_language: result.detected_language || "Unknown",
                processing_time_ms: 500
            });
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            console.log('Raw content:', content);
            
            return res.status(200).json({
                translated_text: content,
                email_subject: "ServiceM8 Translation",
                detected_language: "Unknown",
                processing_time_ms: 600
            });
        }

    } catch (error) {
        console.error('Critical error:', error);
        console.error('Error stack:', error.stack);
        
        return res.status(200).json({
            translated_text: `[ERROR FALLBACK] Could not translate: ${req.body?.text || 'unknown text'}`,
            email_subject: "Translation Error - ServiceM8",
            detected_language: "Error",
            processing_time_ms: 0,
            error_message: error.message
        });
    }
}