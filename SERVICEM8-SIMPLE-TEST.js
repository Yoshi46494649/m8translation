'use strict';

// ServiceM8 Simple Test - JavaScript syntax fixed
exports.handler = (event, context, callback) => {
    
    console.log('Simple test invoked:', JSON.stringify(event, null, 2));
    
    var strJobUUID = event.eventArgs.jobUUID || 'test-job';
    var strAccessToken = event.auth.accessToken || 'test-token';
    var strAccountUUID = event.auth.accountUUID || 'test-account';
    
    // Fixed HTML with proper JavaScript escaping
    var strHTMLResponse = '' +
    '<html>' +
        '<head>' +
            '<link rel="stylesheet" href="https://platform.servicem8.com/sdk/1.0/sdk.css">' +
            '<script src="https://platform.servicem8.com/sdk/1.0/sdk.js"></script>' +
            '<meta name="mobile-web-app-capable" content="yes">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<script>' +
                'var client = SMClient.init();' +
                'client.resizeWindow(540, 460);' +
            '</script>' +
            '<style>' +
                'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }' +
                '.container { background: #ffffff; border-radius: 8px; padding: 20px; max-width: 500px; margin: 0 auto; }' +
                'h1 { color: #007cba; font-size: 20px; margin: 0 0 20px 0; text-align: center; }' +
                'textarea { width: 100%; min-height: 100px; padding: 12px; border: 2px solid #dee2e6; border-radius: 6px; box-sizing: border-box; }' +
                'button { width: 100%; background-color: #007cba; color: white; border: none; padding: 12px; border-radius: 6px; font-size: 16px; cursor: pointer; margin: 10px 0; }' +
                'button:disabled { background-color: #6c757d; }' +
                '.result { background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; padding: 16px; margin: 10px 0; display: none; }' +
                '.success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }' +
            '</style>' +
        '</head>' +
        '<body>' +
            '<div class="container">' +
                '<h1>🧪 Simple Test</h1>' +
                '<textarea id="messageText" placeholder="Enter text to test...">$250/週</textarea>' +
                '<button id="testBtn" onclick="testAPI()">Test API</button>' +
                '<div id="result" class="result"></div>' +
                '<button onclick="client.closeWindow();" style="background-color: #6c757d;">Close</button>' +
            '</div>' +
            
            '<script>' +
                'function testAPI() {' +
                    'var text = document.getElementById("messageText").value || "test";' +
                    'var btn = document.getElementById("testBtn");' +
                    'var result = document.getElementById("result");' +
                    
                    'btn.disabled = true;' +
                    'btn.textContent = "Testing...";' +
                    'result.style.display = "block";' +
                    'result.innerHTML = "Testing API...";' +
                    
                    'var xhr = new XMLHttpRequest();' +
                    'xhr.timeout = 10000;' +
                    
                    'xhr.onreadystatechange = function() {' +
                        'if (xhr.readyState === 4) {' +
                            'btn.disabled = false;' +
                            'btn.textContent = "Test API";' +
                            
                            'if (xhr.status === 200) {' +
                                'try {' +
                                    'var response = JSON.parse(xhr.responseText);' +
                                    'result.className = "result success";' +
                                    'result.innerHTML = "✅ Success!<br><strong>Result:</strong> " + response.translated_text;' +
                                '} catch (e) {' +
                                    'result.className = "result";' +
                                    'result.innerHTML = "❌ Parse Error: " + e.message;' +
                                '}' +
                            '} else {' +
                                'result.className = "result";' +
                                'result.innerHTML = "❌ Error: " + xhr.status + "<br>" + xhr.responseText;' +
                            '}' +
                        '}' +
                    '};' +
                    
                    'xhr.onerror = function() {' +
                        'btn.disabled = false;' +
                        'btn.textContent = "Test API";' +
                        'result.className = "result";' +
                        'result.innerHTML = "❌ Network Error";' +
                    '};' +
                    
                    'xhr.open("POST", "https://m8translation.vercel.app/api/test", true);' +
                    'xhr.setRequestHeader("Content-Type", "application/json");' +
                    
                    'var data = JSON.stringify({' +
                        'text: text,' +
                        'company_uuid: "' + strAccountUUID + '",' +
                        'access_token: "' + strAccessToken + '"' +
                    '});' +
                    
                    'xhr.send(data);' +
                '}' +
            '</script>' +
        '</body>' +
    '</html>';
    
    callback(null, { 
        eventResponse: strHTMLResponse
    });
};