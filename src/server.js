const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('./config/passport');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const stampsRoutes = require('./routes/stamps');
const usersRoutes = require('./routes/users');
const compositesRoutes = require('./routes/composites');
const authRoutes = require('./routes/auth');
const nftRoutes = require('./routes/nft');  //

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/', (req, res) => {
  res.json({ 
    message: 'NFT Stamp Rally API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      stamps: '/api/stamps',
      users: '/api/users',
      composites: '/api/composites',
      auth: '/api/auth'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

app.use('/api/stamps', stampsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/composites', compositesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/nft', nftRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'エンドポイントが見つかりません' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'サーバーエラーが発生しました' });
});

app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('API Base: http://localhost:' + PORT + '/api');
});