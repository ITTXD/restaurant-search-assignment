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

app.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q?.toLowerCase().trim().replace(/\s+/g, ' ');
    if (!query) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }

    // ดูว่าค้นยัง
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

    // 2. ถ้ายังไม่เคยค้นหา 
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Places API Key is not configured in .env' });
    }

    // เรียก Google Places API 
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' restaurants')}&key=${apiKey}`;
    const response = await fetch(googleApiUrl); // ยิง รอgoogle มันส่งข้อมูลกกลับมา

    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`);
    }

    const externalData = await response.json();

    // 3. นำข้อมูลที่ได้มาบันทึกลงฐานข้อมูล 
    await prisma.searchCache.create({
      data: {
        keyword: query,
        data: JSON.stringify(externalData.results || externalData)
      }
    });

    // 4. ส่งข้อมูลกลับไปให้หน้าเว็บ เราจะส่งไปให้ font-end 
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
