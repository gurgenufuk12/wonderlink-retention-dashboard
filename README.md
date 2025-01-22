# Wonderlink Retention Analytics Dashboard

## Overview

Analytics dashboard for Wonderlink game that visualizes user retention metrics (D1, D7, D30) with filtering capabilities by install date, country, and platform.

## Tech Stack

- Backend: Node.js, Express, PostgreSQL
- Frontend: React, Tailwind CSS, Recharts
- Data Source: BigQuery

## Features

- D1, D7, D30 retention metrics calculation
- Filtering by:
  - Install date
  - Country
  - Platform
- Interactive charts and metrics visualization
- Real-time data updates

## Installation

### Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)
- Google Cloud Platform account with BigQuery access

###

### Database Setup

- Craete .env file in the backend source directory
  ```bash
  PORT=4000
  DB_USER=your_database_username
  DB_PASSWORD=your_database_password
  DB_NAME=retention
  DB_HOST=localhost
  DB_PORT=5432
  ```

### BigQuery Setup

- Inside the backend directory in the config folder put "wonderlink-6afca-7b1dd61d5eeb.json" file with the same name

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
