const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ==========================================
// 1. ADD SALE (With Stock Check & Deduction)
// ==========================================
exports.addSale = async (req, res) => {
    try {
        console.log("Received Sale Request:", req.body); // Log input for debugging

        const { customerName, quantity, rate, productName, date } = req.body;
        
        // 1. Validate Inputs
        if (!productName || !quantity || !rate) {
            return res.status(400).json({ error: "Missing required fields (Product, Qty, or Rate)." });
        }

        const qty = parseFloat(quantity);
        const r = parseFloat(rate);

        // 2. Check Product & Stock
        // NOTE: 'name' must be marked as @unique in your schema.prisma for findUnique to work!
        const product = await prisma.product.findUnique({
            where: { name: productName }
        });

        if (!product) {
            return res.status(404).json({ error: `Product "${productName}" not found.` });
        }

        // 3. Prevent Negative Stock
        if (product.stock < qty) {
            return res.status(400).json({ 
                error: `Insufficient stock! Only ${product.stock} ${product.unit} available.` 
            });
        }

        // 4. Perform Transaction
        const result = await prisma.$transaction([
            // Create Sale Record
            prisma.sale.create({
                data: {
                    customerName: customerName || "Local Counter",
                    productName: productName, // Ensure this matches Schema type (String)
                    quantity: qty,
                    rate: r,
                    totalAmount: qty * r,
                    date: date ? new Date(date) : new Date()
                }
            }),
            // Deduct Stock
            prisma.product.update({
                where: { name: productName },
                data: { stock: { decrement: qty } }
            })
        ]);

        res.status(201).json(result[0]);

    } catch (error) {
        console.error("CRITICAL SALE ERROR:", error);
        // SEND THE REAL ERROR MESSAGE TO THE FRONTEND
        res.status(500).json({ error: error.message });
    }
};

// ... keep getAllSales and deleteSale as they are ...
exports.getAllSales = async (req, res) => {
    try {
        const sales = await prisma.sale.findMany({ orderBy: { id: 'desc' } });
        res.json(sales);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

exports.deleteSale = async (req, res) => {
    try {
        const { id } = req.params;
        const saleId = parseInt(id);
        await prisma.$transaction(async (tx) => {
            const sale = await tx.sale.findUnique({ where: { id: saleId } });
            if (!sale) throw new Error("Sale not found.");
            
            const prod = await tx.product.findUnique({ where: { name: sale.productName } });
            if (prod) {
                await tx.product.update({
                    where: { name: sale.productName },
                    data: { stock: { increment: sale.quantity } }
                });
            }
            await tx.sale.delete({ where: { id: saleId } });
        });
        res.json({ message: "Deleted and Restocked" });
    } catch (error) { res.status(500).json({ error: error.message }); }
};