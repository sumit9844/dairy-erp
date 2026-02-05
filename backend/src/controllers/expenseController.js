const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.addExpense = async (req, res) => {
    try {
        const { category, amount, description, date } = req.body;
        const expense = await prisma.expense.create({
            data: { 
                category, 
                amount: parseFloat(amount), 
                description,
                date: date ? new Date(date) : new Date()
            }
        });
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllExpenses = async (req, res) => {
    try {
        const expenses = await prisma.expense.findMany({
            orderBy: { date: 'desc' }
        });
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};