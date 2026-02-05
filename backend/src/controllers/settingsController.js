const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get settings (or default if empty)
exports.getSettings = async (req, res) => {
    try {
        let settings = await prisma.companySettings.findUnique({ where: { id: 1 } });
        if (!settings) {
            settings = await prisma.companySettings.create({ data: { id: 1, companyName: "New Dairy ERP" } });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update settings
exports.updateSettings = async (req, res) => {
    try {
        const settings = await prisma.companySettings.upsert({
            where: { id: 1 },
            update: req.body,
            create: { id: 1, ...req.body }
        });
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};