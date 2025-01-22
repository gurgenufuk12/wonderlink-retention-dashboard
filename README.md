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

### Backend Setup
```bash
cd backend
npm install
npm start