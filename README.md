# Smart Message Translator for ServiceM8

AI-powered translation add-on for ServiceM8 that automatically translates messages to English with business email subject generation.

*Updated with new OpenAI API key configuration - January 2025*

## Features

- **Auto Language Detection**: Detects 50+ languages including Japanese, Korean, Chinese, Spanish, French, German
- **AI Translation**: Uses OpenAI GPT-4 for natural, business-appropriate translations
- **Email Subject Generation**: Automatically creates professional email subjects
- **One-Click Integration**: Direct integration with ServiceM8 email and SMS composition
- **Rate Limiting**: Built-in protection against excessive API usage
- **Secure**: Encrypted API key storage and ServiceM8 OAuth authentication

## Technical Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3 (ServiceM8 design compliant)
- **Backend**: Node.js, Express.js on Vercel
- **AI**: OpenAI GPT-4 Turbo API
- **Authentication**: ServiceM8 OAuth 2.0
- **Storage**: Vercel KV (Redis-compatible)
- **Deployment**: Vercel serverless functions

## Project Structure

```
/
├── api/                    # Vercel serverless functions
│   ├── translate.js       # Main translation endpoint
│   ├── detect-language.js # Language detection endpoint
│   ├── settings.js        # Settings management
│   └── oauth/
│       └── callback.js    # OAuth callback handler
├── public/                # Static assets served by Vercel
│   ├── translate-compose.html
│   ├── styles.css
│   └── script.js
├── manifest.json          # ServiceM8 add-on manifest
├── translate-compose.js   # Main entry point
├── package.json
├── vercel.json           # Vercel configuration
└── .env.example          # Environment variables template
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# ServiceM8 OAuth
SERVICEM8_CLIENT_ID=241055
SERVICEM8_CLIENT_SECRET=your_client_secret
SERVICEM8_API_URL=https://api.servicem8.com

# OpenAI
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_URL=https://api.openai.com/v1/chat/completions

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_32_character_encryption_key

# Vercel KV Storage
KV_REST_API_URL=your_kv_url
KV_REST_API_TOKEN=your_kv_token
```

## API Endpoints

### `GET /translate-compose`
Serves the main translation interface with ServiceM8 context.

**Query Parameters:**
- `job_uuid` (optional): ServiceM8 job identifier
- `company_uuid` (required): ServiceM8 company identifier  
- `access_token` (required): ServiceM8 access token

### `POST /api/translate`
Translates text using OpenAI GPT-4.

**Request Body:**
```json
{
  "text": "Message to translate",
  "company_uuid": "uuid",
  "access_token": "token"
}
```

**Response:**
```json
{
  "translated_text": "Professional English translation",
  "email_subject": "Service Update - Brief Description",
  "detected_language": "Japanese",
  "processing_time_ms": 1245
}
```

### `POST /api/detect-language`
Fast language detection for UI feedback.

### `GET/POST /api/settings`
Manage company settings and OpenAI API keys.

### `GET/POST /api/oauth/callback`
Handle ServiceM8 OAuth authorization flow.

## Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your keys
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Test locally:**
   Open `http://localhost:3000/translate-compose?company_uuid=test&access_token=AT_test`

## Deployment

1. **Deploy to Vercel:**
   ```bash
   npm run deploy
   ```

2. **Set environment variables in Vercel dashboard**

3. **Update ServiceM8 manifest with production URL**

## ServiceM8 Integration

### Manifest Registration
The add-on is defined in `manifest.json` with:
- **Popup Mode**: 540x420px iframe
- **Context**: Job pages
- **OAuth Scopes**: `job:read`, `customer:read`

### OAuth Flow
1. User clicks "Translate Message" in ServiceM8 job page
2. ServiceM8 redirects to `/translate-compose` with auth parameters
3. If not authorized, redirect to ServiceM8 OAuth
4. After authorization, store encrypted tokens
5. User can now translate messages

## Security Features

- **HTTPS Enforcement**: All communication over TLS
- **CORS Protection**: Only ServiceM8 domains allowed
- **Rate Limiting**: 20 requests per minute per company
- **Token Encryption**: AES-256 encryption for stored API keys
- **Input Validation**: All user inputs sanitized and validated
- **JWT Verification**: ServiceM8 token validation

## Performance Requirements

- **Translation Speed**: < 2 seconds average
- **UI Response**: < 100ms for interactions  
- **Page Load**: < 500ms initial load
- **File Size**: < 50KB total (CSS + JS)

## Browser Support

- Chrome 80+
- Safari 13+
- Firefox 75+
- Edge 80+

## Rate Limits

- **Translation API**: 20 requests/minute per company
- **Language Detection**: No limit (lightweight operation)
- **Settings API**: 10 requests/minute per company

## Error Handling

All errors are logged with structured JSON format:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "error",
  "message": "Translation failed",
  "company_uuid": "uuid",
  "error": "OpenAI API timeout"
}
```

## Contributing

1. Follow ServiceM8 development guidelines
2. Maintain WCAG 2.1 AA accessibility compliance
3. Test across all supported browsers
4. Update documentation for any API changes

## Support

For issues or questions:
1. Check ServiceM8 developer documentation
2. Review error logs in Vercel dashboard
3. Test with development environment

## License

MIT License - see LICENSE file for details.