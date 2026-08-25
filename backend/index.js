import 'dotenv/config'; // ดึงค่าจากไฟล์ .env มาใช้งาน เช่น GOOGLE_PLACES_API_KEY
import express from 'express'; // นำเข้าไลบรารี Express สำหรับทำ Web Server (API)
import cors from 'cors'; // นำเข้าไลบรารี CORS เพื่ออนุญาตให้ Frontend (Vite) เรียก API ข้ามพอร์ตได้
import { PrismaClient } from '@prisma/client'; // นำเข้า Prisma สำหรับติดต่อฐานข้อมูล
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// ตั้งค่าให้ Prisma เชื่อมต่อกับไฟล์ฐานข้อมูล SQLite (dev.db)
const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db"
});
const prisma = new PrismaClient({ adapter });

const app = express(); // สร้างแอปพลิเคชัน Express

// Middleware: โปรแกรมตัวกลางที่ทำงานก่อนจะไปถึง API
app.use(cors()); // อนุญาตให้ทุกโดเมนเรียก API นี้ได้
app.use(express.json()); // อนุญาตให้ API รับส่งข้อมูลรูปแบบ JSON ได้

// สร้าง API เส้นทางพื้นฐาน (Root) สำหรับทดสอบว่า Server ติดตั้งสำเร็จไหม
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// สร้าง API สำหรับรับคำค้นหา (Method: GET, Path: /search)
app.get('/search', async (req, res) => {
  try {
    // 1. รับคำค้นหาจากผู้ใช้: req.query.q คือค่าที่ส่งมาใน URL เช่น /search?q=bang%20sue
    // เราใช้ .toLowerCase() เพื่อแปลงเป็นพิมพ์เล็กทั้งหมด จะได้ค้นหาง่ายขึ้น
    const query = req.query.q?.toLowerCase(); 
    
    // ถ้าผู้ใช้ไม่ได้พิมพ์คำค้นหามา ให้ส่ง Error 400 กลับไป
    if (!query) {
      return res.status(400).json({ error: 'Search query (q) is required' });
    }
    
    // 2. ตรวจสอบ Cache: ไปหาในฐานข้อมูลว่าเคยมีคนหาคำนี้ไปแล้วหรือยัง
    // prisma.searchCache.findUnique คือการหาข้อมูลแบบเจาะจง 1 แถวจากฐานข้อมูล
    const cachedResult = await prisma.searchCache.findUnique({
      where: { keyword: query }
    });

    // 3. กรณีมีใน Cache (เคยค้นหาแล้ว): 
    if (cachedResult) {
      // ส่งข้อมูลเดิมกลับไปเลย ประหยัดเวลาและไม่ต้องไปเรียก Google API ใหม่
      return res.json({ 
        message: 'Data found in cache', 
        source: 'cache', // บอก Frontend ว่าดึงมาจากฐานข้อมูลนะ
        query: query,
        data: JSON.parse(cachedResult.data) // แปลงข้อมูล String กลับเป็น JSON Object
      });
    }

    // 4. กรณีไม่มีใน Cache: ต้องไปดึงข้อมูลจาก Google Places API
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Google Places API Key is not configured in .env' });
    }

    // สร้าง URL สำหรับเรียก Google API (แนบคำว่า restaurants ไปด้วย เพื่อให้หาแต่ร้านอาหาร)
    const googleApiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query + ' restaurants')}&key=${apiKey}`;
    
    // ใช้คำสั่ง fetch เพื่อยิง Request ไปหา Google
    const response = await fetch(googleApiUrl);
    
    // ถ้า Google ส่ง Error กลับมา ให้โยน Error ออกไปเข้า block catch
    if (!response.ok) {
      throw new Error(`Google API responded with status: ${response.status}`);
    }

    // แปลงข้อมูลที่ Google ตอบกลับมาให้เป็น JSON
    const externalData = await response.json();

    // 5. นำข้อมูลจาก Google มาบันทึกลงฐานข้อมูลของเรา (ทำ Cache)
    await prisma.searchCache.create({
      data: {
        keyword: query, // เก็บคำค้นหา
        data: JSON.stringify(externalData.results || externalData) // แปลง JSON เป็น String เพื่อเก็บลง DB
      }
    });

    // 6. ส่งข้อมูลกลับไปให้ Frontend
    res.json({ 
      message: 'Data fetched from external API and cached', 
      source: 'google_places_api', // บอก Frontend ว่าดึงใหม่จาก Google
      query: query,
      data: externalData.results || externalData
    });

  } catch (error) {
    // ถ้ามีพังตรงไหนใน try {...} จะเด้งมาที่นี่ และตอบกลับเป็น Error 500
    res.status(500).json({ error: error.message });
  }
});

// กำหนด Port ของ Server ถ้าไม่มีใน .env ให้ใช้ 3001
const PORT = process.env.PORT || 3001;

// สั่งให้ Server เริ่มทำงาน
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
