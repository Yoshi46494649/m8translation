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
            '</style>' +
        '</head>' +
        '<body>' +
            '<div class="main-container">' +
                '<h1>🌐 Smart Message Translator</h1>' +
                
                '<div class="form-group">' +
                    '<label for="messageText">Enter message to translate:</label>' +
                    '<textarea id="messageText" placeholder="Type or paste your message here..."></textarea>' +
                    '<div class="char-counter" id="charCounter">0/1000 characters</div>' +
                '</div>' +
                
                '<button id="translateBtn" type="button">Translate Message</button>' +
                
                '<div id="resultSection" class="result-section">' +
                    '<label>📧 Email Subject:</label>' +
                    '<div id="emailSubjectResult" class="email-subject-box"></div>' +
                    
                    '<label>📝 English Translation:</label>' +
                    '<div id="translationResult" class="result-box"></div>' +
                    
                    '<div class="insertion-buttons">' +
                        '<button id="insertEmailBtn" class="insert-btn insert-email">' +
                            '📧 Insert to Email' +
                        '</button>' +
                        '<button id="insertSmsBtn" class="insert-btn insert-sms">' +
                            '📱 Insert to SMS' +
                        '</button>' +
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
                    'insertEmailBtn: document.getElementById("insertEmailBtn"),' +
                    'insertSmsBtn: document.getElementById("insertSmsBtn")' +
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
                
                '/* Email挿入 */' +
                'elements.insertEmailBtn.addEventListener("click", function() {' +
                    'insertToEmail();' +
                '});' +
                
                '/* SMS挿入 */' +
                'elements.insertSmsBtn.addEventListener("click", function() {' +
                    'insertToSMS();' +
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
                
                'function insertToEmail() {' +
                    'try {' +
                        '/* ServiceM8のEmail UIに挿入するためのデータ準備 */' +
                        'var emailData = {' +
                            'subject: currentTranslation.subject,' +
                            'body: currentTranslation.text,' +
                            'jobUuid: CONFIG.JOB_UUID' +
                        '};' +
                        
                        '/* ServiceM8のsessionStorageに保存 */' +
                        'if (typeof Storage !== "undefined") {' +
                            'sessionStorage.setItem("translatedEmail", JSON.stringify(emailData));' +
                        '}' +
                        
                        '/* 成功メッセージを表示 */' +
                        'showSuccess("Email content prepared! Open Job Card → Email → New Email to see the translation.");' +
                        
                        '/* 5秒後にウィンドウを閉じる */' +
                        'setTimeout(function() {' +
                            'client.closeWindow();' +
                        '}, 3000);' +
                        
                    '} catch (error) {' +
                        'showError("Failed to prepare email insertion: " + error.message);' +
                    '}' +
                '}' +
                
                'function insertToSMS() {' +
                    'try {' +
                        '/* ServiceM8のSMS UIに挿入するためのデータ準備 */' +
                        'var smsData = {' +
                            'message: currentTranslation.text,' +
                            'jobUuid: CONFIG.JOB_UUID' +
                        '};' +
                        
                        '/* ServiceM8のsessionStorageに保存 */' +
                        'if (typeof Storage !== "undefined") {' +
                            'sessionStorage.setItem("translatedSMS", JSON.stringify(smsData));' +
                        '}' +
                        
                        '/* 成功メッセージを表示 */' +
                        'showSuccess("SMS content prepared! Open Job Card → SMS to see the translation.");' +
                        
                        '/* 5秒後にウィンドウを閉じる */' +
                        'setTimeout(function() {' +
                            'client.closeWindow();' +
                        '}, 3000);' +
                        
                    '} catch (error) {' +
                        'showError("Failed to prepare SMS insertion: " + error.message);' +
                    '}' +
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