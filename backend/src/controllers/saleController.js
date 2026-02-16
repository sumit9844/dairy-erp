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

// NEW: Delete Sale and Restore Stock
exports.deleteSale = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Find the sale first to know what was sold
        const sale = await prisma.sale.findUnique({
            where: { id }
        });

        if (!sale) return res.status(404).json({ error: "Sale not found" });

        // 2. Perform Transaction: Restore Stock -> Delete Record
        await prisma.$transaction(async (tx) => {
            // If the sale was linked to a specific product name, restore the stock
            if (sale.quantity > 0) {
                // Try to find the product by name (since we stored productName string)
                // Note: This relies on the product name matching. 
                // If you want strict linking, we use productId, but productName is safer for legacy data.
                try {
                    await tx.product.update({
                        where: { name: sale.productName || "" }, // Handle if name is missing
                        data: { stock: { increment: sale.quantity } }
                    });
                } catch (e) {
                    // Ignore stock update if product no longer exists, just delete sale
                    console.log("Product not found for restock, skipping...");
                }
            }

            // Delete the sale record
            await tx.sale.delete({ where: { id } });
        });

        res.json({ message: "Sale deleted and stock restored" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};