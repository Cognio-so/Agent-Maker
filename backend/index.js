const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./lib/db');
const customGptRoutes = require('./routes/customGptRoutes');

const authRoutes = require('./routes/authRoutes');

require('./config/passport');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Make sure this is included

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  // Add OPTIONS for CORS preflight
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only true in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));


app.use(passport.initialize());
app.use(passport.session());

// --- Add Root Route Handler ---
app.get("/", (req, res) => {
  res.status(200).send("API is running successfully!"); // You can change this message
});
// --- End Root Route Handler ---

app.use('/api/auth', authRoutes);
app.use('/api/custom-gpts', customGptRoutes);

// --- Add Health Check Endpoint ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
// --- End Health Check Endpoint ---

// Initialize MongoDB connection at startup
connectDB()
  .then(() => console.log('MongoDB connected at server startup'))
  .catch(err => console.error('Initial MongoDB connection failed:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



