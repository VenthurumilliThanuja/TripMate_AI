const express = require('express');
const router = express.Router();
const {
  getTripExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  exportExpensesCSV,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/trip/:tripId', getTripExpenses);
router.get('/trip/:tripId/export-csv', exportExpensesCSV);
router.route('/').post(createExpense);
router.route('/:id').put(updateExpense).delete(deleteExpense);

module.exports = router;

