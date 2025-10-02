const express = require('express');
const router = express.Router();

const {
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');

const {
  validateExpense,
  validateUUID
} = require('../middleware/validation');

// Expense routes
router.get('/', getAllExpenses);
router.get('/:expenseId', validateUUID('expenseId'), getExpenseById);
router.put('/:expenseId', validateUUID('expenseId'), validateExpense, updateExpense);
router.delete('/:expenseId', validateUUID('expenseId'), deleteExpense);

module.exports = router;