/**
 * Language Detection API Endpoint
 * Lightweight language detection for real-time UI feedback
 */

export const config = {
    runtime: 'nodejs18.x',
    maxDuration: 5
};

export default async function handler(req, res) {
    // CORS and security headers
    res.setHeader('Access-Control-Allow-Origin', 'https://app.servicem8.com');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Frame-Options', 'ALLOWALL');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Text is required' });
        }

        if (text.length < 3) {
            return res.status(200).json({ language: null });
        }

        const detectedLanguage = detectLanguage(text);
        
        return res.status(200).json({ 
            language: detectedLanguage,
            confidence: detectedLanguage ? 'high' : 'low'
        });

    } catch (error) {
        console.error('Language detection error:', error);
        return res.status(500).json({ 
            error: 'Language detection failed',
            language: null 
        });
    }
}

/**
 * Simple pattern-based language detection
 */
function detectLanguage(text) {
    const cleanText = text.trim().toLowerCase();
    
    // Character-based detection for non-Latin scripts
    const patterns = {
        'Japanese': /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/,
        'Korean': /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/,
        'Chinese (Simplified)': /[\u4E00-\u9FFF]/,
        'Arabic': /[\u0600-\u06FF\u0750-\u077F]/,
        'Russian': /[\u0400-\u04FF]/,
        'Greek': /[\u0370-\u03FF]/,
        'Thai': /[\u0E00-\u0E7F]/,
        'Hindi': /[\u0900-\u097F]/,
        'Hebrew': /[\u0590-\u05FF]/,
        'Armenian': /[\u0530-\u058F]/
    };
    
    // Check character-based patterns first (most reliable)
    for (const [language, pattern] of Object.entries(patterns)) {
        if (pattern.test(text)) {
            // For Chinese, try to distinguish between Simplified and Traditional
            if (language === 'Chinese (Simplified)') {
                // Check for Traditional Chinese specific characters
                if (/[\u9FA0-\u9FFF\uF900-\uFAFF]/.test(text)) {
                    return 'Chinese (Traditional)';
                }
                return 'Chinese (Simplified)';
            }
            return language;
        }
    }
    
    // Latin script language detection using common words and patterns
    const europeanPatterns = {
        'Spanish': {
            chars: /[ñáéíóúü]/i,
            words: /\b(el|la|de|que|y|es|en|un|se|no|te|lo|por|con|su|para|como|pero|muy|todo|si|ya|voy|más|día|qué|cómo|dónde|cuándo|por qué|gracias|hola|adiós)\b/i
        },
        'French': {
            chars: /[àâèéêëîïôöùûüÿç]/i,
            words: /\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas|tout|plus|par|grand|il|me|même|faire|ça|très|où|quand|comment|pourquoi|merci|bonjour|au revoir)\b/i
        },
        'German': {
            chars: /[äöüß]/i,
            words: /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine|als|auch|es|an|werden|aus|er|hat|dass|sie|nach|wird|bei|einer|um|am|sind|noch|wie|einem|über|einen|so|zum|war|haben|nur|oder|aber|vor|zur|bis|unter|während|warum|danke|hallo|auf wiedersehen)\b/i
        },
        'Italian': {
            chars: /[àèìòù]/i,
            words: /\b(il|di|che|e|la|per|un|in|con|del|da|al|le|su|come|più|lo|ma|se|nel|ha|nella|suo|si|tutto|anche|loro|vita|fare|tanto|essere|quando|molto|ci|già|solo|sempre|mio|così|ora|dove|cosa|perché|grazie|ciao|arrivederci)\b/i
        },
        'Portuguese': {
            chars: /[ãõâêôáéíóúàç]/i,
            words: /\b(o|de|a|do|da|em|um|para|com|não|uma|os|no|se|na|por|mais|as|dos|como|mas|foi|ao|ele|das|tem|à|seu|sua|ou|ser|quando|muito|há|nos|já|está|eu|também|só|pelo|pela|até|isso|ela|entre|era|depois|sem|mesmo|aos|ter|seus|suas|numa|pelos|pelas|esse|esses|essa|essas|meu|minha|meus|minhas|obrigado|olá|tchau)\b/i
        },
        'Dutch': {
            chars: /[ëïáéíóúà]/i,
            words: /\b(de|van|het|een|en|in|op|dat|te|voor|met|als|zijn|er|maar|om|door|over|ze|uit|aan|bij|na|tot|tegen|onder|tussen|zonder|binnen|buiten|tijdens|volgens|zoals|omdat|hoewel|toen|waar|wanneer|waarom|hoe|wat|wie|welke|dank je|hallo|dag)\b/i
        }
    };
    
    // Score-based detection for European languages
    let bestMatch = null;
    let bestScore = 0;
    
    for (const [language, { chars, words }] of Object.entries(europeanPatterns)) {
        let score = 0;
        
        // Character pattern matching
        const charMatches = (text.match(chars) || []).length;
        score += charMatches * 2;
        
        // Word pattern matching
        const wordMatches = (text.match(words) || []).length;
        score += wordMatches * 3;
        
        // Adjust score based on text length
        score = score / text.length * 100;
        
        if (score > bestScore && score > 5) { // Minimum threshold
            bestScore = score;
            bestMatch = language;
        }
    }
    
    // Additional heuristics for common patterns
    if (!bestMatch) {
        // Check for Scandinavian languages
        if (/[æøå]/i.test(text)) {
            if (/\b(og|i|på|til|for|med|av|er|det|ikke|en|et|som|har|var|den|de|at|fra|eller|når|hvor|hvorfor|takk|hei|ha det)\b/i.test(text)) {
                return 'Norwegian';
            }
            if (/\b(och|i|på|till|för|med|av|är|det|inte|en|ett|som|har|var|den|de|att|från|eller|när|var|varför|tack|hej|hej då)\b/i.test(text)) {
                return 'Swedish';
            }
            if (/\b(og|i|på|til|for|med|af|er|det|ikke|en|et|som|har|var|den|de|at|fra|eller|når|hvor|hvorfor|tak|hej|farvel)\b/i.test(text)) {
                return 'Danish';
            }
        }
        
        // Check for Eastern European languages
        if (/[ąćęłńóśźż]/i.test(text)) {
            return 'Polish';
        }
        
        if (/[čďěňřšťůž]/i.test(text)) {
            return 'Czech';
        }
        
        if (/[áäčďéíĺľňóôŕšťúýž]/i.test(text)) {
            return 'Slovak';
        }
        
        // Romanian
        if (/[ăâîșț]/i.test(text)) {
            return 'Romanian';
        }
        
        // Hungarian
        if (/[áéíóöőúüű]/i.test(text)) {
            return 'Hungarian';
        }
        
        // Finnish
        if (/[äöå]/i.test(text) && /\b(ja|on|ei|se|että|kun|niin|kuin|jos|tai|mutta|vain|kaikki|hän|minä|sinä|me|te|he|kiitos|hei|näkemiin)\b/i.test(text)) {
            return 'Finnish';
        }
        
        // Turkish
        if (/[çğıöşü]/i.test(text)) {
            return 'Turkish';
        }
    }
    
    return bestMatch;
}