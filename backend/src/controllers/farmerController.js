const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Register a new Farmer
exports.createFarmer = async (req, res) => {
    try {
        const { farmerCode, name, phone, address, milkType, rateType, fatRate, snfRate, fixedRate } = req.body;
        
        const newFarmer = await prisma.farmer.create({
            data: { 
                farmerCode, name, phone, address, milkType, rateType,
                fatRate: parseFloat(fatRate) || 0,
                snfRate: parseFloat(snfRate) || 0,
                fixedRate: parseFloat(fixedRate) || 0
            }
        });
        res.status(201).json(newFarmer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 2. Get All Farmers
exports.getAllFarmers = async (req, res) => {
    try {
        const farmers = await prisma.farmer.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(farmers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Update Farmer
exports.updateFarmer = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await prisma.farmer.update({
            where: { id },
            data: {
                ...req.body,
                fatRate: parseFloat(req.body.fatRate) || 0,
                snfRate: parseFloat(req.body.snfRate) || 0,
                fixedRate: parseFloat(req.body.fixedRate) || 0,
            }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; // <--- THIS CLOSING BRACE WAS MISSING/MISPLACED IN YOUR CODE

// 4. Toggle Active Status (Soft Delete)
exports.toggleFarmerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body; // true or false
        
        const updated = await prisma.farmer.update({
            where: { id },
            data: { active: active }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Hard Delete (Only if no records exist)
// 5. Hard Delete (Force delete everything)
exports.deleteFarmer = async (req, res) => {
    try {
        const { id } = req.params;

        // Transaction: Delete related data first, then the farmer
        await prisma.$transaction([
            // 1. Delete all milk collections for this farmer
            prisma.milkCollection.deleteMany({ where: { farmerId: id } }),
            
            // 2. Delete all advances/loans for this farmer
            prisma.advance.deleteMany({ where: { farmerId: id } }),

            // 3. Finally, delete the farmer
            prisma.farmer.delete({ where: { id } })
        ]);

        res.json({ message: "Farmer and all related records deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ error: error.message });
    }
};
