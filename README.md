# TradeTracker

A full-stack application for tracking trades with an Express.js backend, React frontend, and PostgreSQL database using Drizzle ORM.

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd TradeTracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Environment Setup:
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database_name>
   ```

## Database Setup

1. Push the database schema:
   ```bash
   npm run db:push
   ```

## Running the Application

### Development Mode

To run the application in development mode:

```bash
npm run dev
```

This will start the development server at http://localhost:5000.

### Production Mode

To build and run the application in production mode:

1. Build the application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## Project Structure

- `/client`: React frontend
- `/server`: Express.js backend
- `/shared`: Shared code between frontend and backend
- `/migrations`: Database migration files

## Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Run the application in production mode
- `npm run check`: Type-check TypeScript code
- `npm run db:push`: Push database schema changes

## Technologies Used

- **Backend**: Express.js, TypeScript
- **Frontend**: React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js
- **UI Components**: Radix UI, Shadcn/UI
- **Build Tools**: Vite, esbuild 