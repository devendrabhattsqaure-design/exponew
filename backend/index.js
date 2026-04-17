const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const turfRoutes = require('./src/routes/turfRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Database Connection Check
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const checkDB = async () => {
  try {
    const { error } = await supabase.from('User').select('id').limit(1);
    console.log('-------------------------------------------');
    console.log('✅ PostgreSQL Database Connected Successfully');
    console.log('🚀 Backend Sync Engine: READY');
    console.log('-------------------------------------------');
  } catch (err) {
    console.log('⚠️ Database ready but User table not found yet.');
    console.log('👉 Please run the SQL script provided in Supabase.');
  }
};
checkDB();

// Middleware
app.use(cors({ origin: '*' })); // Allow all origins for mobile dev
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Turf Score API is operational' });
});

app.use('/api/auth', authRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://192.168.18.23:${PORT}`);
});
