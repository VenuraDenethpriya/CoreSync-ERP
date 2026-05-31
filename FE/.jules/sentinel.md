## 2024-10-27 - [Missing Sanitization in Reusable Component]
**Vulnerability:** CSS Injection via `dangerouslySetInnerHTML` in `Chart` component.
**Learning:** Reusable UI components that use `dangerouslySetInnerHTML` must handle sanitization internally, as consumers might pass user-controlled data. Explicitly claimed protections in documentation/memory were missing in code.
**Prevention:** Always implement strict sanitization helper functions (like `sanitizeColor`) within components that render dynamic styles or HTML and verify their existence in the codebase.
