# Restaurant Search App - Frontend

This is the frontend user interface for the Restaurant Search application. It provides a clean, modern, and responsive design for users to search for restaurants and view the results fetched from the backend API.

## Setup Instructions
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure the backend server is running on `http://localhost:3001` before using the frontend, as it relies on the backend API for data.

## Frameworks Used
- **React.js**: For building the user interface components.
- **Vite**: As the fast build tool and development server.
- **Vanilla CSS**: Used for styling with modern techniques like CSS Variables, Flexbox/Grid, and Glassmorphism effects (No CSS frameworks were used, as per the assignment's flexibility).

## How to Run and Test the App
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Open your browser and navigate to `http://localhost:5173` (or the port specified in your terminal).
3. Type a keyword (e.g., "Bang Sue") in the search bar and hit Enter or click "Search".
4. The results will be displayed in a responsive grid format. A badge will indicate whether the data was loaded from the backend Cache or fetched freshly from the Google API.

## Any Known Issues or Limitations
- The application currently uses the restaurant's icon provided by Google Places instead of real photos to prevent exposing the API key on the client side (fetching Google Photos requires the API key).
- The application assumes the backend is running locally on port 3001. If deployed to production, the API URL in `App.jsx` will need to be updated via environment variables.
