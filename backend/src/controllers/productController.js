const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get All Products
exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
        res.json(products);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

// 2. Add New Product (Now with Selling Price)
exports.addProduct = async (req, res) => {
    try {
        const { name, unit, sellingPrice } = req.body;
        const product = await prisma.product.create({ 
            data: { 
                name, 
                unit, 
                stock: 0,
                sellingPrice: parseFloat(sellingPrice) || 0 
            } 
        });
        res.status(201).json(product);
    } catch (error) { res.status(400).json({ error: "Product already exists" }); }
};

// 3. Add Stock (The missing function causing the crash)
exports.addStock = async (req, res) => {
    try {
        const { productName, quantity, date } = req.body;
        const qty = parseFloat(quantity);

        await prisma.$transaction([
            // Update Stock
            prisma.product.update({
                where: { name: productName },
                data: { stock: { increment: qty } }
            }),
            // Create Log (using Production table)
            prisma.production.create({
                data: {
                    productName,
                    outputQty: qty,
                    milkUsed: 0,
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

// 4. Get History
exports.getStockHistory = async (req, res) => {
    try {
        const history = await prisma.production.findMany({
            orderBy: { date: 'desc' },
            take: 20
        });
        res.json(history);
    } catch (error) { res.status(500).json({ error: error.message }); }
};