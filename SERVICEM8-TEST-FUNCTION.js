'use strict';

// ServiceM8 Test Translation Add-on - Debug Version
exports.handler = (event, context, callback) => {
    
    console.log('TEST Translation add-on invoked:', JSON.stringify(event, null, 2));
    
    var strJobUUID = event.eventArgs.jobUUID || 'test-job';
    var strAccessToken = event.auth.accessToken || 'test-token';
    var strAccountUUID = event.auth.accountUUID || 'test-account';
    
    // ServiceM8準拠のHTML生成 - Test API使用
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
                '.error { background-color: #f8d7da; border: 1px solid #f5c6cb; color: #dc3545; }' +
                '.success { background-color: #d4edda; border: 1px solid #c3e6cb; color: #155724; }' +
            '</style>' +
        '</head>' +
        '<body>' +
            '<div class="container">' +
                '<h1>🧪 Translation Test</h1>' +
                '<textarea id="messageText" placeholder="Enter text to test translation..."></textarea>' +
                '<button id="testBtn" onclick="testTranslation()">Test Translation API</button>' +
                '<div id="result" class="result"></div>' +
                '<div id="debug" class="result" style="font-size: 12px;"></div>' +
                '<button onclick="client.closeWindow();" style="background-color: #6c757d; font-size: 14px;">Close</button>' +
            '</div>' +
            
            '<script>' +
                'var CONFIG = {' +
                    'TEST_API_URL: "https://m8translation.vercel.app/api/test",' +
                    'SIMPLE_API_URL: "https://m8translation.vercel.app/api/translate-simple",' +
                    'ORIGINAL_API_URL: "https://m8translation.vercel.app/api/translate",' +
                    'JOB_UUID: "' + strJobUUID + '",' +
                    'COMPANY_UUID: "' + strAccountUUID + '",' +
                    'ACCESS_TOKEN: "' + strAccessToken + '"' +
                '};' +
                
                'function testTranslation() {' +
                    'var text = document.getElementById("messageText").value || "test message";' +
                    'var btn = document.getElementById("testBtn");' +
                    'var result = document.getElementById("result");' +
                    'var debug = document.getElementById("debug");' +
                    
                    'btn.disabled = true;' +
                    'btn.textContent = "Testing...";' +
                    'result.className = "result";' +
                    'result.style.display = "block";' +
                    'result.innerHTML = "🔄 Testing API endpoints...";' +
                    
                    'debug.style.display = "block";' +
                    'debug.innerHTML = "🛠️ Debug Info:<br>";' +
                    'debug.innerHTML += "Job UUID: " + CONFIG.JOB_UUID + "<br>";' +
                    'debug.innerHTML += "Company UUID: " + CONFIG.COMPANY_UUID + "<br>";' +
                    'debug.innerHTML += "Input Text: " + text + "<br><br>";' +
                    
                    '// Test multiple APIs in sequence' +
                    'testAPI("TEST", CONFIG.TEST_API_URL, text, function() {' +
                        'testAPI("SIMPLE", CONFIG.SIMPLE_API_URL, text, function() {' +
                            'testAPI("ORIGINAL", CONFIG.ORIGINAL_API_URL, text, function() {' +
                                'btn.disabled = false;' +
                                'btn.textContent = "Test Translation API";' +
                            '});' +
                        '});' +
                    '});' +
                '}' +
                
                'function testAPI(name, url, text, callback) {' +
                    'var xhr = new XMLHttpRequest();' +
                    'xhr.timeout = 10000;' +
                    
                    'xhr.onreadystatechange = function() {' +
                        'if (xhr.readyState === 4) {' +
                            'var debug = document.getElementById("debug");' +
                            'debug.innerHTML += "📡 " + name + " API (" + url + "):<br>";' +
                            'debug.innerHTML += "Status: " + xhr.status + "<br>";' +
                            
                            'if (xhr.status === 200) {' +
                                'try {' +
                                    'var response = JSON.parse(xhr.responseText);' +
                                    'debug.innerHTML += "✅ Success: " + JSON.stringify(response, null, 2) + "<br><br>";' +
                                    
                                    'if (name === "TEST") {' +
                                        'var result = document.getElementById("result");' +
                                        'result.className = "result success";' +
                                        'result.innerHTML = "✅ " + name + " API Working!<br><strong>Translation:</strong> " + response.translated_text;' +
                                    '}' +
                                '} catch (e) {' +
                                    'debug.innerHTML += "❌ JSON Parse Error: " + e.message + "<br><br>";' +
                                '}' +
                            '} else {' +
                                'debug.innerHTML += "❌ HTTP Error: " + xhr.status + "<br>";' +
                                'if (xhr.responseText) {' +
                                    'debug.innerHTML += "Response: " + xhr.responseText + "<br>";' +
                                '}' +
                                'debug.innerHTML += "<br>";' +
                            '}' +
                            'callback();' +
                        '}' +
                    '};' +
                    
                    'xhr.onerror = function() {' +
                        'var debug = document.getElementById("debug");' +
                        'debug.innerHTML += "❌ " + name + " Network Error<br><br>";' +
                        'callback();' +
                    '};' +
                    
                    'xhr.ontimeout = function() {' +
                        'var debug = document.getElementById("debug");' +
                        'debug.innerHTML += "❌ " + name + " Timeout<br><br>";' +
                        'callback();' +
                    '};' +
                    
                    'xhr.open("POST", url, true);' +
                    'xhr.setRequestHeader("Content-Type", "application/json");' +
                    
                    'var requestData = JSON.stringify({' +
                        'text: text,' +
                        'company_uuid: CONFIG.COMPANY_UUID,' +
                        'access_token: CONFIG.ACCESS_TOKEN,' +
                        'job_uuid: CONFIG.JOB_UUID' +
                    '});' +
                    
                    'xhr.send(requestData);' +
                '}' +
            '</script>' +
        '</body>' +
    '</html>';
    
    callback(null, { 
        eventResponse: strHTMLResponse
    });
};