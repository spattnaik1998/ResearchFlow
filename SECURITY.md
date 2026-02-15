# Security Policy

## Reporting Vulnerabilities

If you discover a security vulnerability in ResearchFlow, please report it responsibly by emailing security@researchflow.example.com rather than using the public issue tracker.

**Please include the following details:**
- A description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Your suggested fix (if available)

## Response Timeline

- **Initial Response**: Within 48 hours
- **Vulnerability Assessment**: Within 7 days
- **Security Patch Release**: Within 30 days (critical issues may be expedited)
- **Public Disclosure**: After patch is released, typically within 90 days

## Supported Versions

| Version | Supported          | End of Life |
|---------|-------------------|-------------|
| 1.x     | ✅ Yes            | TBD         |
| < 1.0   | ❌ No             | N/A         |

## Security Best Practices

### For Users

1. **Keep Dependencies Updated**
   - Enable Dependabot alerts in your fork
   - Review and apply security updates promptly

2. **Environment Variables**
   - Never commit API keys or secrets to version control
   - Use `.env.local` for local development
   - Use platform-specific secret management for deployment

3. **API Key Rotation**
   - Rotate API keys regularly (recommended: every 90 days)
   - Immediately revoke compromised keys
   - Use read-only keys when appropriate

### For Contributors

1. **Code Review**
   - All code changes require review before merge
   - Security-related changes are reviewed with extra scrutiny

2. **Testing**
   - Write tests for security-sensitive functionality
   - Include test cases for error handling and edge cases

3. **Dependency Management**
   - Keep dependencies up to date
   - Review security advisories for new dependencies
   - Avoid using packages with known vulnerabilities

## Security Scanning

This project uses multiple security scanning tools:

- **CodeQL**: Automated code analysis for security vulnerabilities
- **Dependabot**: Automatic dependency updates and security alerts
- **npm audit**: Production dependency vulnerability scanning

Results are available in the GitHub Security tab.

## Compliance

- **WCAG 2.1 Level AA**: Accessibility compliance
- **OWASP Top 10**: Awareness and mitigation practices
- **Node.js Security**: Following recommended practices

## Contact

For security-related questions or concerns not related to vulnerability reporting, please reach out to:
- GitHub Issues (non-sensitive matters)
- Email: security@researchflow.example.com

## Acknowledgments

We appreciate the security research community's help in making ResearchFlow secure.
