const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getProducts = async (req, res) => {
    try {
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addProduct = async (req, res) => {
    try {
        const { name, unit } = req.body;
        const product = await prisma.product.create({
            data: { name, unit, stock: 0 }
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: "Product already exists or invalid data" });
    }
};