const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
        res.json(products);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.addProduct = async (req, res) => {
    try {
        const { name, unit } = req.body;
        const product = await prisma.product.create({ data: { name, unit, stock: 0 } });
        res.status(201).json(product);
    } catch (error) { res.status(400).json({ error: "Product already exists" }); }
};

// NEW: Add Stock (Simple Production)
exports.addStock = async (req, res) => {
    try {
        const { productName, quantity, date } = req.body;
        const qty = parseFloat(quantity);

        // Transaction: Update Stock AND Create Log
        await prisma.$transaction([
            prisma.product.update({
                where: { name: productName },
                data: { stock: { increment: qty } }
            }),
            // We use the 'Production' table as a log. 
            // milkUsed is 0 because we are just tracking output now.
            prisma.production.create({
                data: {
                    productName,
                    outputQty: qty,
                    milkUsed: 0,
                    milkType: 'NA',
                    yield: 0,
                    date: new Date(date),
                    notes: 'Direct Stock Addition'
                }
            })
        ]);

        res.json({ message: "Stock Added Successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add stock" });
    }
};

// NEW: Get Stock History
exports.getStockHistory = async (req, res) => {
    try {
        const history = await prisma.production.findMany({
            orderBy: { date: 'desc' },
            take: 50 // Limit to last 50 records for pagination logic
        });
        res.json(history);
    } catch (error) { res.status(500).json({ error: error.message }); }
};