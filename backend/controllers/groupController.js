const { GroupModel } = require('../models/Group');
const { ExpenseModel } = require('../models/Expense');
const { generateGroupCSV, generateSettlementsCSV } = require('../utils/csv');

/**
 * Group Controllers
 */

// Get all groups
const getAllGroups = async (req, res, next) => {
  try {
    const groups = GroupModel.findAll();
    res.json({
      success: true,
      data: groups,
      count: groups.length
    });
  } catch (error) {
    next(error);
  }
};

// Get single group by ID
const getGroupById = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = GroupModel.findById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: {
          message: 'Group not found',
          id: groupId
        }
      });
    }

    // Get expenses for this group
    const expenses = ExpenseModel.findByGroupId(groupId);
    
    // Calculate balances
    const balances = ExpenseModel.calculateBalances(groupId);
    
    // Get settlement suggestions
    const settlements = ExpenseModel.getSettlements(groupId);

    res.json({
      success: true,
      data: {
        ...group,
        expenses,
        balances,
        settlements,
        summary: {
          totalExpenses: expenses.length,
          totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0),
          memberCount: group.members.length
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Create new group
const createGroup = async (req, res, next) => {
  try {
    const group = GroupModel.create(req.body);
    
    res.status(201).json({
      success: true,
      data: group,
      message: 'Group created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Update group
const updateGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const updatedGroup = GroupModel.update(groupId, req.body);
    
    if (!updatedGroup) {
      return res.status(404).json({
        error: {
          message: 'Group not found',
          id: groupId
        }
      });
    }

    res.json({
      success: true,
      data: updatedGroup,
      message: 'Group updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete group
const deleteGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const deleted = GroupModel.delete(groupId);
    
    if (!deleted) {
      return res.status(404).json({
        error: {
          message: 'Group not found',
          id: groupId
        }
      });
    }

    res.json({
      success: true,
      message: 'Group and associated expenses deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Add member to group
const addMember = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const group = GroupModel.findInstanceById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: {
          message: 'Group not found',
          id: groupId
        }
      });
    }

    // Check if member name already exists in group
    const existingMember = group.members.find(m => 
      m.name.toLowerCase() === req.body.name.toLowerCase()
    );
    
    if (existingMember) {
      return res.status(400).json({
        error: {
          message: 'A member with this name already exists in the group',
          field: 'name'
        }
      });
    }

    const member = group.addMember(req.body);
    
    res.status(201).json({
      success: true,
      data: member,
      message: 'Member added successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Remove member from group
const removeMember = async (req, res, next) => {
  try {
    const { groupId, memberId } = req.params;
    const group = GroupModel.findInstanceById(groupId);
    
    if (!group) {
      return res.status(404).json({
        error: {
          message: 'Group not found',
          id: groupId
        }
      });
    }

    const success = group.removeMember(memberId);
    
    if (!success) {
      return res.status(404).json({
        error: {
          message: 'Member not found',
          id: memberId
        }
      });
    }

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    if (error.message.includes('Cannot remove member with existing expenses')) {
      return res.status(400).json({
        error: {
          message: 'Cannot remove member who has expenses. Please delete related expenses first.',
          code: 'MEMBER_HAS_EXPENSES'
        }
      });
    }
    next(error);
  }
};

// Export group data as CSV
const exportGroupData = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const { type = 'expenses' } = req.query; // 'expenses', 'balances', 'settlements', or 'all'
    
    const group = GroupModel.findById(groupId);
    if (!group) {
      return res.status(404).json({
        error: {
          message: 'Group not found',
          id: groupId
        }
      });
    }

    const expenses = ExpenseModel.findByGroupId(groupId);
    const balances = ExpenseModel.calculateBalances(groupId);
    const settlements = ExpenseModel.getSettlements(groupId);

    // Create member lookup
    const memberLookup = {};
    group.members.forEach(member => {
      memberLookup[member.id] = member.name;
    });

    let csvData = '';
    let filename = '';

    switch (type) {
      case 'expenses':
        const expenseCSV = generateGroupCSV(group, expenses, balances);
        csvData = expenseCSV.expenses;
        filename = `${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_expenses.csv`;
        break;
        
      case 'balances':
        const balanceCSV = generateGroupCSV(group, expenses, balances);
        csvData = balanceCSV.balances;
        filename = `${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_balances.csv`;
        break;
        
      case 'settlements':
        csvData = generateSettlementsCSV(settlements, memberLookup);
        filename = `${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_settlements.csv`;
        break;
        
      case 'all':
        const allCSV = generateGroupCSV(group, expenses, balances);
        const settlementsCSV = generateSettlementsCSV(settlements, memberLookup);
        
        csvData = `Group: ${group.name}\nExported: ${new Date().toISOString()}\n\n`;
        csvData += `EXPENSES\n${allCSV.expenses}\n\n`;
        csvData += `BALANCES\n${allCSV.balances}\n\n`;
        csvData += `SETTLEMENTS\n${settlementsCSV}`;
        filename = `${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_complete.csv`;
        break;
        
      default:
        return res.status(400).json({
          error: {
            message: 'Invalid export type. Use: expenses, balances, settlements, or all',
            field: 'type'
          }
        });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvData);
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  addMember,
  removeMember,
  exportGroupData
};