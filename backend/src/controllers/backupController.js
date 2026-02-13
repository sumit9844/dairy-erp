const { PrismaClient } = require('@prisma/client');
const { Parser } = require('json2csv');
const AdmZip = require('adm-zip');
const prisma = new PrismaClient();

exports.downloadBackup = async (req, res) => {
    try {
        const { type } = req.query; // Check if frontend sent 'json' or 'csv'

        // 1. Fetch Data
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

        // 2. CHECK: IF JSON REQUESTED, RETURN JSON (OLD WAY)
        if (type === 'json') {
            const fullBackup = {
                meta: { date: new Date(), version: "1.0", type: "Full System Backup" },
                data: { farmers, collections, expenses, sales, products, advances, settings }
            };
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=Dairy_System_Backup_${timestamp}.json`);
            return res.send(JSON.stringify(fullBackup, null, 2));
        }

        // 3. IF CSV REQUESTED, GENERATE ZIP (NEW WAY)
        const zip = new AdmZip();

        // Helper function
        const addToZip = (data, fileName, fields) => {
            if (data && data.length > 0) {
                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(data);
                zip.addFile(fileName, Buffer.from(csv, "utf8"));
            }
        };

        // Flatten & Add Files
        const flatCollections = collections.map(c => ({
            date: c.date ? c.date.toISOString().split('T')[0] : '',
            shift: c.shift,
            farmerName: c.farmer?.name || "Unknown",
            quantity: c.quantity,
            fat: c.fat,
            snf: c.snf,
            amount: c.totalAmount
        }));
        addToZip(flatCollections, "Milk_Records.csv", ['date', 'shift', 'farmerName', 'quantity', 'fat', 'snf', 'amount']);

        addToZip(farmers, "Farmers.csv", ['farmerCode', 'name', 'phone', 'address', 'milkType']);
        
        const flatSales = sales.map(s => ({
            date: s.date ? s.date.toISOString().split('T')[0] : '',
            customer: s.customerName,
            qty: s.quantity,
            amount: s.totalAmount
        }));
        addToZip(flatSales, "Sales.csv", ['date', 'customer', 'qty', 'amount']);

        const flatExpenses = expenses.map(e => ({
            date: e.date ? e.date.toISOString().split('T')[0] : '',
            category: e.category,
            amount: e.amount,
            description: e.description
        }));
        addToZip(flatExpenses, "Expenses.csv", ['date', 'category', 'amount', 'description']);

        // Finalize Zip
        const downloadName = `Dairy_Excel_Reports_${timestamp}.zip`;
        const zipBuffer = zip.toBuffer();

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=${downloadName}`);
        res.set('Content-Length', zipBuffer.length);
        res.send(zipBuffer);

    } catch (error) {
        console.error("Backup Error:", error);
        res.status(500).json({ error: "Failed to generate files. Check server logs." });
    }
};