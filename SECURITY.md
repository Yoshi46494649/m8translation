# Security Policy

## Overview

The Smart Message Translator for ServiceM8 handles sensitive data including ServiceM8 access tokens, OpenAI API keys, and customer message content. This document outlines our security measures and policies.

## Data Protection

### Encryption at Rest
- **API Keys**: All OpenAI API keys are encrypted using AES-256-GCM before storage
- **Access Tokens**: ServiceM8 tokens are encrypted with rotating keys
- **Message Content**: Translation text is never permanently stored

### Encryption in Transit
- **HTTPS Only**: All communication enforced over TLS 1.2+
- **Certificate Pinning**: Production deployment uses certificate validation
- **Secure Headers**: HSTS, CSP, and other security headers implemented

### Data Retention
- **Translation Logs**: Metadata only, no actual message content
- **Access Tokens**: Automatically expire per ServiceM8 standards
- **Rate Limit Data**: Cleared after rate limit windows

## Authentication & Authorization

### ServiceM8 OAuth 2.0
- **Standard Flow**: Uses ServiceM8's OAuth 2.0 implementation
- **Scope Limitation**: Only requests minimal required permissions
- **Token Validation**: All incoming requests validated against ServiceM8 API
- **CSRF Protection**: State parameter validation for OAuth flow

### Access Control
- **Company Isolation**: Data strictly segregated by company_uuid
- **Token Expiration**: Automatic cleanup of expired tokens
- **API Key Rotation**: Support for OpenAI API key updates

## Rate Limiting & DDoS Protection

### Application Level
- **Translation API**: 20 requests per minute per company
- **Settings API**: 10 requests per minute per company
- **Language Detection**: Lightweight, no strict limits

### Infrastructure Level
- **Vercel Edge Network**: Built-in DDoS protection
- **Request Size Limits**: Maximum 1000 characters per translation
- **Timeout Protection**: 10-second maximum API call duration

## Input Validation

### Message Content
- **Length Limits**: 1000 character maximum
- **Content Sanitization**: XSS and injection prevention
- **Unicode Handling**: Proper UTF-8 validation

### API Parameters
- **UUID Validation**: Proper format checking for ServiceM8 IDs
- **Token Format**: ServiceM8 access token structure validation
- **Type Checking**: All parameters validated for correct types

## Vulnerability Management

### Security Headers
```
X-Frame-Options: ALLOWALL (Required for ServiceM8 iframe)
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'
```

### Dependencies
- **Regular Updates**: Automated dependency scanning
- **Vulnerability Alerts**: GitHub security advisories enabled
- **Minimal Dependencies**: Only essential packages included

### Code Security
- **No Hardcoded Secrets**: All sensitive data in environment variables
- **Error Information**: Production errors don't expose internal details
- **Logging**: Structured logging without sensitive data

## Incident Response

### Monitoring
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Monitoring**: API response time and failure rate tracking
- **Security Events**: Failed authentication and rate limit violations

### Response Procedures
1. **Detection**: Automated monitoring and manual reporting
2. **Assessment**: Severity classification and impact analysis
3. **Containment**: Immediate threat mitigation
4. **Communication**: User and ServiceM8 notification if required
5. **Recovery**: Service restoration and monitoring
6. **Post-Incident**: Root cause analysis and prevention measures

## Third-Party Security

### OpenAI API
- **API Key Security**: Encrypted storage and transmission
- **Request Monitoring**: Tracking API usage and errors
- **Data Policy**: No persistent storage of translation content
- **Terms Compliance**: Adherence to OpenAI usage policies

### ServiceM8 Integration
- **OAuth Standards**: Full compliance with ServiceM8 OAuth implementation
- **API Versioning**: Using stable ServiceM8 API versions
- **Manifest Security**: Proper scopes and permissions declaration
- **Iframe Security**: Secure embedding practices

## Privacy Considerations

### Data Minimization
- **Temporary Processing**: Translation text processed and immediately discarded
- **Metadata Only**: Only business metrics stored (character count, language, timing)
- **No Personal Data**: Customer content not retained after translation

### Compliance
- **GDPR Considerations**: Data processing lawful basis documented
- **ServiceM8 Compliance**: Adherence to ServiceM8 data policies
- **OpenAI Terms**: Full compliance with OpenAI data usage terms

## Deployment Security

### Environment Separation
- **Development**: Isolated environment with test data only
- **Production**: Separate credentials and infrastructure
- **Environment Variables**: Secure configuration management

### Infrastructure Security
- **Vercel Security**: Leveraging Vercel's enterprise security features
- **Function Isolation**: Each API endpoint isolated in serverless functions
- **Network Security**: VPC and firewall protections where applicable

## Security Configuration

### Required Environment Variables
```bash
# Strong secrets (32+ characters)
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# API credentials
SERVICEM8_CLIENT_SECRET=your_client_secret
OPENAI_API_KEY=your_openai_key

# Storage encryption
KV_REST_API_TOKEN=your_kv_token
```

### Security Checklist for Deployment
- [ ] All environment variables configured securely
- [ ] HTTPS enforcement enabled
- [ ] Rate limiting configured and tested
- [ ] Error handling doesn't expose sensitive information
- [ ] Logging excludes sensitive data
- [ ] OAuth flow tested end-to-end
- [ ] Input validation comprehensive
- [ ] Dependencies up to date
- [ ] Security headers properly configured

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do NOT** create a public GitHub issue
2. Email security concerns to: [security contact - to be configured]
3. Include detailed description and steps to reproduce
4. Allow reasonable time for assessment and fix before disclosure

## Security Updates

- **Dependency Updates**: Monthly automated updates
- **Security Patches**: Immediate deployment for critical issues
- **Version History**: All security updates documented in changelog

## Compliance Statement

This application implements security controls appropriate for:
- ServiceM8 add-on store requirements
- OpenAI API usage policies  
- General data protection best practices
- Industry standard OAuth 2.0 security

Last updated: 2024-01-15
Security contact: [To be configured]