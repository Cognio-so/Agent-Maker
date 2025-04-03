const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const passport = require('passport');
const session = require('express-session');
const connectDB = require('./lib/db');
dotenv.config();

const authRoutes = require('./routes/authRoutes');

require('./config/passport');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser()); // Make sure this is included

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://agent-maker-frontend.vercel.app',
  credentials: true // This is important for cookies
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


app.use('/api/auth', authRoutes);

// --- Add Health Check Endpoint ---
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
// --- End Health Check Endpoint ---

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  connectDB();
});



