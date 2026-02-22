const express = require('express');
const cors = require('cors');
// --- FIX 1: Import Prisma here ---
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

require('dotenv').config();

// Imports
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const advanceRoutes = require('./routes/advanceRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const saleRoutes = require('./routes/saleRoutes');
const productRoutes = require('./routes/productRoutes'); // <--- ENSURE THIS IS HERE
const backupRoutes = require('./routes/backupRoutes');

const app = express();

// ... existing imports ...

// NEW: Database Wake-up Route for Cron Job
// NEW: Robust Wake-up Route


app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/advances', advanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/products', productRoutes); // <--- ENSURE THIS IS LINKED
app.use('/api/backup', backupRoutes);

// REMOVE THIS LINE IF IT EXISTS TO STOP THE CRASH:
// app.use('/api/production', productionRoutes); 

app.get('/', (req, res) => {
  res.json({ message: "Dairy ERP API is running..." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});