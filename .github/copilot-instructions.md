## Copilot / AI contributor notes - quickstart guide

This repo implements a fitness-tracking frontend (Vue 3 + Pinia + Vite) and a backend API (server-side code under `server/`).

Keep it short and specific. Use these pointers to be productive quickly.

1. Big-picture architecture

- Read the README.md for overall project structure and component layout.
- Frontend and backend are separate folders:
  - Frontend: `./src/` — Vue 3 + Pinia stores (`./src/stores/*`), views in `./src/views/*`, API client in `./src/services/api.ts`.
  - Backend: `./server/` — The backend will use Cloudflare workers, D1 for storage, and handle API routes in using itty-router `./server/routes/*` with business logic in `./server/helpers/*`. The main entrypoint is `./server/index.ts`.
- Database: Cloudflare D1, schema defined via SQL migration files in `./migrations/`.
- Dev environment: use `npm install` to install dependencies, `npm run dev` for frontend, and `npx wrangler dev` for backend API locally.
- Deployment: via `wrangler deploy` to Cloudflare Workers.
- The original React codebase can be found in the `react-legacy/` folder for reference.

Note: The backend code is not implemented yet

2. Coding conventions

- Use ES6+ syntax, prefer async/await for asynchronous code.
- Follow Vue 3 best practices: use Composition API, single-file components.
- Pinia for state management: define stores in `src/stores/` and use them in components.
- RESTful API design for backend routes using a common api handler using the fetch API **DO NOT USE AXIOS**.
- Write modular, reusable code with clear separation of concerns.
- Add comments and JSDoc for complex functions and modules.

3. Origin

- The project was originally created using an AI assistant (Google Gemini) to scaffold the initial codebase and structure.
- It was originally written in React, but has been migrated to Vue 3 for better state management with Pinia and improved developer experience with Vite.

4. CSS Framework

- The project uses Tailwind CSS for styling. Follow utility-first principles and keep custom CSS minimal.
- Use responsive design practices with Tailwind's built-in classes.
- Leverage Tailwind's theming capabilities for dark mode support.
- Adhere to consistent spacing, typography, and color usage as defined in the Tailwind config.
- Adhere to accessibility best practices when designing UI components and layouts.

5. Documentation

- **Documentation placement rules (in priority order):**
  1. Maintain a "README.md" for the overall project in the root directory.
  2. Backend-specific docs → `./server/docs/` (e.g., API routes, database schema, middleware)
  3. Frontend-specific docs → `./docs/` (e.g., component architecture, state management, styling)
  4. General project/architecture docs → `.github/docs/` (e.g., setup guide, contribution guidelines, decision logs)
  5. Other than the project README.md, **NEVER** create documentation files in the project root directory
- Name documents clearly and descriptively.
- Use markdown format for all documentation files.
- Avoid creating multiple similar documents; consolidate information where possible.

6. Security

- **JWT Token Verification (CRITICAL - Use jose library)**

  - ❌ **NEVER** implement custom JWT verification code
  - ✅ **ALWAYS** use the `jose` library for JWT verification
  - The jose library handles:
    - JWKS (JSON Web Key Set) management and caching
    - Signature verification (RS256, HS256, etc.)
    - Claim validation (exp, iss, aud, sub)
    - Certificate rotation automatically
  - For Firebase tokens:

    ```typescript
    import { createRemoteJWKSet, jwtVerify } from "jose"

    const JWKS = createRemoteJWKSet(
      new URL(
        "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
      )
    )

    const { payload } = await jwtVerify(token, JWKS, {
      issuer: "https://securetoken.google.com/PROJECT_ID",
      audience: "PROJECT_ID",
    })
    ```

  - For custom tokens: Use jose's `createRemoteJWKSet()` or `createLocalJWKSet()` with your keys
  - Never manually decode/verify with Web Crypto API, atob(), or custom logic
  - All tokens must be verified before accessing any protected resources
  - Fail closed: Return 401 for any verification failure

- **Authentication & Token Verification (General)**

  - Never implement "just trust the token" approaches
  - ALL tokens MUST be cryptographically verified:
    - JWT tokens validate signature using issuer's public keys (via jose)
    - Extract and validate ALL claims (sub, exp, iss, aud)
    - Check token expiration (exp claim) on every request
    - Validate issuer (iss) and audience (aud) claims match expected values
  - Fail closed: Return 401 Unauthorized for any verification failure, never accept unverified tokens

- **General Security Practices**

  - Sanitize and validate all user inputs to prevent injection attacks
  - Handle sensitive data (API keys, tokens, passwords) securely
  - Store secrets in environment variables, never hardcode
  - Use HTTPS for all production communication
  - Implement proper authorization checks after authentication
  - Log security events and failed auth attempts (without exposing sensitive data)
  - Regularly review and update dependencies to address security vulnerabilities
  - Use security headers in API responses (CORS, Content-Security-Policy)

- **What NOT to do**
  - ❌ Implement custom JWT verification code
  - ❌ Decode tokens without verifying signature
  - ❌ Trust token claims without signature verification
  - ❌ Use Web Crypto API for token verification (use jose instead)
  - ❌ Skip expiration checks
  - ❌ Hardcode secrets or API keys
  - ❌ Log sensitive information (tokens, passwords, API keys)
  - ❌ Accept any Authorization header value without validation
  - ❌ Implement authentication without proper error handling

7. Accessing the back end

- The backend API is hosted on Cloudflare Workers.
- Use the Wrangler CLI to interact with the D1 database.
- It is accessible via the "/api/" prefix and is located on the same host as the frontend.
- All endpoints under "/api/" are protected and require a valid Firebase JWT in the "Authorization" header.
- The API uses JWT tokens issued by Firebase for authentication.
- Each request to protected endpoints has the decoded token available on `request.token`.
