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

exports.updateFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await prisma.farmer.update({
            where: { id },
            data: {
                ...req.body,
                fatRate: parseFloat(req.body.fatRate) || 0,
                snfRate: parseFloat(req.body.snfRate) || 0,
                fixedRate: parseFloat(req.body.fixedRate) || 0,
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};