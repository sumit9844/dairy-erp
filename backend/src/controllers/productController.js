const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Get All Products
exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
        res.json(products);
    } catch (error) {
        console.error("Get Products Error:", error);
        res.status(500).json({ error: "Failed to fetch products" });
    }
};

// 2. Add New Product
exports.addProduct = async (req, res) => {
    try {
        const { name, unit, sellingPrice } = req.body;
        
        // Validation
        if (!name) return res.status(400).json({ error: "Product Name is required" });

        const product = await prisma.product.create({ 
            data: { 
                name, 
                unit, 
                stock: 0,
                sellingPrice: parseFloat(sellingPrice) || 0 
            } 
        });
        res.status(201).json(product);
    } catch (error) { 
        // Prisma P2002 code means Unique Constraint Violation (Duplicate Name)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Product already exists" });
        }
        res.status(500).json({ error: error.message }); 
    }
};

// 3. Update Product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, unit, sellingPrice } = req.body;
        
        const updated = await prisma.product.update({
            where: { id },
            data: { 
                name, 
                unit, 
                sellingPrice: parseFloat(sellingPrice) || 0 
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Delete Product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        if (error.code === 'P2003') {
            return res.status(400).json({ error: "Cannot delete: This product has sales history." });
        }
        res.status(500).json({ error: error.message });
    }
};

// 5. Add Stock (Production Log)
exports.addStock = async (req, res) => {
    try {
        const { productName, quantity, date } = req.body;
        const qty = parseFloat(quantity);

        const product = await prisma.product.findUnique({ where: { name: productName } });
        if (!product) return res.status(404).json({ error: "Product not found" });

        await prisma.$transaction([
            prisma.product.update({
                where: { name: productName },
                data: { stock: { increment: qty } }
            }),
            prisma.production.create({
                data: {
                    productName,
                    outputQty: qty,
                    milkUsed: 0,
                    milkType: 'NA',
                    yield: 0,
                    date: date ? new Date(date) : new Date(),
                    notes: 'Manual Stock Addition'
                }
            })
        ]);

        res.json({ message: "Stock Added Successfully" });
    } catch (error) {
        console.error("Stock Error:", error);
        res.status(500).json({ error: "Failed to add stock" });
    }
};

// 6. Get History
exports.getStockHistory = async (req, res) => {
    try {
        const history = await prisma.production.findMany({
            orderBy: { date: 'desc' },
            take: 20
        });
        res.json(history);
    } catch (error) { res.status(500).json({ error: error.message }); }
};