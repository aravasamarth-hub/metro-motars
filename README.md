# Metro Motors

Metro Motors is a showroom management web application designed for two-wheeler and vehicle dealerships to manage inventory, deals, buyers, sellers, finances, and documentation.

## Features

- **Dashboard**: Live showroom metrics, today's deals, bikes in stock, pending RC transfers, and recent deal activity.
- **Deal Management**: Wizard for recording vehicle details, seller & buyer information, witness details, and payment milestones.
- **Bill Generation & Printing**: Automated bill generation with sequence numbers and exportable print layouts.
- **Finances**: Track showroom turnover, total commissions, payments received, and pending balances.
- **Document & Photo Storage**: Support for storing vehicle photos and party verification documents.
- **Local Browser Persistence**: Supports responsive browser-local storage via IndexedDB.

## Tech Stack

- **Frontend**: React 19, Tailwind CSS, Lucide Icons, Radix UI primitives, CRACO.
- **Backend**: FastAPI (Python), Motor (Async MongoDB client), Pydantic v2.

## Getting Started Locally

### Prerequisites

- Node.js (v18+) & Yarn or NPM
- Python 3.10+ (for optional backend server)
- MongoDB (if running with backend server)

### Running Frontend

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Configure environment variables:

   ```bash
   cp .env.example .env
   ```

4. Start the development server:

   ```bash
   yarn start
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Backend (Optional)

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Start FastAPI server:

   ```bash
   uvicorn server:app --reload --port 8000
   ```

