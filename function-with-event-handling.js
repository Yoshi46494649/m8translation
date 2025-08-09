/**
 * ServiceM8 Simple Function - Smart Message Translator
 * Handles action events and displays translation interface
 */
module.exports = function(input, callback) {
    console.log('ServiceM8 Function called:', JSON.stringify(input));
    
    // Check for action event
    if (input && input.eventName === 'translate_message') {
        // Generate HTML for action popup
        var html = generateTranslatorHTML(input);
        callback(null, html);
    } else {
        // Return default response for other events
        callback(null, generateDefaultHTML());
    }
};

function generateTranslatorHTML(input) {
    var jobUUID = input && input.eventArgs ? input.eventArgs.jobUUID : '';
    var accessToken = input && input.auth ? input.auth.accessToken : '';
    var accountUUID = input && input.auth ? input.auth.accountUUID : '';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Message Translator</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width,initial-scale=1">
        <style>
            body { 
                font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;
                margin: 0; padding: 20px; background: #f8f9fa; color: #333;
            }
            .container {
                background: white; padding: 24px; border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 500px;
            }
            h2 { color: #007cba; margin: 0 0 16px; font-size: 20px; }
            p { margin: 0 0 16px; line-height: 1.4; }
            .button {
                background: #007cba; color: white; padding: 12px 24px;
                border: none; border-radius: 6px; cursor: pointer;
                font-size: 14px; font-weight: 500; text-decoration: none;
                display: inline-block; transition: background 0.2s;
            }
            .button:hover { background: #0066a0; }
            .info { font-size: 12px; color: #666; margin-top: 16px; }
            .debug { 
                background: #f1f1f1; padding: 10px; margin-top: 20px; 
                font-family: monospace; font-size: 11px; border-radius: 4px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>🌐 Smart Message Translator</h2>
            <p>AI-powered translation tool for ServiceM8 messages.</p>
            <p>Translate messages to professional English with automatic email subject generation.</p>
            <a href="#" class="button" onclick="openTranslator()">Open Translator</a>
            <div class="info">
                Job: ${jobUUID || 'Not specified'}<br>
                Company: ${accountUUID || 'Not specified'}
            </div>
            <div class="debug">
                Event: translate_message<br>
                Input: ${JSON.stringify(input).substring(0, 200)}...
            </div>
        </div>
        
        <script>
            function openTranslator() {
                var url = 'https://m8translation.vercel.app/translate-compose';
                url += '?job_uuid=' + encodeURIComponent('${jobUUID}');
                url += '&company_uuid=' + encodeURIComponent('${accountUUID}');
                url += '&access_token=' + encodeURIComponent('${accessToken}');
                
                // Try popup first, fallback to same window
                try {
                    var popup = window.open(url, 'translator', 'width=540,height=420,scrollbars=yes,resizable=yes');
                    if (!popup || popup.closed || typeof popup.closed == 'undefined') {
                        window.location.href = url;
                    }
                } catch (e) {
                    window.location.href = url;
                }
            }
        </script>
    </body>
    </html>
    `;
}

function generateDefaultHTML() {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Message Translator</title>
        <meta charset="utf-8">
        <style>
            body { 
                font-family: Arial, sans-serif; margin: 20px; 
                background: #f8f9fa; color: #333;
            }
            .container {
                background: white; padding: 20px; border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            h2 { color: #007cba; margin: 0 0 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Smart Message Translator</h2>
            <p>Add-on is ready. Use the "Translate Message" action in Job cards.</p>
        </div>
    </body>
    </html>
    `;
}