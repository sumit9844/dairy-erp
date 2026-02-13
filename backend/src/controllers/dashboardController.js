const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. MAIN DASHBOARD STATS
exports.getStats = async (req, res) => {
    try {
        const { range, customDate } = req.query; 
        
        let startDate = new Date();
        let endDate = new Date(); 
        const now = new Date();

        if (customDate) {
            startDate = new Date(customDate);
            endDate = new Date(customDate);
        } else {
            startDate.setHours(0, 0, 0, 0);
            if (range === 'week') startDate.setDate(now.getDate() - 7);
            if (range === 'month') startDate.setMonth(now.getMonth() - 1);
            if (range === 'year') startDate.setFullYear(now.getFullYear() - 1);
        }
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const [collections, expenses, sales, products] = await Promise.all([
            prisma.milkCollection.findMany({ 
                where: { date: { gte: startDate, lte: endDate } },
                include: { farmer: true }
            }),
            prisma.expense.aggregate({ 
                where: { date: { gte: startDate, lte: endDate } }, 
                _sum: { amount: true } 
            }),
            prisma.sale.aggregate({ 
                where: { date: { gte: startDate, lte: endDate } }, 
                _sum: { totalAmount: true } 
            }),
            prisma.product.findMany()
        ]);

        let totalMilkCost = 0;
        let totalLiters = 0;
        let cowLiters = 0;
        let buffaloLiters = 0;
        let fatSum = 0, snfSum = 0, count = 0;

        collections.forEach(c => {
            totalLiters += c.quantity;
            if (c.farmer.milkType === 'COW') cowLiters += c.quantity;
            else buffaloLiters += c.quantity;
            
            if(c.fat > 0) { fatSum += c.fat; snfSum += c.snf; count++; }

            let rate = 0;
            if (c.farmer.rateType === 'FAT_SNF') {
                const f = c.fat || 0; const s = c.snf || 0;
                rate = (f * c.farmer.fatRate) + (s * c.farmer.snfRate);
            } else if (c.farmer.rateType === 'FAT_ONLY') {
                rate = (c.fat || 0) * c.farmer.fatRate;
            } else {
                rate = c.farmer.fixedRate;
            }
            totalMilkCost += (c.quantity * rate);
        });

        const revenue = sales._sum.totalAmount || 0;
        const expense = expenses._sum.amount || 0;
        const netProfit = revenue - (totalMilkCost + expense);

        // Pending Payments Logic
        const allMilk = await prisma.milkCollection.findMany({ include: { farmer: true } });
        let lifetimeMilkCost = 0;
        allMilk.forEach(c => {
             let rate = c.farmer.fixedRate; 
             if(c.farmer.rateType === 'FAT_ONLY') rate = (c.fat || 3.5) * c.farmer.fatRate;
             if(c.farmer.rateType === 'FAT_SNF') rate = ((c.fat || 3.5) * c.farmer.fatRate) + ((c.snf || 8.5) * c.farmer.snfRate);
             lifetimeMilkCost += (c.quantity * rate);
        });
        const totalAdvances = await prisma.advance.aggregate({ _sum: { amount: true } });
        const pendingPayments = lifetimeMilkCost - (totalAdvances._sum.amount || 0);

        const trendMap = {};
        collections.forEach(c => {
            const d = c.date.toISOString().split('T')[0];
            if(!trendMap[d]) trendMap[d] = 0;
            trendMap[d] += c.quantity;
        });
        const trendData = Object.keys(trendMap).map(k => ({ date: k, liters: trendMap[k] }));

        res.json({
            milk: {
                totalLiters,
                totalCost: Math.round(totalMilkCost),
                avgFat: count > 0 ? (fatSum / count) : 0,
                avgSnf: count > 0 ? (snfSum / count) : 0,
                cowLiters, buffaloLiters,
                farmerCount: new Set(collections.map(c => c.farmerId)).size
            },
            finance: {
                revenue,
                expenses: expense,
                netProfit: Math.round(netProfit),
                pendingPayments: Math.round(pendingPayments)
            },
            inventory: products.map(p => ({ name: p.name, stock: p.stock, unit: p.unit })),
            trends: trendData
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server Error" });
    }
};

// 2. LEDGER (For Accountant View)
exports.getLedger = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const start = new Date(startDate + "T00:00:00Z");
        const end = new Date(endDate + "T23:59:59Z");

        const [collections, expenses, sales] = await Promise.all([
            prisma.milkCollection.findMany({ 
                where: { date: { gte: start, lte: end } },
                include: { farmer: true }
            }),
            prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
            prisma.sale.findMany({ where: { date: { gte: start, lte: end } } })
        ]);

        let ledger = [];

        collections.forEach(c => {
            let rate = c.farmer.fixedRate;
            if(c.farmer.rateType === 'FAT_ONLY') rate = (c.fat || 0) * c.farmer.fatRate;
            if(c.farmer.rateType === 'FAT_SNF') rate = ((c.fat || 0) * c.farmer.fatRate) + ((c.snf || 0) * c.farmer.snfRate);
            
            ledger.push({
                id: c.id, date: c.date, type: 'PROCUREMENT',
                description: `Milk from ${c.farmer.name} (${c.quantity}L)`,
                debit: Math.round(c.quantity * rate), credit: 0
            });
        });

        expenses.forEach(e => {
            ledger.push({
                id: e.id, date: e.date, type: 'EXPENSE',
                description: `${e.category} - ${e.description || ''}`,
                debit: e.amount, credit: 0
            });
        });

        sales.forEach(s => {
            ledger.push({
                id: s.id, date: s.date, type: 'SALE',
                description: `Sale to ${s.customerName} (${s.quantity}L)`,
                debit: 0, credit: s.totalAmount
            });
        });

        ledger.sort((a, b) => new Date(a.date) - new Date(b.date));

        const totals = ledger.reduce((acc, curr) => ({
            totalDebit: acc.totalDebit + curr.debit,
            totalCredit: acc.totalCredit + curr.credit
        }), { totalDebit: 0, totalCredit: 0 });

        res.json({ ledger, totals });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Ledger Error" });
    }
};

// 3. DETAILED REPORTS (Monthly/Daily)
exports.getDetailedReports = async (req, res) => {
    try {
        const { type, year } = req.query;
        const currentYear = parseInt(year) || new Date().getFullYear();
        const start = new Date(`${currentYear}-01-01`);
        const end = new Date(`${currentYear}-12-31`);
        end.setHours(23, 59, 59, 999);

        const [collections, expenses, sales] = await Promise.all([
            prisma.milkCollection.findMany({ where: { date: { gte: start, lte: end } } }),
            prisma.expense.findMany({ where: { date: { gte: start, lte: end } } }),
            prisma.sale.findMany({ where: { date: { gte: start, lte: end } } })
        ]);

        const reportMap = {};
        const getKey = (date) => {
            const d = new Date(date);
            if (type === 'daily') return d.toISOString().split('T')[0];
            return `${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear()}`;
        };

        collections.forEach(c => {
            const key = getKey(c.date);
            if (!reportMap[key]) reportMap[key] = { period: key, milkCost: 0, expenses: 0, revenue: 0 };
            reportMap[key].milkCost += c.totalAmount;
        });

        expenses.forEach(e => {
            const key = getKey(e.date);
            if (!reportMap[key]) reportMap[key] = { period: key, milkCost: 0, expenses: 0, revenue: 0 };
            reportMap[key].expenses += e.amount;
        });

        sales.forEach(s => {
            const key = getKey(s.date);
            if (!reportMap[key]) reportMap[key] = { period: key, milkCost: 0, expenses: 0, revenue: 0 };
            reportMap[key].revenue += s.totalAmount;
        });

        const finalReport = Object.values(reportMap).map(item => ({
            ...item,
            netProfit: item.revenue - (item.milkCost + item.expenses)
        }));

        res.json(finalReport);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};