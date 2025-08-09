'use strict';

exports.handler = (event, context, callback) => {
 
    console.log('Received event:', JSON.stringify(event, null, 2));
 
    var strJobUUID = event.eventArgs.jobUUID;
    var strAccessToken = event.auth.accessToken;
    var strAccountUUID = event.auth.accountUUID;
 
    // Use string concatenation instead of template literals for better compatibility
    var strHTMLResponse = 
    '<html>' +
    '<head>' +
        '<link rel="stylesheet" href="https://platform.servicem8.com/sdk/1.0/sdk.css">' +
        '<script src="https://platform.servicem8.com/sdk/1.0/sdk.js"></script>' +
        '<meta name="mobile-web-app-capable" content="yes">' +
        '<script>' +
            'var client = SMClient.init();' +
            'client.resizeWindow(540, 450);' +
        '</script>' +
        '<style>' +
            ':root {' +
                '--servicem8-primary: #007cba;' +
                '--servicem8-success: #28a745;' +
                '--servicem8-danger: #dc3545;' +
                '--border-radius: 6px;' +
            '}' +
            'body {' +
                'font-family: Arial, sans-serif;' +
                'margin: 0;' +
                'padding: 16px;' +
                'background: #f8f9fa;' +
                'font-size: 14px;' +
            '}' +
            '.container {' +
                'background: white;' +
                'padding: 20px;' +
                'border-radius: var(--border-radius);' +
                'box-shadow: 0 2px 4px rgba(0,0,0,0.1);' +
                'height: 100%;' +
            '}' +
            'h2 {' +
                'color: var(--servicem8-primary);' +
                'margin: 0 0 16px 0;' +
                'font-size: 18px;' +
            '}' +
            '.input-section {' +
                'margin-bottom: 16px;' +
            '}' +
            'label {' +
                'display: block;' +
                'margin-bottom: 6px;' +
                'font-weight: 500;' +
                'color: #333;' +
            '}' +
            'textarea {' +
                'width: 100%;' +
                'padding: 10px;' +
                'border: 2px solid #dee2e6;' +
                'border-radius: var(--border-radius);' +
                'font-family: Arial, sans-serif;' +
                'font-size: 14px;' +
                'resize: vertical;' +
                'min-height: 80px;' +
                'box-sizing: border-box;' +
            '}' +
            'textarea:focus {' +
                'border-color: var(--servicem8-primary);' +
                'outline: none;' +
                'box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.1);' +
            '}' +
            '.input-info {' +
                'display: flex;' +
                'justify-content: space-between;' +
                'align-items: center;' +
                'margin-top: 4px;' +
                'font-size: 12px;' +
                'color: #666;' +
            '}' +
            '.actions {' +
                'margin-top: 16px;' +
            '}' +
            '.primary-button {' +
                'background: var(--servicem8-primary);' +
                'color: white;' +
                'padding: 10px 20px;' +
                'border: none;' +
                'border-radius: var(--border-radius);' +
                'cursor: pointer;' +
                'font-size: 14px;' +
                'font-weight: 500;' +
                'width: 100%;' +
                'margin-bottom: 8px;' +
            '}' +
            '.primary-button:hover {' +
                'background: #0066a0;' +
            '}' +
            '.primary-button:disabled {' +
                'background: #ccc;' +
                'cursor: not-allowed;' +
            '}' +
            '.translation-section {' +
                'margin-top: 16px;' +
                'padding-top: 16px;' +
                'border-top: 1px solid #dee2e6;' +
            '}' +
            '.translated-text {' +
                'background: #f8f9fa;' +
                'padding: 12px;' +
                'border-radius: var(--border-radius);' +
                'border: 1px solid #dee2e6;' +
                'min-height: 60px;' +
                'white-space: pre-wrap;' +
                'font-family: Arial, sans-serif;' +
                'margin-bottom: 12px;' +
            '}' +
            '.email-subject {' +
                'background: #e7f3ff;' +
                'padding: 8px 12px;' +
                'border-radius: var(--border-radius);' +
                'border: 1px solid #b3d9ff;' +
                'font-weight: 500;' +
                'margin-bottom: 12px;' +
            '}' +
            '.close-button {' +
                'background: #6c757d;' +
                'color: white;' +
                'padding: 8px 16px;' +
                'border: none;' +
                'border-radius: var(--border-radius);' +
                'cursor: pointer;' +
                'font-size: 12px;' +
                'margin-top: 8px;' +
            '}' +
        '</style>' +
    '</head>' +
    '<body>' +
        '<div class="container">' +
            '<h2>🌐 Smart Message Translator</h2>' +
            
            '<div class="input-section">' +
                '<label for="messageInput">Enter message to translate:</label>' +
                '<textarea ' +
                    'id="messageInput" ' +
                    'placeholder="Type or paste your message here..." ' +
                    'maxlength="1000">' +
                '</textarea>' +
                '<div class="input-info">' +
                    '<span id="charCount">0/1000</span>' +
                    '<span id="detectedLanguage"></span>' +
                '</div>' +
            '</div>' +
            
            '<div class="actions">' +
                '<button id="translateButton" class="primary-button">' +
                    '<span id="buttonText">Translate Message</span>' +
                '</button>' +
            '</div>' +
            
            '<div id="translationSection" class="translation-section" style="display: none;">' +
                '<label>English Translation:</label>' +
                '<div id="translatedOutput" class="translated-text"></div>' +
                
                '<label>Generated Email Subject:</label>' +
                '<div id="emailSubject" class="email-subject"></div>' +
            '</div>' +
            
            '<button class="close-button" onclick="client.closeWindow();">Close</button>' +
        '</div>' +
        
        '<script>' +
            'var API_BASE = "https://m8translation.vercel.app";' +
            'var jobUUID = "' + strJobUUID + '";' +
            'var companyUUID = "' + strAccountUUID + '";' +
            'var accessToken = "' + strAccessToken + '";' +
            
            'var messageInput = document.getElementById("messageInput");' +
            'var translateButton = document.getElementById("translateButton");' +
            'var buttonText = document.getElementById("buttonText");' +
            'var charCount = document.getElementById("charCount");' +
            'var translationSection = document.getElementById("translationSection");' +
            'var translatedOutput = document.getElementById("translatedOutput");' +
            'var emailSubject = document.getElementById("emailSubject");' +
            'var detectedLanguage = document.getElementById("detectedLanguage");' +
            
            'messageInput.addEventListener("input", function() {' +
                'var length = this.value.length;' +
                'charCount.textContent = length + "/1000";' +
                
                'if (length > 0) {' +
                    'translateButton.disabled = false;' +
                '} else {' +
                    'translateButton.disabled = true;' +
                    'translationSection.style.display = "none";' +
                '}' +
            '});' +
            
            'translateButton.addEventListener("click", function() {' +
                'var text = messageInput.value.trim();' +
                'if (!text) return;' +
                
                'translateButton.disabled = true;' +
                'buttonText.textContent = "Translating...";' +
                'translationSection.style.display = "none";' +
                
                'console.log("Sending translation request");' +
                
                'var xhr = new XMLHttpRequest();' +
                'xhr.open("POST", API_BASE + "/api/translate", true);' +
                'xhr.setRequestHeader("Content-Type", "application/json");' +
                
                'xhr.onreadystatechange = function() {' +
                    'if (xhr.readyState === 4) {' +
                        'translateButton.disabled = false;' +
                        'buttonText.textContent = "Translate Message";' +
                        
                        'if (xhr.status === 200) {' +
                            'try {' +
                                'var result = JSON.parse(xhr.responseText);' +
                                'translatedOutput.textContent = result.translated_text;' +
                                'emailSubject.textContent = result.email_subject;' +
                                'if (result.detected_language) {' +
                                    'detectedLanguage.textContent = "Detected: " + result.detected_language;' +
                                '}' +
                                'translationSection.style.display = "block";' +
                            '} catch (e) {' +
                                'translatedOutput.textContent = "Error parsing response: " + e.message;' +
                                'translationSection.style.display = "block";' +
                            '}' +
                        '} else {' +
                            'translatedOutput.textContent = "Translation failed. Status: " + xhr.status + ", Response: " + xhr.responseText;' +
                            'translationSection.style.display = "block";' +
                        '}' +
                    '}' +
                '};' +
                
                'var requestData = {' +
                    'text: text,' +
                    'company_uuid: companyUUID,' +
                    'access_token: accessToken,' +
                    'job_uuid: jobUUID' +
                '};' +
                
                'xhr.send(JSON.stringify(requestData));' +
            '});' +
            
            'setTimeout(function() { messageInput.focus(); }, 100);' +
        '</script>' +
    '</body>' +
    '</html>';
 
    callback(null, { 
        eventResponse: strHTMLResponse
    });
 
};