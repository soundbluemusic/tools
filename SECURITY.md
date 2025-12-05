# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of our project seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please send an email to **soundbluemusic@gmail.com** with the following information:

1. **Description**: A clear description of the vulnerability
2. 2. **Steps to Reproduce**: Detailed steps to reproduce the issue
   3. 3. **Impact**: The potential impact of the vulnerability
      4. 4. **Affected Versions**: Which versions are affected
         5. 5. **Suggested Fix**: If you have a suggested fix, please include it
           
            6. ### What to Expect
           
            7. - **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
               - - **Communication**: We will keep you informed of the progress towards a fix
                 - - **Resolution**: We aim to resolve critical vulnerabilities within 7 days
                   - - **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)
                    
                     - ### Scope
                    
                     - This security policy applies to:
                    
                     - - The main Tools application (https://tools.soundbluemusic.com)
                       - - All packages and code in this repository
                         - - Dependencies that we directly control
                          
                           - ### Out of Scope
                          
                           - The following are out of scope:
                          
                           - - Third-party services and dependencies
                             - - Social engineering attacks
                               - - Denial of service attacks
                                 - - Issues in forks of this repository
                                  
                                   - ## Security Best Practices
                                  
                                   - When contributing to this project, please follow these security best practices:
                                  
                                   - 1. **Dependencies**: Keep dependencies up to date and audit them regularly
                                     2. 2. **Secrets**: Never commit secrets, API keys, or credentials
                                        3. 3. **Input Validation**: Always validate and sanitize user input
                                           4. 4. **XSS Prevention**: Use SolidJS's built-in XSS protection, avoid `innerHTML`
                                              5. 5. **HTTPS**: Always use HTTPS for external requests
                                                
                                                 6. ## Security Updates
                                                
                                                 7. Security updates will be released as patch versions and announced through:
                                                
                                                 8. - GitHub Security Advisories
                                                    - - Release notes in CHANGELOG.md
                                                     
                                                      - Thank you for helping keep Tools and its users safe!
