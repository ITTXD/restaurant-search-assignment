import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db"
});
const prisma = new PrismaClient({ adapter });

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase(); 
    
    if (!query) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }
    
    // Check if the search result is already in the database cache
    const cachedResult = await prisma.searchCache.findUnique({
      where: { keyword: query }
    });

    if (cachedResult) {
      return res.json({ 
        message: 'Data found in cache', 
        source: 'cache',
        query: query,
        data: JSON.parse(cachedResult.data)
      });
    }

    // Cache miss: Fetch data from Google Places API
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Places API Key is not configured in .env' });
    }

    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' restaurants')}&key=${apiKey}`;
    const response = await fetch(googleApiUrl);
    
    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`);
    }

    const externalData = await response.json();

    // Store the fetched data into the cache
    await prisma.searchCache.create({
      data: {
        keyword: query,
        data: JSON.stringify(externalData.results || externalData)
      }
    });

    res.json({ 
      message: 'Data fetched from external API and cached', 
      source: 'google_places_api',
      query: query,
      data: externalData.results || externalData
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
