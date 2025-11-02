const express = require('express');
const session = require('express-session');
const passport = require('passport');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const stampRoutes = require('./routes/stamps');
const userRoutes = require('./routes/users');
const compositeRoutes = require('./routes/composites');
const nftRoutes = require('./routes/nft');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS設定
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5500',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Bodyパーサー
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session設定
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

// Passport初期化
app.use(passport.initialize());
app.use(passport.session());

// ルート設定
app.use('/api/auth', authRoutes);
app.use('/api/stamps', stampRoutes);
app.use('/api/users', userRoutes);
app.use('/api/composites', compositeRoutes);
app.use('/api/nft', nftRoutes);

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: 'NFT Stamp Rally API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      stamps: '/api/stamps',
      users: '/api/users',
      composites: '/api/composites',
      auth: '/api/auth',
      nft: '/api/nft'
    }
  });
});

// エラーハンドリング
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'サーバーエラーが発生しました',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Base: http://localhost:${PORT}/api`);
});

module.exports = app;

const merchandiseRoutes = require('./routes/merchandise');

// 既存のルート設定の後に追加
app.use('/api/merchandise', merchandiseRoutes);