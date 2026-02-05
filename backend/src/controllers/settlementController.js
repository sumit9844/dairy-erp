const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFarmerStatement = async (req, res) => {
    try {
        const { farmerId, startDate, endDate } = req.query;

        // 1. Fetch Milk Records within the Date Range
        const report = await prisma.milkCollection.findMany({
            where: {
                farmerId: farmerId,
                date: {
                    gte: new Date(startDate + "T00:00:00Z"),
                    lte: new Date(endDate + "T23:59:59Z")
                }
            },
            orderBy: { date: 'asc' }
        });

        // 2. Fetch ALL Advances for this farmer (to get full debt)
        const advances = await prisma.advance.findMany({
            where: { farmerId: farmerId }
        });

        // 3. Manual Calculation (Safest way)
        let totalQty = 0;
        let grossAmount = 0;
        report.forEach(item => {
            totalQty += Number(item.quantity) || 0;
            grossAmount += Number(item.totalAmount) || 0;
        });

        let totalAdvance = 0;
        advances.forEach(item => {
            totalAdvance += Number(item.amount) || 0;
        });

        // 4. Send clean numbers
        res.json({ 
            transactions: report, 
            summary: {
                totalQty: totalQty,
                grossAmount: grossAmount,
                advanceDeducted: totalAdvance,
                netPayable: (grossAmount - totalAdvance)
            }
        });
    } catch (error) {
        console.error("Settlement Error:", error);
        res.status(500).json({ error: error.message });
    }
};