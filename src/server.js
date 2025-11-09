const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
require('dotenv').config();

// Initialize Passport configuration
require('./config/passport');

const app = express();

// CORS configuration - MUST be before other middleware
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://nft-stamp-rally.onrender.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes - Import and use each route carefully
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✓ Auth routes loaded');
} catch (error) {
    console.error('Failed to load auth routes:', error.message);
}

try {
    const stampsRoutes = require('./routes/stamps');
    app.use('/api/stamps', stampsRoutes);
    console.log('✓ Stamps routes loaded');
} catch (error) {
    console.error('Failed to load stamps routes:', error.message);
}

try {
    const usersRoutes = require('./routes/users');
    app.use('/api/users', usersRoutes);
    console.log('✓ Users routes loaded');
} catch (error) {
    console.error('Failed to load users routes:', error.message);
}

try {
    const compositesRoutes = require('./routes/composites');
    app.use('/api/composites', compositesRoutes);
    console.log('✓ Composites routes loaded');
} catch (error) {
    console.error('Failed to load composites routes:', error.message);
}

// Merchandise routes (optional)
try {
    const merchandiseRoutes = require('./routes/merchandise');
    app.use('/api/merchandise', merchandiseRoutes);
    console.log('✓ Merchandise routes loaded');
} catch (error) {
    console.log('Merchandise routes not found (optional)');
}

// NFT routes (optional)
try {
    const nftRoutes = require('./routes/nft');
    app.use('/api/nft', nftRoutes);
    console.log('✓ NFT routes loaded');
} catch (error) {
    console.log('NFT routes not found (optional)');
}

// Health check
app.get('/', (req, res) => {
    res.json({ 
        message: 'NFT Stamp Rally API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Server is running');
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});