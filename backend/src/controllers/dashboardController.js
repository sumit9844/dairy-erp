const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);

        // 1. Fetch All Data
        const [collections, expenses, sales, products, allRecentCollections] = await Promise.all([
            prisma.milkCollection.findMany({ where: { date: { gte: today } }, include: { farmer: true } }),
            prisma.expense.findMany({ where: { date: { gte: today } } }),
            prisma.sale.findMany({ where: { date: { gte: today } } }),
            prisma.product.findMany(),
            prisma.milkCollection.findMany({ where: { date: { gte: sevenDaysAgo } } })
        ]);

        // 2. Daily Totals Logic
        let cowLiters = 0, buffaloLiters = 0, totalMilkCost = 0;
        collections.forEach(c => {
            totalMilkCost += c.totalAmount || 0;
            if (c.farmer.milkType === 'COW') cowLiters += c.quantity;
            if (c.farmer.milkType === 'BUFFALO') buffaloLiters += c.quantity;
        });

        // 3. Chart Data Logic (Group by Date)
        const chartMap = {};
        allRecentCollections.forEach(c => {
            const date = new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            if (!chartMap[date]) chartMap[date] = { date, liters: 0, amount: 0 };
            chartMap[date].liters += c.quantity;
            chartMap[date].amount += c.totalAmount;
        });
        const trendData = Object.values(chartMap);

        res.json({
            milk: {
                totalLiters: cowLiters + buffaloLiters,
                totalCost: totalMilkCost,
                avgRate: (cowLiters + buffaloLiters) > 0 ? (totalMilkCost / (cowLiters + buffaloLiters)) : 0,
                cowLiters,
                buffaloLiters,
                farmerCount: new Set(collections.map(c => c.farmerId)).size
            },
            finance: {
                revenue: sales.reduce((a, b) => a + b.totalAmount, 0),
                expenses: expenses.reduce((a, b) => a + b.amount, 0),
            },
            inventory: products,
            trends: trendData // Data for the line chart
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};