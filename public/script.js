/**
 * Smart Message Translator for ServiceM8
 * Frontend JavaScript handling UI interactions and API communication
 */

class TranslationApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.setupKeyboardShortcuts();
        this.loadServiceM8Context();
        this.rateLimiter = new RateLimiter(20, 60000); // 20 requests per minute
    }

    initializeElements() {
        // Input elements
        this.messageInput = document.getElementById('messageInput');
        this.charCount = document.getElementById('charCount');
        this.detectedLanguage = document.getElementById('detectedLanguage');

        // Output elements
        this.translationSection = document.getElementById('translationSection');
        this.translatedOutput = document.getElementById('translatedOutput');
        this.emailSubject = document.getElementById('emailSubject');

        // Button elements
        this.translateButton = document.getElementById('translateButton');
        this.emailButton = document.getElementById('emailButton');
        this.smsButton = document.getElementById('smsButton');
        this.copyButton = document.getElementById('copyButton');
        this.actionButtons = document.getElementById('actionButtons');

        // Status elements
        this.statusIndicator = document.getElementById('statusIndicator');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.progressStatus = document.getElementById('progressStatus');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');

        // Auto-close elements
        this.autoClose = document.getElementById('autoClose');
        this.countdown = document.getElementById('countdown');
        this.cancelClose = document.getElementById('cancelClose');

        // ServiceM8 context
        this.serviceM8Context = null;
    }

    bindEvents() {
        // Input events
        this.messageInput.addEventListener('input', this.handleInputChange.bind(this));
        this.messageInput.addEventListener('paste', this.handlePaste.bind(this));

        // Button events
        this.translateButton.addEventListener('click', this.handleTranslate.bind(this));
        this.emailButton.addEventListener('click', this.handleOpenEmail.bind(this));
        this.smsButton.addEventListener('click', this.handleOpenSMS.bind(this));
        this.copyButton.addEventListener('click', this.handleCopy.bind(this));
        this.cancelClose.addEventListener('click', this.handleCancelClose.bind(this));

        // Auto-detect language on input
        this.messageInput.addEventListener('input', this.debounce(this.detectLanguage.bind(this), 500));
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl+Enter: Translate and open email
            if (event.ctrlKey && event.key === 'Enter') {
                event.preventDefault();
                this.handleTranslateAndEmail();
            }

            // Escape: Close dialog
            if (event.key === 'Escape') {
                event.preventDefault();
                this.closeDialog();
            }
        });
    }

    async loadServiceM8Context() {
        try {
            // Get ServiceM8 context from injected configuration (secure)
            if (!window.SERVICEM8_CONFIG) {
                this.showError('ServiceM8 configuration not found');
                return;
            }

            this.serviceM8Context = {
                job_uuid: window.SERVICEM8_CONFIG.job_uuid,
                company_uuid: window.SERVICEM8_CONFIG.company_uuid,
                session_token: window.SERVICEM8_CONFIG.session_token // Use secure session token
            };

            // Validate required parameters
            if (!this.serviceM8Context.company_uuid || !this.serviceM8Context.session_token) {
                this.showError('Missing ServiceM8 authentication parameters');
                return;
            }

            this.updateStatus('Ready', 'ready');
        } catch (error) {
            console.error('Failed to load ServiceM8 context:', error);
            this.showError('Failed to initialize ServiceM8 context');
        }
    }

    handleInputChange(event) {
        const text = event.target.value;
        const length = text.length;
        
        // Update character count
        this.charCount.textContent = `${length}/1000`;
        
        // Update translate button state
        this.translateButton.disabled = length === 0 || length > 1000;
        
        // Hide translation section if input is cleared
        if (length === 0) {
            this.translationSection.style.display = 'none';
            this.actionButtons.style.display = 'none';
        }
    }

    handlePaste(event) {
        // Allow paste and then trigger input change
        setTimeout(() => {
            this.handleInputChange({ target: event.target });
        }, 0);
    }

    async detectLanguage(text) {
        if (!text || text.length < 3) {
            this.detectedLanguage.textContent = '';
            return;
        }

        try {
            const response = await fetch('/api/detect-language', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text })
            });

            if (response.ok) {
                const data = await response.json();
                this.detectedLanguage.textContent = data.language ? `Detected: ${data.language}` : '';
            }
        } catch (error) {
            console.error('Language detection failed:', error);
            // Silently fail for language detection
        }
    }

    async handleTranslate() {
        const text = this.messageInput.value.trim();
        
        if (!text) {
            this.showError('Please enter a message to translate');
            return;
        }

        if (!this.rateLimiter.canMakeRequest()) {
            this.showError('Too many requests. Please wait a moment before trying again.');
            return;
        }

        this.startTranslation();

        try {
            console.log('DEBUG: Making translation request with:', {
                text: text,
                company_uuid: this.serviceM8Context.company_uuid,
                session_token: this.serviceM8Context.session_token ? 'present' : 'missing'
            });
            
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: text,
                    company_uuid: this.serviceM8Context.company_uuid,
                    session_token: this.serviceM8Context.session_token // Use secure session token
                })
            });
            
            console.log('DEBUG: Translation response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('DEBUG: Translation error response:', errorData);
                throw new Error(errorData.error || 'Translation failed');
            }

            const data = await response.json();
            console.log('DEBUG: Translation success response:', data);
            this.showTranslationResult(data);
            this.rateLimiter.recordRequest();

        } catch (error) {
            console.error('Translation error:', error);
            this.showError(error.message || 'Translation service temporarily unavailable');
        } finally {
            this.endTranslation();
        }
    }

    async handleTranslateAndEmail() {
        if (this.translatedOutput.textContent) {
            // If already translated, just open email
            this.handleOpenEmail();
        } else {
            // Translate first, then open email
            await this.handleTranslate();
            if (this.translatedOutput.textContent) {
                setTimeout(() => this.handleOpenEmail(), 500);
            }
        }
    }

    startTranslation() {
        this.translateButton.disabled = true;
        this.loadingSpinner.classList.add('active');
        this.updateStatus('Translating...', 'translating');
        this.showProgress(0, 'Translating...');

        // Simulate progress
        let progress = 0;
        this.progressInterval = setInterval(() => {
            progress += 10;
            if (progress <= 90) {
                this.showProgress(progress, 'Translating...');
            }
        }, 200);
    }

    endTranslation() {
        this.translateButton.disabled = false;
        this.loadingSpinner.classList.remove('active');
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        this.showProgress(100, 'Translation complete');
        setTimeout(() => {
            this.progressStatus.style.display = 'none';
        }, 1000);
    }

    showTranslationResult(data) {
        // Display translated text
        this.translatedOutput.textContent = data.translated_text;
        
        // Display email subject
        this.emailSubject.textContent = data.email_subject;
        
        // Update detected language
        if (data.detected_language) {
            this.detectedLanguage.textContent = `Detected: ${data.detected_language}`;
        }
        
        // Show translation section with animation
        this.translationSection.style.display = 'block';
        this.translationSection.classList.add('fade-in');
        
        // Show action buttons
        this.actionButtons.style.display = 'flex';
        
        // Auto-copy to clipboard
        this.copyToClipboard(data.translated_text, false);
        
        this.updateStatus('Translation complete', 'ready');
        
        // Start auto-close countdown
        this.startAutoClose();
    }

    async handleCopy() {
        const text = this.translatedOutput.textContent;
        await this.copyToClipboard(text, true);
    }

    async copyToClipboard(text, showNotification = true) {
        try {
            await navigator.clipboard.writeText(text);
            if (showNotification) {
                this.copyButton.textContent = '✓';
                setTimeout(() => {
                    this.copyButton.textContent = '📋';
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }
    }

    handleOpenEmail() {
        const translatedText = this.translatedOutput.textContent;
        const subject = this.emailSubject.textContent;
        
        if (!translatedText) {
            this.showError('Please translate the message first');
            return;
        }
        
        try {
            // ServiceM8 specific email composition
            if (typeof ServiceM8 !== 'undefined' && ServiceM8.composeEmail) {
                ServiceM8.composeEmail({
                    subject: subject,
                    body: translatedText
                });
            } else {
                // Fallback: Standard mailto link
                const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(translatedText)}`;
                window.open(mailtoLink);
            }
            
            this.closeDialog();
        } catch (error) {
            console.error('Failed to open email composer:', error);
            this.showError('Failed to open email composer');
        }
    }

    handleOpenSMS() {
        const translatedText = this.translatedOutput.textContent;
        
        if (!translatedText) {
            this.showError('Please translate the message first');
            return;
        }
        
        try {
            // ServiceM8 specific SMS composition
            if (typeof ServiceM8 !== 'undefined' && ServiceM8.composeSMS) {
                ServiceM8.composeSMS({
                    body: translatedText
                });
            } else {
                // Fallback: Standard SMS link
                const smsLink = `sms:?body=${encodeURIComponent(translatedText)}`;
                window.open(smsLink);
            }
            
            this.closeDialog();
        } catch (error) {
            console.error('Failed to open SMS composer:', error);
            this.showError('Failed to open SMS composer');
        }
    }

    startAutoClose() {
        let countdown = 5;
        this.countdown.textContent = countdown;
        this.autoClose.style.display = 'block';
        
        this.countdownInterval = setInterval(() => {
            countdown--;
            this.countdown.textContent = countdown;
            
            if (countdown <= 0) {
                this.closeDialog();
            }
        }, 1000);
    }

    handleCancelClose() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        this.autoClose.style.display = 'none';
    }

    closeDialog() {
        try {
            // ServiceM8 specific close
            if (typeof ServiceM8 !== 'undefined' && ServiceM8.closeDialog) {
                ServiceM8.closeDialog();
            } else {
                // Fallback: close window
                window.close();
            }
        } catch (error) {
            console.error('Failed to close dialog:', error);
            window.close();
        }
    }

    showProgress(percentage, message) {
        this.progressStatus.style.display = 'block';
        this.progressFill.style.width = `${percentage}%`;
        this.progressText.textContent = message;
    }

    updateStatus(message, type = '') {
        this.statusIndicator.textContent = message;
        this.statusIndicator.className = `status-indicator ${type}`;
    }

    showError(message) {
        this.updateStatus('Error', 'error');
        alert(message); // Simple error display for now
        console.error('App Error:', message);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Rate Limiter Class
class RateLimiter {
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }

    canMakeRequest() {
        const now = Date.now();
        
        // Remove old requests outside the window
        this.requests = this.requests.filter(timestamp => 
            now - timestamp < this.windowMs
        );
        
        return this.requests.length < this.maxRequests;
    }

    recordRequest() {
        this.requests.push(Date.now());
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TranslationApp();
});