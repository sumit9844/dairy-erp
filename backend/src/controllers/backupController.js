const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.downloadBackup = async (req, res) => {
    try {
        // 1. Fetch ALL data from ALL tables
        const [farmers, collections, expenses, sales, products, advances, settings] = await Promise.all([
            prisma.farmer.findMany(),
            prisma.milkCollection.findMany(),
            prisma.expense.findMany(),
            prisma.sale.findMany(),
            prisma.product.findMany(),
            prisma.advance.findMany(),
            prisma.companySettings.findFirst()
        ]);

        // 2. Bundle it into one JSON object
        const fullBackup = {
            timestamp: new Date(),
            system: "DairyPro ERP",
            data: { farmers, collections, expenses, sales, products, advances, settings }
        };

        // 3. Send as a file download
        const fileName = `dairy_backup_${new Date().toISOString().split('T')[0]}.json`;
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(JSON.stringify(fullBackup, null, 2));

    } catch (error) {
        console.error("Backup Error:", error);
        res.status(500).json({ error: "Backup Failed" });
    }
};