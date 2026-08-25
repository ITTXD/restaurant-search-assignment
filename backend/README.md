# Restaurant Search API - Backend

This is the backend service for the Restaurant Search application. It provides an API to search for restaurants using the Google Places API and caches the results in a local SQLite database to optimize repeated searches.

## Setup Instructions
1. Navigate to the `backend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory and add your Google Places API key:
   ```env
   GOOGLE_PLACES_API_KEY="your_google_places_api_key_here"
   DATABASE_URL="file:./dev.db"
   ```
4. Generate the Prisma client and push the schema to the SQLite database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## Frameworks Used
- **Node.js** with **Express.js**: For creating the RESTful API server.
- **Prisma**: As the ORM (Object-Relational Mapper) to interact with the database.
- **SQLite**: As the database to cache the search results.

## How to Run and Test the App
1. Start the server:
   ```bash
   node index.js
   ```
2. The server will run on `http://localhost:3001`.
3. Test the API by making a GET request to the `/search` endpoint:
   ```bash
   curl "http://localhost:3001/search?q=bang%20sue"
   ```
4. You should receive a JSON response with restaurant data. If you search for the same keyword again, the response will include `"source": "cache"`.

## Any Known Issues or Limitations
- The cache currently does not have an expiration time (TTL). Data is cached indefinitely.
- Error handling is basic. If the Google Places API limit is reached, it will return a generic 500 error.
