# Privacy Policy for CodeContext SpecGuard

**Effective Date**: November 1, 2026  
**Developer**: Anugrah Syahban (Gieez) — Independent Developer  
**Contact**: anugrah01jokam@gmail.com

---

## 1. Overview
CodeContext SpecGuard ("the App") is an Atlassian Forge application designed to verify code compliance against Jira issue acceptance criteria.

## 2. Data Collection and Storage
- **No Personal Data Stored**: The App does NOT collect, store, or sell any personal data, user credentials, or personally identifiable information (PII).
- **Runtime Processing**: All code diff analysis and acceptance criteria parsing occur ephemerally in the Atlassian Forge secure serverless execution environment. No code diffs or Jira contents are persisted on third-party servers.
- **Data Residency**: The App runs strictly within the user's Atlassian Cloud environment and adheres to Atlassian Cloud Security standards.

## 3. Permissions and Scopes
The App requests minimal scopes strictly required for its core functionality:
- `read:jira-work`: To read Jira issue summary, description, and acceptance criteria.
- `write:jira-work`: To publish verified audit reports as comments upon explicit user trigger.
- `read:confluence-content.all`: To search Confluence knowledge bases for specifications.
- `read:confluence-space.summary`: To discover active documentation spaces.

## 4. Third-Party Services
The App does not transmit data to external analytics, advertising networks, or third-party databases.

## 5. Contact
For privacy questions or inquiries:  
Email: [anugrah01jokam@gmail.com](mailto:anugrah01jokam@gmail.com)  
GitHub Issues: [https://github.com/Gieez/codecontext-specguard/issues](https://github.com/Gieez/codecontext-specguard/issues)
