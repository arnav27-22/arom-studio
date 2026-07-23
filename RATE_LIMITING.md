# 🛡️ Security Specifications

## 1. Rate Limiting

Add rate limiting appropriate to each endpoint type:

* **Authentication Routes (e.g. login, signup, password reset):**
  - Implement stricter rate limits.
  - Use a combination of **per-IP** and **per-account** limits.
  - Apply **exponential backoff** rather than a hard lockout.

* **Public Endpoints (e.g. contact form, inquiry, public API):**
  - Apply moderate rate limits to prevent automated abuse and resource exhaustion.

* **Authenticated User Actions:**
  - Apply looser, standard operational limits for legitimate user activity.

* **Configuration:**
  - Make all rate-limiting thresholds configurable (e.g. via environment variables) rather than hardcoded in source code.

---

## 2. Input Validation

Validate every input against a strict schema (type, length, format) and reject anything that doesn't match — don't just sanitize/escape.

---

## 3. Secrets

Scan the complete codebase for any hardcoded API keys, tokens, or passwords. Use environment variables and verify that nothing sensitive is shipped into the frontend or pushed to git.

---

## 4. Dependency Vulnerabilities

Run a dependency audit across the project. Identify any packages with known vulnerabilities, list their severity, and update or replace them where safe to do so.

---

## 5. Error Handling & Information Leakage

Review all error handling across the app. Ensure users never see stack traces, internal file paths, or raw database errors - return generic messages instead, while still logging full error details server-side for debugging.

---

## 6. File Upload Safety

Review any file upload functionality. Confirm file type, size, and content are validated (not just the extension), uploads are stored outside the web root or in isolated storage, and uploaded files can never be executed as code.
