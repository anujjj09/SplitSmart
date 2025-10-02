const express = require('express');
const router = express.Router();

const {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  exportGroupData
} = require('../controllers/groupController');

const {
  createExpense,
  getGroupBalances
} = require('../controllers/expenseController');

const {
  validateGroup,
  validateMember,
  validateExpense,
  validateUUID
} = require('../middleware/validation');

// Group routes
router.get('/', getAllGroups);
router.post('/', validateGroup, createGroup);
router.get('/:groupId', validateUUID('groupId'), getGroupById);
router.put('/:groupId', validateUUID('groupId'), validateGroup, updateGroup);
router.delete('/:groupId', validateUUID('groupId'), deleteGroup);

// Member routes
router.post('/:groupId/members', validateUUID('groupId'), validateMember, addMember);
router.delete('/:groupId/members/:memberId', 
  validateUUID('groupId'), 
  validateUUID('memberId'), 
  removeMember
);

// Expense routes for specific group
router.post('/:groupId/expenses', 
  validateUUID('groupId'), 
  validateExpense, 
  createExpense
);

// Balance routes
router.get('/:groupId/balances', validateUUID('groupId'), getGroupBalances);

// Export routes
router.get('/:groupId/export', validateUUID('groupId'), exportGroupData);

module.exports = router;