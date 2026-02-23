const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// 1. ADD SALE (With Stock Check & Deduction)
// ==========================================
exports.addSale = async (req, res) => {
    try {
        const { customerName, quantity, rate, productName, date } = req.body;
        const qty = parseFloat(quantity);
        const r = parseFloat(rate);

        // A. Check Product & Stock Level First
        const product = await prisma.product.findUnique({
            where: { name: productName }
        });

        if (!product) {
            return res.status(404).json({ error: `Product "${productName}" not found.` });
        }

        // CRITICAL: Prevent Negative Stock
        if (product.stock < qty) {
            return res.status(400).json({ 
                error: `Insufficient stock! Only ${product.stock} ${product.unit} available.` 
            });
        }

        // B. Perform Transaction: Record Sale + Deduct Stock
        const result = await prisma.$transaction([
            // 1. Create Sale
            prisma.sale.create({
                data: {
                    customerName: customerName || "Local Counter",
                    productName,
                    quantity: qty,
                    rate: r,
                    totalAmount: qty * r,
                    date: date ? new Date(date) : new Date()
                }
            }),
            // 2. Decrement Stock
            prisma.product.update({
                where: { name: productName },
                data: { stock: { decrement: qty } }
            })
        ]);

        // result[0] is the created sale object
        res.status(201).json(result[0]);

    } catch (error) {
        console.error("Add Sale Error:", error);
        res.status(500).json({ error: "Failed to record sale." });
    }
};

// ==========================================
// 2. GET ALL SALES (LIFO - Newest First)
// ==========================================
exports.getAllSales = async (req, res) => {
    try {
        const sales = await prisma.sale.findMany({ 
            orderBy: { id: 'desc' } // Shows newest sales at top
        });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// 3. DELETE SALE (Restore Stock)
// ==========================================
exports.deleteSale = async (req, res) => {
    try {
        const { id } = req.params;
        const saleId = parseInt(id);

        // Interactive Transaction to ensure safety
        await prisma.$transaction(async (tx) => {
            
            // A. Find the sale to know what quantity to restore
            const sale = await tx.sale.findUnique({
                where: { id: saleId }
            });

            if (!sale) {
                throw new Error("Sale record not found.");
            }

            // B. Restore Stock (Increment) if product still exists
            const productExists = await tx.product.findUnique({
                where: { name: sale.productName }
            });

            if (productExists) {
                await tx.product.update({
                    where: { name: sale.productName },
                    data: { stock: { increment: sale.quantity } }
                });
            }

            // C. Delete the Sale Record
            await tx.sale.delete({
                where: { id: saleId }
            });
        });

        res.json({ message: "Sale deleted and stock restored successfully." });

    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: error.message || "Failed to delete sale." });
    }
};