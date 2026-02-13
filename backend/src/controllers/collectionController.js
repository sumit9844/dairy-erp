const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addCollection = async (req, res) => {
    try {
        const { farmerId, quantity, fat, snf, shift, date } = req.body;
        
        // LOGIC: Use selected date but add CURRENT TIME to ensure LIFO sorting
        let entryDate = new Date();
        if (date) {
            entryDate = new Date(date); // Sets to 00:00:00
            const now = new Date();
            // Add current hours/mins/secs to the selected date
            entryDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        }

        const collection = await prisma.milkCollection.create({
            data: {
                farmerId,
                quantity: parseFloat(quantity),
                fat: parseFloat(fat) || 0,
                snf: parseFloat(snf) || 0,
                shift,
                date: entryDate, // Saves with time component
                rate: 0, 
                totalAmount: 0 
            }
        });
        res.status(201).json(collection);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateCollection = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, fat, snf, shift, date } = req.body;
        
        // Preserve time if date is updated, or keep old time?
        // Simple update:
        const updated = await prisma.milkCollection.update({
            where: { id },
            data: {
                quantity: parseFloat(quantity),
                fat: parseFloat(fat),
                snf: parseFloat(snf),
                shift,
                // If date is passed, we usually keep it simple for edits
                ...(date && { date: new Date(date) }) 
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCollectionsByDate = async (req, res) => {
    try {
        const { date } = req.query; 
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);

        const logs = await prisma.milkCollection.findMany({
            where: { date: { gte: start, lte: end } },
            include: { farmer: true },
            orderBy: { date: 'desc' } // <--- THIS ENSURES LAST IN FIRST OUT
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ... existing imports

// NEW: Delete multiple records at once
exports.deleteBulkCollections = async (req, res) => {
    try {
        const { ids } = req.body; // Expects an array like ["id1", "id2"]
        
        if (!ids || ids.length === 0) {
            return res.status(400).json({ error: "No items selected" });
        }

        const result = await prisma.milkCollection.deleteMany({
            where: {
                id: { in: ids }
            }
        });

        res.json({ message: `${result.count} records deleted successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};