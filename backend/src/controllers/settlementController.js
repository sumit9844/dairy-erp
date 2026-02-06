const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getFarmerStatement = async (req, res) => {
    try {
        const { farmerId, startDate, endDate } = req.query;

        // 1. Get Farmer Config
        const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } });
        if (!farmer) return res.status(404).json({ error: "Farmer not found" });

        // 2. Fetch Records
        const rawRecords = await prisma.milkCollection.findMany({
            where: {
                farmerId: farmerId,
                date: {
                    gte: new Date(startDate + "T00:00:00Z"),
                    lte: new Date(endDate + "T23:59:59Z")
                }
            },
            orderBy: { date: 'asc' }
        });

        let totalQty = 0, fatSum = 0, snfSum = 0, qualityCount = 0;
        const processedTransactions = [];

        for (let record of rawRecords) {
            let activeFat = record.fat || 0;
            let activeSnf = record.snf || 0;
            let isAutoFilled = false;

            // AUTO-FILL LOGIC
            if (activeFat === 0) {
                // Find ANY previous record with Fat > 0 for this specific farmer
                const lastReading = await prisma.milkCollection.findFirst({
                    where: { 
                        farmerId: farmerId, 
                        fat: { gt: 0 },
                        date: { lt: record.date } // Look at records before this one
                    },
                    orderBy: { date: 'desc' }
                });

                if (lastReading) {
                    activeFat = lastReading.fat;
                    activeSnf = lastReading.snf;
                    isAutoFilled = true;
                }
            }

            totalQty += record.quantity;
            
            // Only add to average if we actually have a number > 0
            if (activeFat > 0) {
                fatSum += activeFat;
                snfSum += activeSnf;
                qualityCount++;
            }

            processedTransactions.push({ 
                ...record, 
                fat: activeFat, 
                snf: activeSnf, 
                isAutoFilled 
            });
        }

        // Calculate Averages
        const avgFat = qualityCount > 0 ? (fatSum / qualityCount) : 0;
        const avgSnf = qualityCount > 0 ? (snfSum / qualityCount) : 0;

        // Calculate Rate based on the Averages
        let appliedRate = 0;
        if (farmer.rateType === "FAT_SNF") {
            appliedRate = (avgFat * farmer.fatRate) + (avgSnf * farmer.snfRate);
        } else if (farmer.rateType === "FAT_ONLY") {
            appliedRate = (avgFat * farmer.fatRate);
        } else {
            appliedRate = farmer.fixedRate;
        }

        const grossAmount = Math.round(totalQty * appliedRate);
        const advances = await prisma.advance.findMany({ where: { farmerId } });
        const totalAdvance = advances.reduce((acc, curr) => acc + curr.amount, 0);

        // SENDING THE FULL DATA OBJECT
        res.json({
            transactions: processedTransactions,
            farmerConfig: { 
                rateType: farmer.rateType,
                fatRate: farmer.fatRate,
                snfRate: farmer.snfRate,
                fixedRate: farmer.fixedRate
            },
            summary: {
                avgFat: Number(avgFat.toFixed(2)),
                avgSnf: Number(avgSnf.toFixed(2)),
                totalQty: Number(totalQty.toFixed(2)),
                appliedRate: Number(appliedRate.toFixed(2)),
                grossAmount: Number(totalQty * appliedRate), // Unrounded for precise display
                advanceDeducted: Number(totalAdvance),
                netPayable: Number(grossAmount - totalAdvance)
            }
        });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ error: error.message }); 
    }
};