import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database(join(__dirname, 'database.sqlite'), (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Connected to SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      brand TEXT,
      price INTEGER,
      originalPrice INTEGER,
      discount TEXT,
      image TEXT
    )`, () => {
      // Seed products if empty
      db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
        if (row.count === 0) {
          const stmt = db.prepare('INSERT INTO products (name, brand, price, originalPrice, discount, image) VALUES (?, ?, ?, ?, ?, ?)');
          const initialProducts = [
            ['Quantum X1 Wireless Headphones', 'NEXUS', 24999, 29999, '16% off', '/headphones.jpg'],
            ['Titanium Smartwatch Pro Max', 'NEXUS', 39999, 49999, '20% off', '/smartwatch.jpg'],
            ['HoloLens VR Headset v2', 'VIRTUAL', 74999, 89999, '16% off', '/headphones.jpg'],
            ['CyberFit Fitness Tracker', 'NEXUS', 9999, 14999, '33% off', '/smartwatch.jpg'],
            ['SonicBoom Noise Cancelling Earbuds', 'AUDIOX', 12999, 18999, '31% off', '/headphones.jpg'],
            ['Aero Watch Active', 'VIRTUAL', 19999, 24999, '20% off', '/smartwatch.jpg'],
            ['Smart TV 4K OLED 65"', 'VISION', 120000, 150000, '20% off', '/smartwatch.jpg'],
            ['NextGen Gaming Console', 'PLAYTECH', 49999, 54999, '9% off', '/headphones.jpg']
          ];
          for (const p of initialProducts) {
            stmt.run(p);
          }
          stmt.finalize();
          console.log('Database seeded with products.');
        }
      });
    });
  }
});

// API Routes
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.json({ id: this.lastID, name, email });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT id, name, email FROM users WHERE email = ? AND password = ?', [email, password], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(401).json({ error: 'Invalid email or password' });
    res.json(row);
  });
});

app.listen(PORT, () => {
  console.log(`Backend API running on http://localhost:${PORT}`);
});
