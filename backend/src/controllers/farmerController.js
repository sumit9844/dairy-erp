const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Register a new Farmer
exports.createFarmer = async (req, res) => {
    try {
        const { farmerCode, name, phone, address, milkType, rateType, fatRate, snfRate, fixedRate } = req.body;
        
        const newFarmer = await prisma.farmer.create({
            data: { 
                farmerCode, name, phone, address, milkType, rateType,
                fatRate: parseFloat(fatRate) || 0,
                snfRate: parseFloat(snfRate) || 0,
                fixedRate: parseFloat(fixedRate) || 0
            }
        });
        res.status(201).json(newFarmer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 2. Get All Farmers
exports.getAllFarmers = async (req, res) => {
    try {
        const farmers = await prisma.farmer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(farmers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};