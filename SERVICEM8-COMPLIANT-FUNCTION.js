'use strict';

// ServiceM8公式仕様準拠版 - 確実に動作する実装
exports.handler = (event, context, callback) => {
    
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    var strJobUUID = event.eventArgs.jobUUID || 'unknown';
    var strAccessToken = event.auth.accessToken || '';
    var strAccountUUID = event.auth.accountUUID || '';
    
    // ServiceM8公式サンプル準拠のHTML生成
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
                    'padding: 24px;' +
                    'box-shadow: 0 2px 4px rgba(0,0,0,0.1);' +
                    'max-width: 500px;' +
                    'margin: 0 auto;' +
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
            '</style>' +
        '</head>' +
        '<body>' +
            '<div class="main-container">' +
                '<h1>🌐 Smart Message Translator</h1>' +
                
                '<div class="form-group">' +
                    '<label for="messageText">Enter message to translate:</label>' +
                    '<textarea id="messageText" placeholder="Type or paste your message here..." maxlength="1000"></textarea>' +
                    '<div class="char-counter" id="charCounter">0/1000 characters</div>' +
                '</div>' +
                
                '<button id="translateBtn" type="button">Translate Message</button>' +
                
                '<div id="resultSection" class="result-section">' +
                    '<label>English Translation:</label>' +
                    '<div id="translationResult" class="result-box"></div>' +
                    
                    '<label>Generated Email Subject:</label>' +
                    '<div id="emailSubjectResult" class="email-subject-box"></div>' +
                '</div>' +
                
                '<div id="errorSection" class="error-message" style="display: none;"></div>' +
                
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
                
                'var elements = {' +
                    'messageText: document.getElementById("messageText"),' +
                    'translateBtn: document.getElementById("translateBtn"),' +
                    'charCounter: document.getElementById("charCounter"),' +
                    'resultSection: document.getElementById("resultSection"),' +
                    'translationResult: document.getElementById("translationResult"),' +
                    'emailSubjectResult: document.getElementById("emailSubjectResult"),' +
                    'errorSection: document.getElementById("errorSection")' +
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
                    
                    'hideResults();' +
                    'setLoadingState(true);' +
                    
                    'performTranslation(messageText);' +
                '});' +
                
                'function performTranslation(text) {' +
                    'var xhr = new XMLHttpRequest();' +
                    'xhr.timeout = 15000;' + // 15秒タイムアウト
                    
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
                                'showError("Translation request failed. Status: " + xhr.status + "\\nPlease try again.");' +
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
                
                'function setLoadingState(loading) {' +
                    'elements.translateBtn.disabled = loading;' +
                    'elements.translateBtn.textContent = loading ? "Translating..." : "Translate Message";' +
                    'elements.messageText.disabled = loading;' +
                '}' +
                
                'function showTranslationResult(response) {' +
                    'elements.translationResult.textContent = response.translated_text || "Translation not available";' +
                    'elements.emailSubjectResult.textContent = response.email_subject || "Subject not generated";' +
                    'elements.resultSection.style.display = "block";' +
                    'elements.errorSection.style.display = "none";' +
                '}' +
                
                'function showError(message) {' +
                    'elements.errorSection.textContent = message;' +
                    'elements.errorSection.style.display = "block";' +
                    'elements.resultSection.style.display = "none";' +
                '}' +
                
                'function hideResults() {' +
                    'elements.resultSection.style.display = "none";' +
                    'elements.errorSection.style.display = "none";' +
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