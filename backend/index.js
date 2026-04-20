const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const turfRoutes = require('./src/routes/turfRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Test Route
app.get('/', (req, res) => {
  res.json({ message: 'Turf Score API is operational', timestamp: new Date() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);

// Database check and Start
const prisma = require('./src/config/db');

app.listen(PORT, '0.0.0.0', async () => {
    try {
        await prisma.$connect();
        console.log(`🚀 Server ready at http://localhost:${PORT}`);
        console.log('✅ Database connected');
    } catch (e) {
        console.error('❌ DB Connection Error:', e);
    }
});
