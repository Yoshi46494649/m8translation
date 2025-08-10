'use strict';

// ServiceM8 Smart Message Translator - Final Production Version
exports.handler = (event, context, callback) => {
    
    console.log('Translation add-on invoked:', JSON.stringify(event, null, 2));
    
    var strJobUUID = event.eventArgs.jobUUID || 'unknown';
    var strAccessToken = event.auth.accessToken || '';
    var strAccountUUID = event.auth.accountUUID || '';
    
    // ServiceM8準拠のHTML生成 - Email/SMS挿入機能付き
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
                '/* ServiceM8準拠スタイル */' +
                'body {' +
                    'font-family: Arial, sans-serif;' +
                    'margin: 0;' +
                    'padding: 20px;' +
                    'background-color: #f8f9fa;' +
                    'color: #333;' +
                    'font-size: 14px;' +
                    'line-height: 1.4;' +
                '}' +
                '.main-container {' +
                    'background: #ffffff;' +
                    'border-radius: 8px;' +
                    'padding: 20px;' +
                    'box-shadow: 0 2px 4px rgba(0,0,0,0.1);' +
                    'max-width: 500px;' +
                    'margin: 0 auto;' +
                    'min-height: calc(100vh - 40px);' +
                    'display: flex;' +
                    'flex-direction: column;' +
                '}' +
                'h1 {' +
                    'color: #007cba;' +
                    'font-size: 20px;' +
                    'margin: 0 0 20px 0;' +
                    'text-align: center;' +
                '}' +
                '.form-group {' +
                    'margin-bottom: 16px;' +
                '}' +
                'label {' +
                    'display: block;' +
                    'margin-bottom: 8px;' +
                    'font-weight: 600;' +
                    'color: #495057;' +
                '}' +
                '#messageText {' +
                    'width: 100%;' +
                    'min-height: 100px;' +
                    'padding: 12px;' +
                    'border: 2px solid #dee2e6;' +
                    'border-radius: 6px;' +
                    'font-family: Arial, sans-serif;' +
                    'font-size: 14px;' +
                    'resize: vertical;' +
                    'box-sizing: border-box;' +
                '}' +
                '#messageText:focus {' +
                    'border-color: #007cba;' +
                    'outline: none;' +
                    'box-shadow: 0 0 0 3px rgba(0, 124, 186, 0.1);' +
                '}' +
                '.char-counter {' +
                    'text-align: right;' +
                    'font-size: 12px;' +
                    'color: #6c757d;' +
                    'margin-top: 4px;' +
                '}' +
                '#translateBtn {' +
                    'width: 100%;' +
                    'background-color: #007cba;' +
                    'color: #ffffff;' +
                    'border: none;' +
                    'padding: 12px 24px;' +
                    'border-radius: 6px;' +
                    'font-size: 16px;' +
                    'font-weight: 600;' +
                    'cursor: pointer;' +
                    'transition: background-color 0.2s;' +
                    'margin-bottom: 20px;' +
                '}' +
                '#translateBtn:hover {' +
                    'background-color: #0056b3;' +
                '}' +
                '#translateBtn:disabled {' +
                    'background-color: #6c757d;' +
                    'cursor: not-allowed;' +
                '}' +
                '.result-section {' +
                    'margin-top: 24px;' +
                    'padding-top: 24px;' +
                    'border-top: 2px solid #dee2e6;' +
                    'display: none;' +
                '}' +
                '.result-box {' +
                    'background-color: #f8f9fa;' +
                    'border: 1px solid #dee2e6;' +
                    'border-radius: 6px;' +
                    'padding: 16px;' +
                    'margin-bottom: 16px;' +
                    'white-space: pre-wrap;' +
                    'word-wrap: break-word;' +
                '}' +
                '.email-subject-box {' +
                    'background-color: #e7f3ff;' +
                    'border: 1px solid #b3d9ff;' +
                    'border-radius: 6px;' +
                    'padding: 12px;' +
                    'font-weight: 600;' +
                    'color: #004085;' +
                    'margin-bottom: 16px;' +
                '}' +
                '.insertion-buttons {' +
                    'margin-top: 20px;' +
                    'display: flex;' +
                    'gap: 12px;' +
                '}' +
                '.insert-btn {' +
                    'flex: 1;' +
                    'padding: 12px 20px;' +
                    'border: none;' +
                    'border-radius: 6px;' +
                    'font-size: 14px;' +
                    'font-weight: 600;' +
                    'cursor: pointer;' +
                    'transition: all 0.2s;' +
                '}' +
                '.insert-email {' +
                    'background-color: #28a745;' +
                    'color: white;' +
                '}' +
                '.insert-email:hover {' +
                    'background-color: #218838;' +
                '}' +
                '.insert-sms {' +
                    'background-color: #007cba;' +
                    'color: white;' +
                '}' +
                '.insert-sms:hover {' +
                    'background-color: #0056b3;' +
                '}' +
                '.close-btn {' +
                    'background-color: #6c757d;' +
                    'color: #ffffff;' +
                    'border: none;' +
                    'padding: 8px 16px;' +
                    'border-radius: 4px;' +
                    'font-size: 12px;' +
                    'cursor: pointer;' +
                    'margin-top: 16px;' +
                    'float: right;' +
                '}' +
                '.error-message {' +
                    'color: #dc3545;' +
                    'background-color: #f8d7da;' +
                    'border: 1px solid #f5c6cb;' +
                    'border-radius: 6px;' +
                    'padding: 12px;' +
                    'margin-top: 16px;' +
                '}' +
                '.success-message {' +
                    'color: #155724;' +
                    'background-color: #d4edda;' +
                    'border: 1px solid #c3e6cb;' +
                    'border-radius: 6px;' +
                    'padding: 12px;' +
                    'margin-top: 16px;' +
                '}' +
                '/* Copy Button Styles */' +
                '.result-item {' +
                    'margin-bottom: 20px;' +
                '}' +
                '.result-content {' +
                    'display: flex;' +
                    'align-items: flex-start;' +
                    'gap: 12px;' +
                '}' +
                '.result-content > div {' +
                    'flex: 1;' +
                '}' +
                '.copy-btn {' +
                    'background-color: #007cba;' +
                    'color: white;' +
                    'border: none;' +
                    'padding: 8px 12px;' +
                    'border-radius: 4px;' +
                    'font-size: 12px;' +
                    'font-weight: 600;' +
                    'cursor: pointer;' +
                    'transition: background-color 0.2s;' +
                    'white-space: nowrap;' +
                    'min-height: 36px;' +
                '}' +
                '.copy-btn:hover {' +
                    'background-color: #0056b3;' +
                '}' +
                '.copy-btn.copied {' +
                    'background-color: #28a745;' +
                '}' +
                '.copy-btn.copied:hover {' +
                    'background-color: #218838;' +
                '}' +
                '/* Mobile Responsive Styles */' +
                '@media (max-width: 480px) {' +
                    'body {' +
                        'padding: 10px;' +
                        'font-size: 16px;' +
                    '}' +
                    '.main-container {' +
                        'padding: 16px;' +
                        'border-radius: 0;' +
                        'margin: 0;' +
                        'max-width: 100%;' +
                        'box-shadow: none;' +
                    '}' +
                    '.result-content {' +
                        'flex-direction: column;' +
                        'gap: 8px;' +
                    '}' +
                    '.copy-btn {' +
                        'width: 100%;' +
                        'padding: 12px;' +
                        'font-size: 14px;' +
                    '}' +
                    '#messageText {' +
                        'font-size: 16px;' +
                        'min-height: 120px;' +
                    '}' +
                    '#translateBtn {' +
                        'font-size: 18px;' +
                        'padding: 14px 24px;' +
                    '}' +
                '}' +
            '</style>' +
        '</head>' +
        '<body>' +
            '<div class="main-container">' +
                
                '<div class="form-group">' +
                    '<label for="messageText">Enter message to translate:</label>' +
                    '<textarea id="messageText" placeholder="Type or paste your message here..."></textarea>' +
                    '<div class="char-counter" id="charCounter">0/1000 characters</div>' +
                '</div>' +
                
                '<button id="translateBtn" type="button">Translate Message</button>' +
                
                '<div id="resultSection" class="result-section">' +
                    '<div class="result-item">' +
                        '<label>📧 Email Subject:</label>' +
                        '<div class="result-content">' +
                            '<div id="emailSubjectResult" class="email-subject-box"></div>' +
                            '<button id="copySubjectBtn" class="copy-btn">📋 Copy Subject</button>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="result-item">' +
                        '<label>📝 Message:</label>' +
                        '<div class="result-content">' +
                            '<div id="translationResult" class="result-box"></div>' +
                            '<button id="copyMessageBtn" class="copy-btn">📋 Copy Message</button>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
                
                '<div id="errorSection" class="error-message" style="display: none;"></div>' +
                '<div id="successSection" class="success-message" style="display: none;"></div>' +
                
                '<button class="close-btn" type="button" onclick="client.closeWindow();">Close</button>' +
            '</div>' +
            
            '<script>' +
                '/* ServiceM8準拠JavaScript - ES5互換 */' +
                'var CONFIG = {' +
                    'API_URL: "https://m8translation.vercel.app/api/translate",' +
                    'JOB_UUID: "' + strJobUUID + '",' +
                    'COMPANY_UUID: "' + strAccountUUID + '",' +
                    'ACCESS_TOKEN: "' + strAccessToken + '"' +
                '};' +
                
                '/* Global variables for translation results */' +
                'var currentTranslation = {' +
                    'subject: "",' +
                    'text: "",' +
                    'language: ""' +
                '};' +
                
                'var elements = {' +
                    'messageText: document.getElementById("messageText"),' +
                    'translateBtn: document.getElementById("translateBtn"),' +
                    'charCounter: document.getElementById("charCounter"),' +
                    'resultSection: document.getElementById("resultSection"),' +
                    'translationResult: document.getElementById("translationResult"),' +
                    'emailSubjectResult: document.getElementById("emailSubjectResult"),' +
                    'errorSection: document.getElementById("errorSection"),' +
                    'successSection: document.getElementById("successSection"),' +
                    'copySubjectBtn: document.getElementById("copySubjectBtn"),' +
                    'copyMessageBtn: document.getElementById("copyMessageBtn")' +
                '};' +
                
                '/* 文字カウンター */' +
                'elements.messageText.addEventListener("input", function() {' +
                    'var length = this.value.length;' +
                    'elements.charCounter.textContent = length + "/1000 characters";' +
                    'elements.translateBtn.disabled = length === 0;' +
                '});' +
                
                '/* 翻訳実行 */' +
                'elements.translateBtn.addEventListener("click", function() {' +
                    'var messageText = elements.messageText.value.trim();' +
                    'if (!messageText) return;' +
                    
                    'hideMessages();' +
                    'setLoadingState(true);' +
                    
                    'performTranslation(messageText);' +
                '});' +
                
                '/* Copy Button Events */' +
                'elements.copySubjectBtn.addEventListener("click", function() {' +
                    'copyToClipboard(currentTranslation.subject, this, "Subject copied!");' +
                '});' +
                
                'elements.copyMessageBtn.addEventListener("click", function() {' +
                    'copyToClipboard(currentTranslation.text, this, "Message copied!");' +
                '});' +
                
                'function performTranslation(text) {' +
                    'var xhr = new XMLHttpRequest();' +
                    'xhr.timeout = 15000;' +
                    
                    'xhr.onreadystatechange = function() {' +
                        'if (xhr.readyState === 4) {' +
                            'setLoadingState(false);' +
                            'if (xhr.status === 200) {' +
                                'try {' +
                                    'var response = JSON.parse(xhr.responseText);' +
                                    'showTranslationResult(response);' +
                                '} catch (e) {' +
                                    'showError("Failed to parse translation response: " + e.message);' +
                                '}' +
                            '} else {' +
                                'showError("Translation request failed. Status: " + xhr.status + "\\\\nPlease try again.");' +
                            '}' +
                        '}' +
                    '};' +
                    
                    'xhr.ontimeout = function() {' +
                        'setLoadingState(false);' +
                        'showError("Translation request timed out. Please try again.");' +
                    '};' +
                    
                    'xhr.onerror = function() {' +
                        'setLoadingState(false);' +
                        'showError("Network error occurred. Please check your connection and try again.");' +
                    '};' +
                    
                    'xhr.open("POST", CONFIG.API_URL, true);' +
                    'xhr.setRequestHeader("Content-Type", "application/json");' +
                    
                    'var requestData = JSON.stringify({' +
                        'text: text,' +
                        'company_uuid: CONFIG.COMPANY_UUID,' +
                        'access_token: CONFIG.ACCESS_TOKEN,' +
                        'job_uuid: CONFIG.JOB_UUID' +
                    '});' +
                    
                    'xhr.send(requestData);' +
                '}' +
                
                'function copyToClipboard(text, buttonElement, successMessage) {' +
                    'try {' +
                        'if (!text) {' +
                            'showError("Nothing to copy. Please translate first.");' +
                            'return;' +
                        '}' +
                        
                        '/* Modern browsers with clipboard API */' +
                        'if (navigator.clipboard && window.isSecureContext) {' +
                            'navigator.clipboard.writeText(text).then(function() {' +
                                'showCopySuccess(buttonElement, successMessage);' +
                            '}).catch(function(err) {' +
                                'fallbackCopyToClipboard(text, buttonElement, successMessage);' +
                            '});' +
                        '} else {' +
                            '/* Fallback for older browsers */' +
                            'fallbackCopyToClipboard(text, buttonElement, successMessage);' +
                        '}' +
                    '} catch (error) {' +
                        'showError("Failed to copy: " + error.message);' +
                    '}' +
                '}' +
                
                'function fallbackCopyToClipboard(text, buttonElement, successMessage) {' +
                    'try {' +
                        'var textArea = document.createElement("textarea");' +
                        'textArea.value = text;' +
                        'textArea.style.position = "fixed";' +
                        'textArea.style.opacity = "0";' +
                        'document.body.appendChild(textArea);' +
                        'textArea.focus();' +
                        'textArea.select();' +
                        
                        'var successful = document.execCommand("copy");' +
                        'document.body.removeChild(textArea);' +
                        
                        'if (successful) {' +
                            'showCopySuccess(buttonElement, successMessage);' +
                        '} else {' +
                            'showError("Copy failed. Please manually select and copy the text.");' +
                        '}' +
                    '} catch (err) {' +
                        'showError("Copy not supported. Please manually select and copy the text.");' +
                    '}' +
                '}' +
                
                'function showCopySuccess(buttonElement, message) {' +
                    'var originalText = buttonElement.textContent;' +
                    'buttonElement.textContent = "✅ Copied!";' +
                    'buttonElement.className = "copy-btn copied";' +
                    
                    'setTimeout(function() {' +
                        'buttonElement.textContent = originalText;' +
                        'buttonElement.className = "copy-btn";' +
                    '}, 2000);' +
                    
                    'showSuccess(message);' +
                '}' +
                
                'function setLoadingState(loading) {' +
                    'elements.translateBtn.disabled = loading;' +
                    'elements.translateBtn.textContent = loading ? "Translating..." : "Translate Message";' +
                    'elements.messageText.disabled = loading;' +
                '}' +
                
                'function showTranslationResult(response) {' +
                    '/* 結果を保存 */' +
                    'currentTranslation = {' +
                        'subject: response.email_subject || "Service Update",' +
                        'text: response.translated_text || "Translation not available",' +
                        'language: response.detected_language || "Unknown"' +
                    '};' +
                    
                    '/* UIに表示 */' +
                    'elements.translationResult.textContent = currentTranslation.text;' +
                    'elements.emailSubjectResult.textContent = currentTranslation.subject;' +
                    'elements.resultSection.style.display = "block";' +
                    'elements.errorSection.style.display = "none";' +
                '}' +
                
                'function showError(message) {' +
                    'elements.errorSection.textContent = message;' +
                    'elements.errorSection.style.display = "block";' +
                    'elements.successSection.style.display = "none";' +
                    'elements.resultSection.style.display = "none";' +
                '}' +
                
                'function showSuccess(message) {' +
                    'elements.successSection.textContent = message;' +
                    'elements.successSection.style.display = "block";' +
                    'elements.errorSection.style.display = "none";' +
                '}' +
                
                'function hideMessages() {' +
                    'elements.resultSection.style.display = "none";' +
                    'elements.errorSection.style.display = "none";' +
                    'elements.successSection.style.display = "none";' +
                '}' +
                
                '/* 初期化 */' +
                'setTimeout(function() {' +
                    'elements.messageText.focus();' +
                    'elements.translateBtn.disabled = true;' +
                '}, 200);' +
                
            '</script>' +
        '</body>' +
    '</html>';
    
    callback(null, { 
        eventResponse: strHTMLResponse
    });
    
};