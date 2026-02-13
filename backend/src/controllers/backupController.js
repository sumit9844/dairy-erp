const { PrismaClient } = require('@prisma/client');
const { Parser } = require('json2csv');
const AdmZip = require('adm-zip');
const prisma = new PrismaClient();

// 1. JSON DOWNLOAD (For Restore)
exports.downloadJSON = async (req, res) => {
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
            meta: { date: new Date(), version: "1.0", type: "Full Backup" },
            data: { farmers, collections, expenses, sales, products, advances, settings }
        };

        const fileName = `Dairy_Backup_${new Date().toISOString().split('T')[0]}.json`;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.send(JSON.stringify(fullBackup, null, 2));

    } catch (error) {
        res.status(500).json({ error: "JSON Backup Failed" });
    }
};

// 2. CSV/ZIP DOWNLOAD (For Excel)
exports.downloadCSV = async (req, res) => {
    try {
        const [farmers, collections, expenses, sales, products, advances] = await Promise.all([
            prisma.farmer.findMany(),
            prisma.milkCollection.findMany({ include: { farmer: true } }),
            prisma.expense.findMany(),
            prisma.sale.findMany(),
            prisma.product.findMany(),
            prisma.advance.findMany({ include: { farmer: true } })
        ]);

        const zip = new AdmZip();

        const addToZip = (data, fileName, fields) => {
            if (data && data.length > 0) {
                const json2csvParser = new Parser({ fields });
                const csv = json2csvParser.parse(data);
                zip.addFile(fileName, Buffer.from(csv, "utf8"));
            }
        };

        // Flatten Data
        const flatCollections = collections.map(c => ({
            date: c.date ? c.date.toISOString().split('T')[0] : '',
            shift: c.shift,
            farmerName: c.farmer?.name || "Unknown",
            quantity: c.quantity,
            fat: c.fat,
            snf: c.snf,
            amount: c.totalAmount
        }));
        
        const flatSales = sales.map(s => ({
            date: s.date ? s.date.toISOString().split('T')[0] : '',
            customer: s.customerName,
            qty: s.quantity,
            rate: s.rate,
            total: s.totalAmount
        }));

        const flatExpenses = expenses.map(e => ({
            date: e.date ? e.date.toISOString().split('T')[0] : '',
            category: e.category,
            amount: e.amount,
            description: e.description
        }));

        // Add to Zip
        addToZip(farmers, "Farmers.csv", ['farmerCode', 'name', 'phone', 'address', 'milkType']);
        addToZip(flatCollections, "Milk_Collections.csv", ['date', 'shift', 'farmerName', 'quantity', 'fat', 'snf', 'amount']);
        addToZip(flatSales, "Sales.csv", ['date', 'customer', 'qty', 'rate', 'total']);
        addToZip(flatExpenses, "Expenses.csv", ['date', 'category', 'amount', 'description']);
        addToZip(products, "Inventory.csv", ['name', 'unit', 'stock']);

        const fileName = `Dairy_Excel_Reports_${new Date().toISOString().split('T')[0]}.zip`;
        const zipBuffer = zip.toBuffer();

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', `attachment; filename=${fileName}`);
        res.set('Content-Length', zipBuffer.length);
        res.send(zipBuffer);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "CSV Export Failed. Ensure libraries are installed." });
    }
};