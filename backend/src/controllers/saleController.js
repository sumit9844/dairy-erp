const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addSale = async (req, res) => {
    try {
        const { customerName, quantity, rate, productName, date } = req.body;
        const qty = parseFloat(quantity);
        const r = parseFloat(rate);

        // 1. Check if we need to update stock
        if (productName) {
            const product = await prisma.product.findUnique({ where: { name: productName } });
            if (!product) {
                return res.status(400).json({ error: `Product "${productName}" not found in Inventory.` });
            }
        }

        // 2. Save Sale and Update Stock in a Transaction
        const result = await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.create({
                data: {
                    customerName,
                    quantity: qty,
                    rate: r,
                    totalAmount: qty * r,
                    date: date ? new Date(date) : new Date(),
                    // Optionally link to product if your schema has the relation
                }
            });

            if (productName) {
                await tx.product.update({
                    where: { name: productName },
                    data: { stock: { decrement: qty } }
                });
            }
            return sale;
        });

        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Check if product exists in Inventory first." });
    }
};

exports.getAllSales = async (req, res) => {
    const sales = await prisma.sale.findMany({ orderBy: { date: 'desc' } });
    res.json(sales);
};