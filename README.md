# MovieHub

MovieHub is an AI-powered movie discovery capstone built with React, TypeScript, and Vite. It combines OMDb movie search and details with Firebase Authentication and Realtime Database favorites, plus server-side Google Gemini recommendations.

## Project Overview

MovieHub helps users discover films by searching titles, browsing a home collection, viewing movie details, saving favorites to a signed-in account, and describing a mood or preference to receive AI-generated recommendations.

The browser application is a Vite single-page app. Movie and recommendation requests go through same-origin `/api` handlers. For local development, `server.mjs` serves those handlers on port 3001; Vite proxies `/api` requests to it. In deployment, `api/` contains Vercel serverless functions.

## Live Demo

[View Live Website](https://movie-be25j8muc-khaledkhan1267-5176s-projects.vercel.app/)

## AI Development Report

The existing [AI-Assisted Development Report](AI-DEVELOPMENT-REPORT.md) is preserved in the project. It describes the AI-assisted development process, manual corrections, API integration, security work, and testing. The report contains the demo URL recorded when it was written; the Live Demo link above preserves the URL from the existing GitHub README.

## Key Features

- Search OMDb by movie title and browse home page picks.
- View movie posters, release year, IMDb rating, genre, director, actors, runtime, plot, language, and country.
- Register and sign in with Firebase email/password authentication.
- Save and remove favorites stored in Firebase Realtime Database.
- Request five movie recommendations from Gemini using a natural-language preference.
- Responsive dark interface, loading and error states, and accessible form feedback.

## Screenshots

Screenshots are not included in the current repository. Add captures here when available.

<!-- Screenshot placeholder: Home page and movie search -->

<!-- Screenshot placeholder: AI recommendation results -->

<!-- Screenshot placeholder: Movie details and favorites -->

## Technology Stack

- React 19 and TypeScript
- Vite 7
- Firebase Authentication and Realtime Database
- OMDb API for search and movie details
- Google Gemini through the `@google/genai` server-side SDK
- Vitest, jsdom, and React Testing Library
- Vercel functions for deployed API routes

## Project Architecture and Folder Structure

```text
.
├── api/
│   ├── movies.js                 # Vercel OMDb API handler
│   └── recommend.js              # Vercel Gemini recommendation handler
├── lib/
│   ├── ai-recommendation.js      # Gemini prompt, schema, retries, validation
│   └── movie-api-handler.js      # OMDb request and response handling
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── components/               # Header, movie cards, AI recommendation UI
│   ├── context/                  # Firebase authentication context
│   ├── hooks/                    # Favorites data hook
│   ├── pages/                    # Login, registration, favorites, movie details
│   ├── services/                 # Frontend movie API calls
│   ├── types/                    # Movie and route types
│   ├── App.tsx
│   ├── firebase.ts
│   └── main.tsx
├── database.rules.json           # Firebase Realtime Database rules
├── server.mjs                    # Local API server
├── vite.config.ts                # Vite config, API proxy, Vitest config
├── vercel.json                   # Vercel build and SPA rewrite config
└── .env.example                  # Placeholder environment template
```

The client calls `/api/movies` and `/api/recommend` using relative paths. `api/` delegates to shared logic in `lib/`, so the deployed Vercel functions and local server use the same backend implementation.

## Installation and Local Setup

1. Clone the repository and enter the project directory:

   ```sh
   git clone https://github.com/khaled1267/movie-hub.git
   cd movie-hub
   ```

2. Install Node.js and npm, then install dependencies from the project root:

   ```sh
   npm install
   ```

3. Copy the environment template:

   ```sh
   cp .env.example .env
   ```

   In PowerShell, use `Copy-Item .env.example .env` instead.

4. Replace the placeholders in `.env` with your own credentials. Add the server-only `GEMINI_API_KEY` entry described in [Environment Variables](#environment-variables); it is not currently listed in `.env.example`.
5. Configure Firebase Authentication and Realtime Database, and publish the rules in `database.rules.json` to the Firebase project.

## Environment Variables

The committed `.env.example` contains placeholders only. Never commit `.env` or put server API keys in frontend variables.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `OMDB_API_KEY` | Local API server / Vercel function | Server-side OMDb access. |
| `GEMINI_API_KEY` | Local API server / Vercel function | Server-side Gemini access. Add this to `.env` and deployment environment settings; it is intentionally absent from the current template. |
| `GEMINI_FALLBACK_MODEL` | Local API server / Vercel function | Optional fallback model name if the primary Gemini model request is retryable. Replace the template placeholder with a valid model identifier or unset/remove the variable to disable fallback. |
| `VITE_FIREBASE_API_KEY` | Vite frontend | Firebase project configuration. Vite exposes `VITE_` values in the client bundle; treat these as public client configuration, not server secrets. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Vite frontend | Firebase Authentication domain. |
| `VITE_FIREBASE_PROJECT_ID` | Vite frontend | Firebase project identifier. |
| `VITE_FIREBASE_DATABASE_URL` | Vite frontend | Firebase Realtime Database URL; required for favorites storage. |
| `VITE_FIREBASE_STORAGE_BUCKET` | Vite frontend | Firebase project configuration. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Vite frontend | Firebase project configuration. |
| `VITE_FIREBASE_APP_ID` | Vite frontend | Firebase project configuration. |
| `API_PORT` | Local API server | Optional local API port; defaults to `3001`. |

The primary Gemini model is currently set in `lib/ai-recommendation.js` to `gemini-3.8-flash`; it is not an environment variable. Keep `GEMINI_API_KEY` and `OMDB_API_KEY` out of all `VITE_` variables and browser code.

## How to Run the Project

Start the local API server in one terminal:

```sh
npm run api
```

Start the Vite development server in a second terminal:

```sh
npm run dev
```

Open the local URL printed by Vite. The development proxy forwards `/api` requests to `http://localhost:3001`.

Build and serve the production bundle locally:

```sh
npm run build
npm run preview
```

The preview command serves the built frontend. The `/api` proxy is configured for the Vite development server only, so use `npm run dev` with `npm run api` for local API integration. Production API routes are provided by the Vercel functions in `api/`.

## AI Recommendation Feature

The recommendation UI sends the user's preference to the same-origin backend. The Gemini SDK, prompt, and API key stay on the server. The backend trims and validates the preference, limits it to 1,000 characters, requests exactly five results using a structured JSON schema, validates the response fields, and returns sanitized errors to the client. A fallback model is used only when `GEMINI_FALLBACK_MODEL` is configured and the primary request fails in a retryable way.

### Endpoint

`POST /api/recommend`

Request:

```http
POST /api/recommend
Content-Type: application/json
```

```json
{
  "preference": "Thoughtful science fiction adventure movies"
}
```

Successful response:

```json
{
  "recommendations": [
    {
      "title": "Interstellar",
      "year": 2014,
      "genre": "Science Fiction",
      "reason": "A thoughtful space adventure."
    },
    {
      "title": "Arrival",
      "year": 2016,
      "genre": "Science Fiction",
      "reason": "A reflective first-contact story centered on language and connection."
    },
    {
      "title": "The Martian",
      "year": 2015,
      "genre": "Science Fiction",
      "reason": "A resourceful and optimistic survival adventure on Mars."
    },
    {
      "title": "Contact",
      "year": 1997,
      "genre": "Science Fiction",
      "reason": "A thoughtful exploration of discovery, evidence, and belief."
    },
    {
      "title": "Moon",
      "year": 2009,
      "genre": "Science Fiction",
      "reason": "An intimate science fiction mystery about identity and isolation."
    }
  ]
}
```

The response is illustrative, not a live API result. The implementation constructs a prompt requesting exactly five movies based on the submitted preference and asks Gemini for JSON matching this structure:

```ts
{
  title: string
  year: number
  genre: string
  reason: string
}
```

The backend rejects blank or overlong preferences and rejects invalid or incomplete model output. It returns HTTP 400 for invalid input, 405 for unsupported methods, and 502 when recommendation generation fails.

## Firebase and OMDb Integration

### Firebase

Firebase Authentication provides email/password registration and login. Signed-in users' favorites are stored under `users/{uid}/favorites` in Realtime Database. The included `database.rules.json` allows authenticated users to read and write only their own user path and denies access by default elsewhere. Publish and review these rules in the Firebase project; the local JSON file does not deploy them automatically.

The `VITE_FIREBASE_*` settings are client configuration and are embedded in the browser build. Protect data with Firebase Authentication, restrictive database rules, and Firebase project controls rather than treating these values as private secrets.

### OMDb

`GET /api/movies?query=<title>` searches for movies. `GET /api/movies?imdbID=<id>` retrieves movie details by IMDb ID. The backend reads `OMDB_API_KEY` from the server environment and calls OMDb; the credential is not sent from frontend code. The API returns an error if the key is missing or the upstream service cannot be reached.

## Testing Instructions

Run the Vitest suite:

```sh
npm test
```

Generate the configured V8 coverage report:

```sh
npm run test:coverage
```

The tests use jsdom and React Testing Library. Existing tests cover AI recommendation submission, validation and response states, movie card accessibility, and authentication form validation/accessibility.

## Test Coverage Results

The current `npm run test:coverage` run passed **10 tests across 3 test files**. V8 reported **94.28% statements, 94.28% lines, 100% functions, and 82.5% branches**.

This is component-scoped coverage, not whole-application coverage: `vite.config.ts` sets coverage `include` to `src/components/AIRecommendationSection.tsx`. The generated HTML report is written under `coverage/` and is ignored by Git.

## Accessibility Improvements

- Forms use visible labels, associated validation messages, and invalid-state attributes.
- Loading and result changes use status announcements; errors use alert semantics.
- Page navigation moves focus to the new page heading, and visible keyboard focus styling is provided.
- Movie posters have descriptive alternative text; decorative imagery uses empty alt text.
- Reduced-motion preferences are respected in the stylesheet.
- Contrast, keyboard interactions, names, and responsive behavior were reviewed and adjusted.

These improvements do not constitute a formal certification of WCAG conformance.

## Lighthouse Results

Measured on the production Vite preview using Lighthouse 12.8.2 and Microsoft Edge:

| Category | Measured score |
| --- | ---: |
| Performance | 85 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 100 |

These are measured lab results for the home page, not guaranteed scores. Repeated runs varied with remote API and image loading. A final measured run recorded FCP 2.0 s, LCP 4.0 s, TBT 80 ms, and CLS 0.006. Production performance can vary by device, network, third-party availability, and deployment configuration.

## Known Limitations

- AI-generated titles, years, genres, and explanations may be inaccurate. Recommendations are suggestions and should be checked independently.
- Search, details, and recommendations depend on OMDb, Gemini, network availability, and valid server-side credentials.
- Favorites require Firebase Authentication, a valid Realtime Database URL, and correctly published database rules.
- Coverage configuration currently measures only `AIRecommendationSection.tsx`; most application code does not have component-level coverage metrics.
- Movie poster availability and quality depend on the external image URLs returned by OMDb.
- The recommendation endpoint enforces a preference length limit but does not implement application-level rate limiting or require authentication.

## Security Considerations

- Store `OMDB_API_KEY` and `GEMINI_API_KEY` only in the local server environment or deployment provider's server-side environment settings. Do not prefix these with `VITE_`.
- `.env` is ignored by Git; commit only placeholders in `.env.example`.
- `VITE_FIREBASE_*` values are client-side configuration and should be assumed visible to users. Firebase database rules must enforce user-level access; see `database.rules.json`.
- The recommendation endpoint returns generic upstream failure messages rather than raw Gemini errors. Do not log credentials or add secrets to screenshots, issue reports, or committed files.
- Configure deployment environment variables separately for each deployment environment that needs them.

## Deployment Instructions

The repository includes `vercel.json` configured with `npm run build`, `dist` as the output directory, and an SPA rewrite. The `api/` directory contains the deployed `/api/movies` and `/api/recommend` functions.

1. Import the repository into a Vercel project.
2. Set the server-side `OMDB_API_KEY` and `GEMINI_API_KEY` environment variables. Optionally set `GEMINI_FALLBACK_MODEL`.
3. Set the required `VITE_FIREBASE_*` values in the Vercel environments that build the frontend. These values must be available at build time.
4. Publish `database.rules.json` to the Firebase Realtime Database and verify Authentication and database configuration.
5. Deploy using the repository's Vercel configuration, then check the deployed home page, `/api/movies` behavior, and `/api/recommend` behavior.

## Future Improvements

- Add broader integration and end-to-end tests for search, Firebase sessions/favorites, movie details, and API error paths.
- Expand coverage reporting to all application components and backend handlers.
- Add abuse protection or rate limiting for public API routes.
- Add caching or other resilience measures where compatible with provider terms and freshness requirements.
- Add maintained screenshots and a repeatable Lighthouse run to the project workflow.
- Add a clear attribution and disclaimer flow for AI-generated recommendations.

## Project Reflection

MovieHub brings together a typed React interface, third-party movie data, account-backed persistence, and server-side generative AI in one application. The project demonstrates how to keep provider credentials on the server, validate structured model output, and design user-facing loading, empty, and error states around external services. Its next engineering step is to broaden automated integration coverage and strengthen operational controls for deployed API routes.

## Author

**Khaled Mahmud**

- GitHub: [@khaled1267](https://github.com/khaled1267)

## License

This project is created for educational and portfolio purposes.
