const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.downloadBackup = async (req, res) => {
    try {
        const [farmers, collections, expenses, sales, products, advances, settings] = await Promise.all([
            prisma.farmer.findMany(),
            prisma.milkCollection.findMany(),
            prisma.expense.findMany(),
            prisma.sale.findMany(),
            prisma.product.findMany(),
            prisma.advance.findMany(),
            prisma.companySettings.findFirst()
        ]);

        const fullBackup = {
            timestamp: new Date(),
            data: { farmers, collections, expenses, sales, products, advances, settings }
        };

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=dairy_backup_${Date.now()}.json`);
        res.send(JSON.stringify(fullBackup, null, 2));

    } catch (error) {
        res.status(500).json({ error: "Backup Failed" });
    }
};