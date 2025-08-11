'use strict';

// ServiceM8 Smart Message Translator - Production Version
exports.handler = (event, context, callback) => {
    
    console.log('Smart Message Translator invoked:', {
        jobUUID: event.eventArgs && event.eventArgs.jobUUID,
        accountUUID: event.auth && event.auth.accountUUID,
        timestamp: new Date().toISOString()
    });
    
    var strJobUUID = event.eventArgs.jobUUID || '';
    var strAccessToken = event.auth.accessToken || '';
    var strAccountUUID = event.auth.accountUUID || '';
    
    // Production translation interface
    var strHTMLResponse = '' +
    '<html>' +
        '<head>' +
            '<link rel="stylesheet" href="https://platform.servicem8.com/sdk/1.0/sdk.css">' +
            '<script src="https://platform.servicem8.com/sdk/1.0/sdk.js"></script>' +
            '<meta name="mobile-web-app-capable" content="yes">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
            '<script>' +
                'var client = SMClient.init();' +
                'client.resizeWindow(540, 420);' +
            '</script>' +
            '<style>' +
                ':root {' +
                    '--servicem8-primary: #007cba;' +
                    '--servicem8-secondary: #6c757d;' +
                    '--servicem8-success: #28a745;' +
                    '--servicem8-danger: #dc3545;' +
                    '--servicem8-light: #f8f9fa;' +
                    '--servicem8-dark: #343a40;' +
                    '--border-radius: 6px;' +
                '}' +
                '* { box-sizing: border-box; margin: 0; padding: 0; }' +
                'body {' +
                    'font-family: Arial, sans-serif;' +
                    'font-size: 14px;' +
                    'line-height: 1.4;' +
                    'color: var(--servicem8-dark);' +
                    'background-color: #ffffff;' +
                    'overflow: auto;' +
                    'height: 100vh;' +
                '}' +
                '.container {' +
                    'max-width: 540px;' +
                    'max-height: 420px;' +
                    'overflow-y: auto;' +
                    'padding: 20px;' +
                    'display: flex;' +
                    'flex-direction: column;' +
                    'height: 100vh;' +
                '}' +
                '.main-content {' +
                    'flex: 1;' +
                    'display: flex;' +
                    'flex-direction: column;' +
                '}' +
                '.input-section {' +
                    'margin-bottom: 16px;' +
                '}' +
                'label {' +
                    'display: block;' +
                    'margin-bottom: 6px;' +
                    'font-weight: 500;' +
                    'color: var(--servicem8-dark);' +
                '}' +
                '#messageInput {' +
                    'width: 100%;' +
                    'padding: 12px;' +
                    'border: 1px solid #dee2e6;' +
                    'border-radius: var(--border-radius);' +
                    'font-family: inherit;' +
                    'font-size: 14px;' +
                    'resize: vertical;' +
                    'min-height: 100px;' +
                    'transition: border-color 0.2s;' +
                '}' +
                '#messageInput:focus {' +
                    'outline: none;' +
                    'border-color: var(--servicem8-primary);' +
                    'box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.1);' +
                '}' +
                '.input-info {' +
                    'display: flex;' +
                    'justify-content: space-between;' +
                    'margin-top: 6px;' +
                    'font-size: 12px;' +
                    'color: var(--servicem8-secondary);' +
                '}' +
                '.detected-language {' +
                    'font-weight: 500;' +
                    'color: var(--servicem8-primary);' +
                '}' +
                '.translation-section {' +
                    'margin-bottom: 16px;' +
                '}' +
                '.output-container {' +
                    'display: flex;' +
                    'flex-direction: column;' +
                    'margin-bottom: 12px;' +
                '}' +
                '.text-with-copy {' +
                    'display: flex;' +
                    'align-items: flex-start;' +
                    'gap: 8px;' +
                '}' +
                '.translated-text {' +
                    'flex: 1;' +
                    'padding: 12px;' +
                    'border: 1px solid #dee2e6;' +
                    'border-radius: var(--border-radius);' +
                    'background-color: var(--servicem8-light);' +
                    'min-height: 80px;' +
                    'white-space: pre-wrap;' +
                    'word-wrap: break-word;' +
                '}' +
                '.email-subject {' +
                    'flex: 1;' +
                    'padding: 12px;' +
                    'border-radius: var(--border-radius);' +
                    'white-space: pre-wrap;' +
                    'word-wrap: break-word;' +
                    'font-weight: 500;' +
                    'color: var(--servicem8-primary);' +
                    'min-height: 40px;' +
                    'background-color: #f8f9fa;' +
                    'border: 1px solid #e9ecef;' +
                '}' +
                '.copy-button {' +
                    'background: var(--servicem8-primary);' +
                    'color: white;' +
                    'border: none;' +
                    'font-size: 14px;' +
                    'cursor: pointer;' +
                    'padding: 8px 12px;' +
                    'border-radius: var(--border-radius);' +
                    'transition: all 0.2s;' +
                    'white-space: nowrap;' +
                    'min-width: 44px;' +
                    'height: 44px;' +
                    'display: flex;' +
                    'align-items: center;' +
                    'justify-content: center;' +
                '}' +
                '.copy-button:hover {' +
                    'background-color: #0066a0;' +
                    'transform: translateY(-1px);' +
                '}' +
                '.copy-button.copied {' +
                    'background-color: var(--servicem8-success);' +
                    'transform: scale(1.05);' +
                '}' +
                '.primary-button {' +
                    'padding: 12px 24px;' +
                    'border: none;' +
                    'border-radius: var(--border-radius);' +
                    'font-size: 14px;' +
                    'font-weight: 500;' +
                    'cursor: pointer;' +
                    'transition: all 0.2s;' +
                    'display: flex;' +
                    'align-items: center;' +
                    'justify-content: center;' +
                    'gap: 8px;' +
                    'min-height: 44px;' +
                    'background-color: var(--servicem8-primary);' +
                    'color: white;' +
                    'width: 100%;' +
                    'margin-bottom: 12px;' +
                '}' +
                '.primary-button:hover:not(:disabled) {' +
                    'background-color: #0066a0;' +
                '}' +
                '.primary-button:disabled {' +
                    'background-color: var(--servicem8-secondary);' +
                    'cursor: not-allowed;' +
                '}' +
                '.close-button {' +
                    'padding: 8px 16px;' +
                    'border: none;' +
                    'border-radius: var(--border-radius);' +
                    'font-size: 12px;' +
                    'cursor: pointer;' +
                    'background-color: var(--servicem8-secondary);' +
                    'color: white;' +
                    'margin-top: 10px;' +
                '}' +
                '.close-button:hover {' +
                    'background-color: #5a6268;' +
                '}' +
                '.loading-spinner {' +
                    'width: 16px;' +
                    'height: 16px;' +
                    'border: 2px solid rgba(255, 255, 255, 0.3);' +
                    'border-top: 2px solid white;' +
                    'border-radius: 50%;' +
                    'animation: spin 1s linear infinite;' +
                    'display: none;' +
                '}' +
                '.loading-spinner.active { display: block; }' +
                '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }' +
                '.error-message {' +
                    'background-color: #f8d7da;' +
                    'border: 1px solid #f5c6cb;' +
                    'color: #dc3545;' +
                    'padding: 12px;' +
                    'border-radius: var(--border-radius);' +
                    'margin: 10px 0;' +
                    'font-size: 14px;' +
                '}' +
                '.fade-in { animation: fadeIn 0.3s ease-in; }' +
                '@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }' +
            '</style>' +
        '</head>' +
        '<body>' +
            '<div class="container">' +
                '<div class="main-content">' +
                    '<div class="input-section">' +
                        '<label for="messageInput">Enter message to translate:</label>' +
                        '<textarea id="messageInput" placeholder="Type or paste your message here..." rows="4" maxlength="1000"></textarea>' +
                        '<div class="input-info">' +
                            '<span id="charCount">0/1000</span>' +
                            '<span id="detectedLanguage" class="detected-language"></span>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="translation-section" id="translationSection" style="display: none;">' +
                        '<label for="translatedOutput">Translated Message:</label>' +
                        '<div class="output-container">' +
                            '<div class="text-with-copy">' +
                                '<div id="translatedOutput" class="translated-text"></div>' +
                                '<button id="copyButton" class="copy-button" title="Copy message to clipboard">📋</button>' +
                            '</div>' +
                        '</div>' +
                        
                        '<label for="emailSubject">Email Subject:</label>' +
                        '<div class="output-container">' +
                            '<div class="text-with-copy">' +
                                '<div id="emailSubject" class="email-subject"></div>' +
                                '<button id="copySubjectButton" class="copy-button" title="Copy subject to clipboard">📋</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    
                    '<div class="actions">' +
                        '<button id="translateButton" class="primary-button">' +
                            '<span class="button-text">Translate Message</span>' +
                            '<span class="loading-spinner" id="loadingSpinner"></span>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                
                '<button onclick="client.closeWindow();" class="close-button">Close</button>' +
            '</div>' +
            
            '<script>' +
                // Global variables
                'var isTranslating = false;' +
                'var rateLimitRequests = [];' +
                'var MAX_REQUESTS_PER_MINUTE = 20;' +
                
                // Initialize
                'document.addEventListener("DOMContentLoaded", function() {' +
                    'initializeApp();' +
                '});' +
                
                'function initializeApp() {' +
                    'var messageInput = document.getElementById("messageInput");' +
                    'var translateButton = document.getElementById("translateButton");' +
                    'var copyButton = document.getElementById("copyButton");' +
                    'var copySubjectButton = document.getElementById("copySubjectButton");' +
                    
                    // Event listeners
                    'messageInput.addEventListener("input", handleInputChange);' +
                    'messageInput.addEventListener("input", debounce(detectLanguage, 500));' +
                    'translateButton.addEventListener("click", handleTranslate);' +
                    'copyButton.addEventListener("click", function() { copyToClipboard("message"); });' +
                    'copySubjectButton.addEventListener("click", function() { copyToClipboard("subject"); });' +
                    
                    // Keyboard shortcuts
                    'document.addEventListener("keydown", function(event) {' +
                        'if (event.key === "Escape") {' +
                            'client.closeWindow();' +
                        '}' +
                    '});' +
                '}' +
                
                'function handleInputChange(event) {' +
                    'var text = event.target.value;' +
                    'var length = text.length;' +
                    
                    'document.getElementById("charCount").textContent = length + "/1000";' +
                    'document.getElementById("translateButton").disabled = length === 0 || length > 1000;' +
                    
                    'if (length === 0) {' +
                        'document.getElementById("translationSection").style.display = "none";' +
                    '}' +
                '}' +
                
                'function detectLanguage(event) {' +
                    'var text = event.target.value.trim();' +
                    'if (text.length < 3) {' +
                        'document.getElementById("detectedLanguage").textContent = "";' +
                        'return;' +
                    '}' +
                    
                    // Simple language detection
                    'var detectedLang = "";' +
                    'if (/[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]/.test(text)) {' +
                        'detectedLang = "Japanese";' +
                    '} else if (/[\\uAC00-\\uD7AF]/.test(text)) {' +
                        'detectedLang = "Korean";' +
                    '} else if (/[\\u4E00-\\u9FFF]/.test(text)) {' +
                        'detectedLang = "Chinese";' +
                    '} else if (/[\\u0400-\\u04FF]/.test(text)) {' +
                        'detectedLang = "Russian";' +
                    '} else if (/[a-zA-Z]/.test(text)) {' +
                        'detectedLang = "English-like";' +
                    '}' +
                    
                    'document.getElementById("detectedLanguage").textContent = detectedLang ? "Detected: " + detectedLang : "";' +
                '}' +
                
                'function canMakeRequest() {' +
                    'var now = Date.now();' +
                    'rateLimitRequests = rateLimitRequests.filter(function(timestamp) {' +
                        'return now - timestamp < 60000;' +
                    '});' +
                    'return rateLimitRequests.length < MAX_REQUESTS_PER_MINUTE;' +
                '}' +
                
                'function handleTranslate() {' +
                    'var text = document.getElementById("messageInput").value.trim();' +
                    
                    'if (!text) {' +
                        'showError("Please enter a message to translate");' +
                        'return;' +
                    '}' +
                    
                    'if (!canMakeRequest()) {' +
                        'showError("Too many requests. Please wait before trying again.");' +
                        'return;' +
                    '}' +
                    
                    'if (isTranslating) return;' +
                    
                    'startTranslation();' +
                    
                    'var xhr = new XMLHttpRequest();' +
                    'xhr.timeout = 15000;' +
                    
                    'xhr.onreadystatechange = function() {' +
                        'if (xhr.readyState === 4) {' +
                            'endTranslation();' +
                            
                            'if (xhr.status === 200) {' +
                                'try {' +
                                    'var response = JSON.parse(xhr.responseText);' +
                                    'showTranslationResult(response);' +
                                    'rateLimitRequests.push(Date.now());' +
                                '} catch (e) {' +
                                    'showError("Translation failed: Invalid response");' +
                                '}' +
                            '} else if (xhr.status === 429) {' +
                                'showError("Too many requests. Please wait and try again.");' +
                            '} else if (xhr.status >= 500) {' +
                                'showError("Translation service temporarily unavailable");' +
                            '} else {' +
                                'showError("Translation failed. Please try again.");' +
                            '}' +
                        '}' +
                    '};' +
                    
                    'xhr.onerror = function() {' +
                        'endTranslation();' +
                        'showError("Network error. Please check your connection.");' +
                    '};' +
                    
                    'xhr.ontimeout = function() {' +
                        'endTranslation();' +
                        'showError("Request timeout. Please try again.");' +
                    '};' +
                    
                    'xhr.open("POST", "https://m8translation.vercel.app/api/translate", true);' +
                    'xhr.setRequestHeader("Content-Type", "application/json");' +
                    
                    'var requestData = {' +
                        'text: text,' +
                        'company_uuid: "' + strAccountUUID + '",' +
                        'job_uuid: "' + strJobUUID + '",' +
                        'access_token: "' + strAccessToken + '"' +
                    '};' +
                    
                    'xhr.send(JSON.stringify(requestData));' +
                '}' +
                
                'function startTranslation() {' +
                    'isTranslating = true;' +
                    'document.getElementById("translateButton").disabled = true;' +
                    'document.getElementById("loadingSpinner").classList.add("active");' +
                    'document.querySelector(".button-text").textContent = "Translating...";' +
                '}' +
                
                'function endTranslation() {' +
                    'isTranslating = false;' +
                    'document.getElementById("translateButton").disabled = false;' +
                    'document.getElementById("loadingSpinner").classList.remove("active");' +
                    'document.querySelector(".button-text").textContent = "Translate Message";' +
                '}' +
                
                'function showTranslationResult(data) {' +
                    'document.getElementById("translatedOutput").textContent = data.translated_text || "";' +
                    'document.getElementById("emailSubject").textContent = data.email_subject || "";' +
                    
                    'var translationSection = document.getElementById("translationSection");' +
                    'translationSection.style.display = "block";' +
                    'translationSection.classList.add("fade-in");' +
                    
                    // Clear any error messages
                    'var errorMsg = document.querySelector(".error-message");' +
                    'if (errorMsg) errorMsg.remove();' +
                '}' +
                
                'function copyToClipboard(type) {' +
                    'var text, button;' +
                    'if (type === "message") {' +
                        'text = document.getElementById("translatedOutput").textContent;' +
                        'button = document.getElementById("copyButton");' +
                    '} else {' +
                        'text = document.getElementById("emailSubject").textContent;' +
                        'button = document.getElementById("copySubjectButton");' +
                    '}' +
                    
                    'if (!text) {' +
                        'console.log("No text to copy");' +
                        'return;' +
                    '}' +
                    
                    'console.log("Attempting to copy:", text.substring(0, 50) + "...");' +
                    
                    // Try modern clipboard API first
                    'if (navigator.clipboard && window.isSecureContext) {' +
                        'navigator.clipboard.writeText(text).then(function() {' +
                            'console.log("Clipboard API copy successful");' +
                            'showCopySuccess(button);' +
                        '}).catch(function(error) {' +
                            'console.log("Clipboard API failed, trying fallback:", error);' +
                            'copyWithFallback(text, button);' +
                        '});' +
                    '} else {' +
                        'console.log("Clipboard API not available, using fallback");' +
                        'copyWithFallback(text, button);' +
                    '}' +
                '}' +
                
                'function copyWithFallback(text, button) {' +
                    'var success = false;' +
                    
                    'try {' +
                        // Create textarea element
                        'var textarea = document.createElement("textarea");' +
                        'textarea.value = text;' +
                        
                        // Set properties for mobile compatibility
                        'textarea.style.position = "fixed";' +
                        'textarea.style.left = "-999999px";' +
                        'textarea.style.top = "-999999px";' +
                        'textarea.style.opacity = "0";' +
                        'textarea.setAttribute("readonly", "");' +
                        'textarea.setAttribute("contenteditable", "true");' +
                        
                        'document.body.appendChild(textarea);' +
                        
                        // For mobile devices
                        'if (navigator.userAgent.match(/ipad|android|iphone/i)) {' +
                            'var editable = textarea.contentEditable;' +
                            'var readOnly = textarea.readOnly;' +
                            
                            'textarea.contentEditable = true;' +
                            'textarea.readOnly = false;' +
                            
                            'var range = document.createRange();' +
                            'range.selectNodeContents(textarea);' +
                            
                            'var sel = window.getSelection();' +
                            'sel.removeAllRanges();' +
                            'sel.addRange(range);' +
                            
                            'textarea.setSelectionRange(0, 999999);' +
                            'textarea.contentEditable = editable;' +
                            'textarea.readOnly = readOnly;' +
                        '} else {' +
                            // For desktop
                            'textarea.focus();' +
                            'textarea.select();' +
                        '}' +
                        
                        // Execute copy command
                        'success = document.execCommand("copy");' +
                        'console.log("execCommand copy result:", success);' +
                        
                        'document.body.removeChild(textarea);' +
                        
                        'if (success) {' +
                            'showCopySuccess(button);' +
                        '} else {' +
                            'showCopyFallback(button, text);' +
                        '}' +
                        
                    '} catch (error) {' +
                        'console.error("Fallback copy failed:", error);' +
                        'showCopyFallback(button, text);' +
                    '}' +
                '}' +
                
                'function showCopyFallback(button, text) {' +
                    'console.log("Showing manual copy instruction");' +
                    // Show manual copy instruction
                    'var instruction = "Text ready to copy:\\n\\n" + text + "\\n\\nPlease copy this text manually.";' +
                    'alert(instruction);' +
                    
                    // Still show visual feedback
                    'showCopySuccess(button);' +
                '}' +
                
                'function showCopySuccess(button) {' +
                    'var originalText = button.textContent;' +
                    'button.textContent = "✓";' +
                    'button.classList.add("copied");' +
                    
                    'setTimeout(function() {' +
                        'button.textContent = originalText;' +
                        'button.classList.remove("copied");' +
                    '}, 2000);' +
                '}' +
                
                'function showError(message) {' +
                    // Remove existing error
                    'var existingError = document.querySelector(".error-message");' +
                    'if (existingError) existingError.remove();' +
                    
                    'var errorDiv = document.createElement("div");' +
                    'errorDiv.className = "error-message";' +
                    'errorDiv.textContent = message;' +
                    
                    'var actions = document.querySelector(".actions");' +
                    'actions.parentNode.insertBefore(errorDiv, actions);' +
                    
                    // Auto remove after 5 seconds
                    'setTimeout(function() {' +
                        'if (errorDiv.parentNode) errorDiv.remove();' +
                    '}, 5000);' +
                '}' +
                
                'function debounce(func, wait) {' +
                    'var timeout;' +
                    'return function() {' +
                        'var context = this, args = arguments;' +
                        'clearTimeout(timeout);' +
                        'timeout = setTimeout(function() { func.apply(context, args); }, wait);' +
                    '};' +
                '}' +
            '</script>' +
        '</body>' +
    '</html>';
    
    callback(null, { 
        eventResponse: strHTMLResponse
    });
};