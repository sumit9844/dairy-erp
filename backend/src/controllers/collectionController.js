const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addCollection = async (req, res) => {
    try {
        const { farmerId, quantity, fat, snf, shift, date } = req.body;
        const collection = await prisma.milkCollection.create({
            data: {
                farmerId,
                quantity: parseFloat(quantity),
                fat: parseFloat(fat) || 0, // Now optional
                snf: parseFloat(snf) || 0, // Now optional
                shift,
                date: date ? new Date(date) : new Date(),
                rate: 0, // Placeholders: math happens during settlement
                totalAmount: 0 
            }
        });
        res.status(201).json(collection);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.updateCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, fat, snf, shift, date } = req.body;
        const updated = await prisma.milkCollection.update({
            where: { id },
            data: {
                quantity: parseFloat(quantity),
                fat: parseFloat(fat) || 0,
                snf: parseFloat(snf) || 0,
                shift,
                date: new Date(date)
            }
        });
        res.json(updated);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.getCollectionsByDate = async (req, res) => {
    try {
        const { date } = req.query; // Expects YYYY-MM-DD
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);

        const logs = await prisma.milkCollection.findMany({
            where: { date: { gte: start, lte: end } },
            include: { farmer: true },
            orderBy: { date: 'desc' }
        });
        res.json(logs);
    } catch (error) { res.status(500).json({ error: error.message }); }
};