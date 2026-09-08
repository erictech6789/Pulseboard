# Pulseboard

Pulseboard is a dashboard application designed to provide insights and management capabilities for projects. It allows users to track progress, view reports, and manage user accounts.

## Requirements

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)

## Setup

To get Pulseboard up and running locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/pulseboard.git
    cd pulseboard
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Seed the database:**
    ```bash
    npm run seed
    ```
4.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application will be accessible at `http://localhost:3000`.

## Environment Variables

Pulseboard uses environment variables for configuration. A `.env.example` file is provided as a template. Copy it to `.env` and fill in the values:

```bash
# App
SESSION_SECRET=dev-secret-change-me # Secret for session management. Change this in production!
DATABASE_PATH=./data/app.db # Path to the SQLite database file

# Upstash Box — console.upstash.com
UPSTASH_BOX_API_KEY=box_xxxxxxxxxxxxxxxxxxxxxxxx # API key for Upstash Box integration

# The model the agents inside the boxes run on.
# Default MODEL is openrouter/google/gemini-2.5-flash, so this is the one you need.
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx # API key for OpenRouter
# Only if you set MODEL to an anthropic/* id
ANTHROPIC_API_KEY= # API key for Anthropic models (if used)

# Repo the agents clone, and push branches back to
REPO_URL=https://github.com/you/pulseboard # URL of the repository for agents to clone
BASE_BRANCH=main # Base branch for agent operations
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxx # GitHub token for agent authentication
```

## Available npm Scripts

-   `npm run dev`: Starts the Next.js development server.
-   `npm run build`: Builds the application for production.
-   `npm run start`: Starts the Next.js production server.
-   `npm run seed`: Seeds the database with initial data.
-   `npm run test`: Runs tests using Vitest.
-   `npm run agents`: Executes the orchestrator script for agents.

## Route Map

-   `/`: Homepage
-   `/dashboard`: Main dashboard
-   `/users`: User management page
-   `/api/auth/login`: API endpoint for user login
-   `/api/auth/logout`: API endpoint for user logout
-   `/api/reports/export`: API endpoint for exporting reports

## Project Layout

-   `app/`: Next.js application routes and API endpoints.
    -   `api/`: Contains API routes (e.g., `auth`, `reports`).
    -   `dashboard/`: Dashboard related pages.
    -   `users/`: User management pages.
-   `components/`: React components used across the application.
-   `data/`: Data storage (e.g., SQLite database file).
-   `lib/`: Utility functions and helper modules.
-   `scripts/`: Scripts for database seeding and other tasks.
-   `tests/`: Unit and integration tests.
