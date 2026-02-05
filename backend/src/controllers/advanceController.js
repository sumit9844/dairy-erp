const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addAdvance = async (req, res) => {
    try {
        const { farmerId, amount, description } = req.body;
        const advance = await prisma.advance.create({
            data: { 
                farmerId, 
                amount: parseFloat(amount), 
                description 
            }
        });
        res.status(201).json(advance);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getFarmerAdvances = async (req, res) => {
    try {
        const { farmerId } = req.params;
        const advances = await prisma.advance.findMany({
            where: { farmerId },
            orderBy: { date: 'desc' }
        });
        res.json(advances);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};