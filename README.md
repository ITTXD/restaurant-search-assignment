# Restaurant Search App (Full-Stack Assignment)

This repository contains a full-stack responsive web application that allows users to search for a list of restaurants based on a keyword. The application integrates with the Google Places API to fetch restaurant data and utilizes a database to cache previous searches, optimizing performance and reducing API calls.

## Project Structure
```text
project-root/
├── backend/       # Node.js + Express API + Prisma & SQLite
├── frontend/      # React.js + Vite Web Application
└── README.md      # This file
```

## Quick Start
To run the full application locally, you need to set up both the backend and frontend separately.

### 1. Backend Setup
The backend runs on **Node.js (Express.js)** and uses **SQLite** via **Prisma** to cache keyword searches.

**Setup Instructions:**
1. Open a terminal and navigate to the backend folder: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example` (or simply create a new one) and add your Google API key:
   ```env
   GOOGLE_PLACES_API_KEY="your_api_key_here"
   DATABASE_URL="file:./dev.db"
   ```
4. Setup the database schema: 
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Run the backend server: `npm start` (or `node index.js`)
6. The API will be available at `http://localhost:3001`.

*(For full details, see the [backend/README.md](./backend/README.md))*

---

### 2. Frontend Setup
The frontend is built with **React (Vite)** and uses Vanilla CSS for responsive, modern styling.

**Setup Instructions:**
1. Open a new terminal and navigate to the frontend folder: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
4. Open your browser and navigate to the provided URL (usually `http://localhost:5173`).

*(For full details, see the [frontend/README.md](./frontend/README.md))*

## Features
- **Search:** Enter any keyword (e.g., "Bang Sue") to find relevant restaurants.
- **Caching Mechanism:** If a keyword has been searched previously, the backend retrieves the data directly from the SQLite database instead of calling the Google Places API.
- **Responsive Design:** The frontend adapts seamlessly to desktop and mobile screens.

## Known Issues or Limitations
- The cache does not expire automatically. In a real-world scenario, a TTL (Time To Live) should be implemented to clear old cached data.
- The UI currently displays the restaurant icons rather than actual photos from Google Places to prevent the exposure of the API key on the frontend side.

---
*Created as part of the Full-Stack Assignment.*
