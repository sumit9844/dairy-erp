const { PrismaClient } = require('@prisma/client');
const { Parser } = require('json2csv');
const AdmZip = require('adm-zip');
const prisma = new PrismaClient();

exports.downloadBackup = async (req, res) => {
    try {
        const { type } = req.query; // 'json' or 'csv'

        // 1. Fetch ALL Data
        const [farmers, collections, expenses, sales, products, advances, settings] = await Promise.all([
            prisma.farmer.findMany(),
            prisma.milkCollection.findMany({ include: { farmer: true } }),
            prisma.expense.findMany(),
            prisma.sale.findMany(),
            prisma.product.findMany(),
            prisma.advance.findMany({ include: { farmer: true } }),
            prisma.companySettings.findFirst()
        ]);

        const timestamp = new Date().toISOString().split('T')[0];

        // --- OPTION A: JSON BACKUP (For Restore) ---
        if (type === 'json') {
            const fullBackup = {
                meta: { date: new Date(), version: "1.0", type: "Full System Backup" },
                data: { farmers, collections, expenses, sales, products, advances, settings }
            };
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=Dairy_System_Backup_${timestamp}.json`);
            return res.send(JSON.stringify(fullBackup, null, 2));
        }

        // --- OPTION B: CSV/EXCEL EXPORT (For Analysis) ---
        const zip = new AdmZip();

        const addToZip = (data, fileName, fields) => {
            if (data.length > 0) {
                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(data);
                zip.addFile(fileName, Buffer.from(csv, "utf8"));
            }
        };

        // Flatten Data for Excel
        const flatCollections = collections.map(c => ({
            date: c.date.toISOString().split('T')[0],
            shift: c.shift,
            farmerCode: c.farmer?.farmerCode,
            farmerName: c.farmer?.name,
            quantity: c.quantity,
            fat: c.fat,
            snf: c.snf,
            total: c.totalAmount
        }));

        const flatAdvances = advances.map(a => ({
            date: a.date.toISOString().split('T')[0],
            farmerName: a.farmer?.name,
            amount: a.amount,
            description: a.description
        }));

        const flatSales = sales.map(s => ({
            date: s.date.toISOString().split('T')[0],
            customer: s.customerName,
            item: s.productId ? "Product" : "Milk",
            qty: s.quantity,
            rate: s.rate,
            revenue: s.totalAmount
        }));

        // Add files to ZIP
        addToZip(farmers, "Farmers_List.csv", ['farmerCode', 'name', 'phone', 'address', 'milkType']);
        addToZip(flatCollections, "Milk_Records.csv", ['date', 'shift', 'farmerName', 'quantity', 'fat', 'snf', 'total']);
        addToZip(flatAdvances, "Advances.csv", ['date', 'farmerName', 'amount', 'description']);
        addToZip(expenses, "Expenses.csv", ['date', 'category', 'amount', 'description']);
        addToZip(flatSales, "Sales_Revenue.csv", ['date', 'customer', 'item', 'qty', 'rate', 'revenue']);
        addToZip(products, "Inventory_Stock.csv", ['name', 'unit', 'stock']);

        const zipBuffer = zip.toBuffer();
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=Dairy_Excel_Reports_${timestamp}.zip`);
        res.set('Content-Length', zipBuffer.length);
        res.send(zipBuffer);

    } catch (error) {
        console.error("Export Error:", error);
        res.status(500).json({ error: "Failed to generate files" });
    }
};