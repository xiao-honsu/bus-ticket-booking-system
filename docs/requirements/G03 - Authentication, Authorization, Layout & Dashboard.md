# **Authentication, Authorization, Layout & Dashboard**

**Course context:** This is **Assignment 1** and serves as the foundational task toward the course **Final Project**. The goal of this assignment is to create the core authentication, authorization, and design-system pieces that you will extend in later assignments to complete the final project.

**Expectations for Assignment 1:**

- Build reusable authentication and authorization code that can be extended later.

- Establish the global theme, layout components, and a dashboard prototype that will be expanded in future assignments.

- Keep your repository modular and well-documented; future assignments will build on this repo.

**Recommended practices:**

- Design components and services with reusability in mind (clear props, small modules).

- Include a short `NEXT_STEPS.md` listing what should be implemented next for the final project.

## **Overview**

Build a single-page web application that demonstrates secure authentication flows, authorization, a consistent design system (theme, typography, templates), and a small interactive dashboard. The project should be a production-minded implementation emphasizing code quality (linting, formatting, pre-commit checks) and clear architecture.

---

## **Learning objectives**

- Implement email/password authentication with secure token handling.
- Integrate at least one social login (Google Sign-In or any others) on the client.
- Apply authorization rules (role-based **or** scope-based) to protect routes and features.
- Design and build a reusable theme (colors, spacing, typography) and page templates.
- Create a dashboard UI mockup and implement interactive dashboard widgets.
- Configure developer tooling: ESLint, Prettier, and Husky hooks.

---

## **Required Features (minimum)**

1. **Authentication**
   - Email \+ password sign up and sign in flows.
   - Social login (Google or GitHub) integrated on the client side and wired to the same session model.
   - Token handling: use Access \+ Refresh token model or a secure cookie session — explain your choice in README.
   - Protect private routes: redirect unauthenticated users to login.
2. **Authorization**
   - Implement either **Role-based** (e.g. `admin`, `editor`, `user`) **or** **Scope-based** (e.g. `read:reports`, `write:settings`) authorization.
   - At least one page or widget must be accessible only to privileged roles/scopes.
   - Show how authorization is enforced on the client (route guards, UI hiding) and describe server-side enforcement in README.
3. **Layout & Design System**
   - Create a global theme with:
     - Color tokens (primary, secondary, surface, error, success)
     - Typography scale (h1..h6, body, caption)
     - Spacing scale (sm, md, lg)
   - Build reusable layout components: `AppShell` (header, nav, content, footer), `Card`, `Button`, `FormField`.
4. **Dashboard UI & Implementation**
   - Include a dashboard with at least three widgets/components: e.g. `SummaryCards`, `ActivityList`…
   - Dashboard should adapt to user role: show/hide or alter widgets based on authorization.
   - Provide a UI mockup (image or annotated markdown wireframe) in the repo under `/design` and implement the UI to match.
5. **Developer Tooling**
   - Setup **ESLint** with a modern config (recommended: `eslint:recommended` \+ framework plugin).
   - Setup **Prettier** and ensure formatting rules are applied.
   - Setup **Husky** pre-commit hook to run `lint-staged` that runs ESLint and Prettier on staged files.

---

## **Deliverables**

- Source code in a Git repository (GitHub, GitLab, or similar).
- `README.md` describing:
  - How to run the app locally (install, dev start, build)
  - Authentication and authorization design (how tokens are stored, how roles/scopes are represented)
  - Any backend or external setup required (e.g. Google or other social login providers)
  - Decisions and tradeoffs
- `/design` folder containing the dashboard UI mockup (PNG/SVG or markdown wireframe).
- Deploy the project to a **public hosting service** (Netlify, Vercel, Railway, etc.) and provide the live URL.

---

## **API Requirements**

### **Minimum backend requirements**

- Provide real API endpoints for authentication (email/password \+ social login).
- Implement token issuance (Access \+ Refresh) or server-side session.
- Enforce authorization rules on the server (role-based or scope-based).
- Provide real dashboard data endpoints that the frontend consumes.

---

## **Evaluation rubric (100 points)**

- **Authentication & Social Login — 25 pts**
  - Email signup/login (10)

  - Social login integration (8)

  - Secure token handling \+ session flow explained (7)

- **Authorization — 20 pts**
  - Correct enforcement of roles/scopes in UI and routes (12)

  - Demo of restricted functionality (8)

- **Layout & Design System — 15 pts**
  - Theme tokens and typography (6)

  - Reusable layout components (5)

  - Theme switcher & responsiveness (4)

- **Dashboard — 15 pts**
  - UI mockup provided (5)

  - Interactive widgets and data handling (6)

  - Role-based differences (4)

- **Tooling & Quality — 15 pts**
  - ESLint/Prettier/Husky configured and working (7)

  - Tests present and passing (5)

  - Clean README and architecture notes (3)

- **Deployment — 10 pts**
  - Project deployed on a public hosting service with a live URL (10

---

## **Suggested technical stack & libs (optional)**

- Frontend: React \+ Vite / Next.js (app router) | Vue 3 \+ Vite | SvelteKit
- Styling: Tailwind CSS or CSS Modules / Styled Components
- Auth helpers: `oidc-client`, `@auth0/auth0-spa-js`, `firebase/auth` (if you choose) — or implement OAuth popup flow manually for social login. If you use an auth provider (Auth0, Firebase), document the configuration steps.
- Linting/formatting: `eslint`, `prettier`, `husky`, `lint-staged`.
- Tests: Jest \+ Testing Library (React Testing Library) or framework equivalent.

---

## **Minimum submission checklist**

- Project repository link
- README with run instructions and design notes
- `/design` folder with dashboard UI mockup
- ESLint, Prettier, and Husky configured
- Auth flows implemented (email+password \+ one social provider)
- Authorization enforced (routes/UI)
- At least 3 dashboard widgets and role-based differences
- Unit tests and scripts to run them
- Live deployment URL on a public hosting service

---

## **Hints & tips**

- Persist theme and auth state in `localStorage` or secure cookie as appropriate and explain the security implications in README.
- Keep components small and focused. Make a `components/` folder and a `features/` folder for domain code.
