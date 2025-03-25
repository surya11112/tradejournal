# TradeTracker

A comprehensive trading journal application to help traders track, analyze, and improve their trading performance.

## Features

- **Trade Management**: Add, edit, and delete trades with detailed information
- **Data Visualization**: Charts and graphs to visualize trading performance
- **Journal Entries**: Write daily journal entries to document your trading journey
- **Trade Replay**: Visualize and replay your trades to understand entry/exit points
- **Stats Analysis**: Track key performance metrics like win rate, profit factor, and more
- **Image Support**: Add screenshots and annotate your trade charts
- **Note Taking**: Create and organize trading notes
- **Playbooks**: Define and track your trading strategies

## Tech Stack

- **Frontend**: React with TypeScript
- **UI**: Shadcn UI components 
- **State Management**: React Query
- **Backend**: Express with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod for schema validation

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/surya11112/tradejournal.git
   cd tradejournal
   ```

2. Install dependencies:
   ```bash
   # Install client dependencies
   cd client
   npm install
   
   # Install server dependencies
   cd ../server
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the server directory with:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/tradetracker
   PORT=3000
   ```

4. Start the application:
   ```bash
   # Start the server
   cd server
   npm run dev
   
   # In a separate terminal, start the client
   cd client
   npm run dev
   ```

5. Open your browser to `http://localhost:5000`

## License

MIT License 