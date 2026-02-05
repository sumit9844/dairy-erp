const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Add a new milk collection
exports.addCollection = async (req, res) => {
    try {
        const { farmerId, quantity, fat, snf, shift } = req.body;
        const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } });
        
        if (!farmer) return res.status(404).json({ error: "Farmer not found" });

        let rate = 0;
        if (farmer.rateType === "FAT_SNF") {
            rate = (parseFloat(fat) * farmer.fatRate) + (parseFloat(snf) * farmer.snfRate);
        } else if (farmer.rateType === "FAT_ONLY") {
            rate = (parseFloat(fat) * farmer.fatRate);
        } else {
            rate = farmer.fixedRate;
        }

        const totalAmount = parseFloat(quantity) * rate;

        const collection = await prisma.milkCollection.create({
            data: {
                farmerId,
                quantity: parseFloat(quantity),
                fat: parseFloat(fat) || 0,
                snf: parseFloat(snf) || 0,
                shift,
                rate,
                totalAmount
            }
        });
        res.status(201).json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Get recent collections (This is the one likely causing the crash)
exports.getRecentCollections = async (req, res) => {
    try {
        const collections = await prisma.milkCollection.findMany({
            take: 10,
            orderBy: { date: 'desc' },
            include: { farmer: true }
        });
        res.json(collections);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};