const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addProduction = async (req, res) => {
    try {
        const { productName, milkUsed, milkType, outputQty, notes } = req.body;
        const out = parseFloat(outputQty);
        const used = parseFloat(milkUsed);

        // 1. Check if the product exists in Inventory first
        const productExists = await prisma.product.findUnique({
            where: { name: productName }
        });

        if (!productExists) {
            return res.status(400).json({ 
                error: `Product "${productName}" not found in Inventory. Please add it in the Inventory tab first.` 
            });
        }

        // 2. Perform Transaction: Create Log + Update Stock
        const result = await prisma.$transaction([
            prisma.production.create({
                data: { 
                    productName, 
                    milkUsed: used, 
                    milkType, 
                    outputQty: out, 
                    yield: (out / used) * 100, 
                    notes 
                }
            }),
            prisma.product.update({
                where: { name: productName },
                data: { stock: { increment: out } }
            })
        ]);
        
        res.status(201).json(result[0]);
    } catch (error) {
        console.error("Production Error:", error);
        res.status(500).json({ error: "Server Error: " + error.message });
    }
};

exports.getProductionHistory = async (req, res) => {
    try {
        const history = await prisma.production.findMany({ orderBy: { date: 'desc' } });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};