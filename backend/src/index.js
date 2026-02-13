const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. Import the Auth Routes
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const settlementRoutes = require('./routes/settlementRoutes');
const advanceRoutes = require('./routes/advanceRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const saleRoutes = require('./routes/saleRoutes');
const productionRoutes = require('./routes/productionRoutes');
const productRoutes = require('./routes/productRoutes');
const backupRoutes = require('./routes/backupRoutes'); 

const app = express();

app.use(cors());
app.use(express.json()); // MANDATORY for reading login data

// 2. Register the Auth Routes
app.use('/api/auth', authRoutes); // This makes the URL: /api/auth/login

// 3. Register other routes
app.use('/api/farmers', farmerRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/advances', advanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/products', productRoutes);
app.use('/api/backup', backupRoutes);

app.get('/', (req, res) => {
  res.json({ message: "Dairy ERP API is running..." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});