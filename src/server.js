const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();
require('./config/passport');

const authRoutes = require('./routes/auth');
const stampsRoutes = require('./routes/stamps');
const usersRoutes = require('./routes/users');
const compositesRoutes = require('./routes/composites');
// const nftRoutes = require('./routes/nft');  // ← この行がある場合はコメントアウトまたは削除

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://nft-stamp-rally.onrender.com'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stamps', stampsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/composites', compositesRoutes);
// app.use('/api/nft', nftRoutes);  // ← この行もコメントアウト

// Health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'NFT Stamp Rally API is running',
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Base: http://localhost:${PORT}/api`);
});