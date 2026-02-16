const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all products (for the dropdown and list)
exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
        res.json(products);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// Create a new product definition
exports.addProduct = async (req, res) => {
    try {
        const { name, unit } = req.body;
        const product = await prisma.product.create({ data: { name, unit, stock: 0 } });
        res.status(201).json(product);
    } catch (error) { res.status(400).json({ error: "Product already exists" }); }
};

// NEW: Add Stock (Simple Production Logic)
exports.addStock = async (req, res) => {
    try {
        const { productName, quantity, date } = req.body;
        const qty = parseFloat(quantity);

        await prisma.$transaction([
            // 1. Increase Stock
            prisma.product.update({
                where: { name: productName },
                data: { stock: { increment: qty } }
            }),
            // 2. Log in Production Table
            prisma.production.create({
                data: {
                    productName,
                    outputQty: qty,
                    milkUsed: 0, // Not tracking input for simple inventory
                    milkType: 'NA',
                    yield: 0,
                    date: new Date(date),
                    notes: 'Manual Stock Addition'
                }
            })
        ]);

        res.json({ message: "Stock Added Successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add stock. Ensure product exists." });
    }
};

// NEW: Get Production/Stock History
exports.getStockHistory = async (req, res) => {
    try {
        const history = await prisma.production.findMany({
            orderBy: { date: 'desc' },
            take: 20 // Show last 20 records
        });
        res.json(history);
    } catch (error) { res.status(500).json({ error: error.message }); }
};