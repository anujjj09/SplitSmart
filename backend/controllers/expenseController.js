const { ExpenseModel } = require('../models/Expense');
const { GroupModel } = require('../models/Group');

/**
 * Expense Controllers
 */

// Get all expenses (with optional group filter)
const getAllExpenses = async (req, res, next) => {
  try {
    const { groupId } = req.query;
    
    let expenses;
    if (groupId) {
      expenses = ExpenseModel.findByGroupId(groupId);
    } else {
      expenses = ExpenseModel.findAll();
    }

    res.json({
      success: true,
      data: expenses,
      count: expenses.length
    });
  } catch (error) {
    next(error);
  }
};

// Get single expense by ID
const getExpenseById = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const expense = ExpenseModel.findById(expenseId);
    
    if (!expense) {
      return res.status(404).json({
        error: {
          message: 'Expense not found',
          id: expenseId
        }
      });
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

// Create new expense
const createExpense = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    
    // Verify group exists
    const group = GroupModel.findInstanceById(groupId);
    if (!group) {
      return res.status(404).json({
        error: {
          message: 'Group not found',
          id: groupId
        }
      });
    }

    // Verify paidBy member exists in group (if provided)
    if (req.body.paidBy) {
      const payer = group.getMemberByIdOrEmail(req.body.paidBy);
      if (!payer) {
        return res.status(400).json({
          error: {
            message: 'Payer is not a member of this group',
            field: 'paidBy'
          }
        });
      }
    }

    // Verify all paidByMultiple members exist in group (if provided)
    if (req.body.paidByMultiple && req.body.paidByMultiple.length > 0) {
      const invalidPayers = [];
      req.body.paidByMultiple.forEach(payment => {
        if (!group.getMemberByIdOrEmail(payment.memberId)) {
          invalidPayers.push(payment.memberId);
        }
      });

      if (invalidPayers.length > 0) {
        return res.status(400).json({
          error: {
            message: 'Some payers are not in this group',
            field: 'paidByMultiple',
            invalidMembers: invalidPayers
          }
        });
      }
    }

    // Verify all split members exist in group
    const invalidMembers = [];
    req.body.splitBetween.forEach(split => {
      if (!group.getMemberByIdOrEmail(split.memberId)) {
        invalidMembers.push(split.memberId);
      }
    });

    if (invalidMembers.length > 0) {
      return res.status(400).json({
        error: {
          message: 'Some split members are not in this group',
          field: 'splitBetween',
          invalidMembers
        }
      });
    }

    // Add groupId to expense data
    const expenseData = {
      ...req.body,
      groupId
    };

    const expense = ExpenseModel.create(expenseData);
    
    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    if (error.message.includes("don't match expense amount")) {
      return res.status(400).json({
        error: {
          message: error.message,
          field: 'splitBetween'
        }
      });
    }
    next(error);
  }
};

// Update expense
const updateExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    
    // Get existing expense to verify group membership if needed
    const existingExpense = ExpenseModel.findById(expenseId);
    if (!existingExpense) {
      return res.status(404).json({
        error: {
          message: 'Expense not found',
          id: expenseId
        }
      });
    }

    // If updating paidBy or splitBetween, verify group membership
    if (req.body.paidBy || req.body.splitBetween) {
      const group = GroupModel.findInstanceById(existingExpense.groupId);
      
      if (req.body.paidBy && !group.getMemberByIdOrEmail(req.body.paidBy)) {
        return res.status(400).json({
          error: {
            message: 'Payer is not a member of this group',
            field: 'paidBy'
          }
        });
      }

      if (req.body.splitBetween) {
        const invalidMembers = [];
        req.body.splitBetween.forEach(split => {
          if (!group.getMemberByIdOrEmail(split.memberId)) {
            invalidMembers.push(split.memberId);
          }
        });

        if (invalidMembers.length > 0) {
          return res.status(400).json({
            error: {
              message: 'Some split members are not in this group',
              field: 'splitBetween',
              invalidMembers
            }
          });
        }
      }
    }

    const updatedExpense = ExpenseModel.update(expenseId, req.body);
    
    if (!updatedExpense) {
      return res.status(404).json({
        error: {
          message: 'Expense not found',
          id: expenseId
        }
      });
    }

    res.json({
      success: true,
      data: updatedExpense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    if (error.message.includes("don't match expense amount")) {
      return res.status(400).json({
        error: {
          message: error.message,
          field: 'splitBetween'
        }
      });
    }
    next(error);
  }
};

// Delete expense
const deleteExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const deleted = ExpenseModel.delete(expenseId);
    
    if (!deleted) {
      return res.status(404).json({
        error: {
          message: 'Expense not found',
          id: expenseId
        }
      });
    }

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get group balances
const getGroupBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    
    // Verify group exists
    const group = GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({
        error: {
          message: 'Group not found',
          id: groupId
        }
      });
    }

    const balances = ExpenseModel.calculateBalances(groupId);
    const settlements = ExpenseModel.getSettlements(groupId);

    // Add member names to balances
    const enrichedBalances = {};
    Object.entries(balances).forEach(([memberId, balance]) => {
      const member = group.members.find(m => m.id === memberId);
      enrichedBalances[memberId] = {
        ...balance,
        memberName: member ? member.name : 'Unknown'
      };
    });

    // Add member names to settlements
    const enrichedSettlements = settlements.map(settlement => {
      const fromMember = group.members.find(m => m.id === settlement.from);
      const toMember = group.members.find(m => m.id === settlement.to);
      
      return {
        ...settlement,
        fromName: fromMember ? fromMember.name : 'Unknown',
        toName: toMember ? toMember.name : 'Unknown'
      };
    });

    res.json({
      success: true,
      data: {
        balances: enrichedBalances,
        settlements: enrichedSettlements,
        summary: {
          totalMembers: Object.keys(enrichedBalances).length,
          totalSettlements: enrichedSettlements.length,
          isBalanced: enrichedSettlements.length === 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getGroupBalances
};