const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const advanceRoutes = require('./routes/advanceRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const saleRoutes = require('./routes/saleRoutes');
const productRoutes = require('./routes/productRoutes');
const backupRoutes = require('./routes/backupRoutes');

// --- REGISTER ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/advances', advanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/products', productRoutes);
app.use('/api/backup', backupRoutes);

// --- SIMPLE DB CHECK (Optional, good for diagnostics) ---
app.get('/api/wakeup', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send("✅ System Ready");
  } catch (error) {
    res.status(500).send("⏳ Waking up database...");
  }
});

app.get('/', (req, res) => {
  res.json({ message: "Dairy ERP API is running..." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});