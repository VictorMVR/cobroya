# GEMINI.md - CobroYa POS

## Project Overview

This is a Next.js web application for a Point of Sale (POS) system called "CobroYa". It is designed to be a multi-tenant application, with a focus on providing a fast and intuitive user experience for managing sales, products, customers, and open accounts.

**Main Technologies:**

*   **Framework:** Next.js with App Router
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS
*   **State Management:** Zustand
*   **Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth

**Architecture:**

The application is structured as a monorepo with a Next.js frontend and backend. The frontend is built with React and uses Zustand for state management. The backend consists of Next.js API Routes that interact with the Supabase database. The application is designed to be multi-tenant, with each tenant having its own set of data.

## Building and Running

**Prerequisites:**

*   Node.js
*   npm

**Installation:**

```bash
npm install
```

**Running the development server:**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

**Building for production:**

```bash
npm run build
```

**Linting:**

```bash
npm run lint
```

**Database:**

The project uses Supabase for the database. The database schema is managed through migrations located in the `supabase/migrations` directory.

To generate TypeScript types from the Supabase schema, run:

```bash
npm run db:sync
```

## Development Conventions

*   **Coding Style:** The project uses ESLint to enforce a consistent coding style.
*   **State Management:** Zustand is used for global state management. The main store is `lib/stores/pos.store.ts`, which manages the state of the POS page.
*   **Types:** Custom types are defined in the `lib/types` directory.
*   **Components:** Reusable components are located in the `components` directory.
*   **API Routes:** API routes are located in the `app/api` directory.
*   **Authentication:** Authentication is handled by Supabase Auth. The middleware in `middleware.ts` protects routes based on user roles.
*   **Database Migrations:** Database migrations are located in the `supabase/migrations` directory. New migrations should be created for any schema changes.
