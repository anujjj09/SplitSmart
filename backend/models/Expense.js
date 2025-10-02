const { v4: uuidv4 } = require('uuid');

// Import the shared expenses array from Group model
let expenses = [];

class Expense {
  constructor(expenseData) {
    this.id = uuidv4();
    this.groupId = expenseData.groupId;
    this.description = expenseData.description;
    this.amount = parseFloat(expenseData.amount);
    this.category = expenseData.category || 'General';
    this.paidBy = expenseData.paidBy || null; // member ID (optional for multi-payer expenses)
    this.paidByMultiple = expenseData.paidByMultiple || []; // Array of {memberId, amount} for multi-payer
    this.splitBetween = expenseData.splitBetween || []; // Array of {memberId, amount}
    this.splitType = expenseData.splitType || 'equal'; // 'equal', 'unequal', or 'multi-payer'
    this.date = expenseData.date ? new Date(expenseData.date) : new Date();
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  validateSplit() {
    if (this.splitType === 'equal') {
      // For equal split, calculate amounts automatically
      const memberCount = this.splitBetween.length;
      if (memberCount === 0) {
        throw new Error('Split must include at least one member');
      }
      
      const amountPerPerson = this.amount / memberCount;
      this.splitBetween = this.splitBetween.map(split => ({
        memberId: split.memberId,
        amount: parseFloat(amountPerPerson.toFixed(2))
      }));
    } else if (this.splitType === 'unequal' || this.splitType === 'multi-payer') {
      // For unequal split or multi-payer, validate that amounts add up
      const totalSplit = this.splitBetween.reduce((sum, split) => sum + parseFloat(split.amount || 0), 0);
      const difference = Math.abs(totalSplit - this.amount);
      
      if (difference > 0.01) { // Allow for small rounding differences
        throw new Error(`Split amounts (${totalSplit.toFixed(2)}) don't match expense amount (${this.amount.toFixed(2)})`);
      }
    }

    // For multi-payer expenses, validate payment amounts
    if (this.splitType === 'multi-payer' && this.paidByMultiple.length > 0) {
      const totalPaid = this.paidByMultiple.reduce((sum, payment) => sum + parseFloat(payment.amount || 0), 0);
      const difference = Math.abs(totalPaid - this.amount);
      
      if (difference > 0.01) {
        throw new Error(`Payment amounts (${totalPaid.toFixed(2)}) don't match expense amount (${this.amount.toFixed(2)})`);
      }
    }

    // Note: paidBy is now optional for all expense types for flexibility
  }

  toJSON() {
    return {
      id: this.id,
      groupId: this.groupId,
      description: this.description,
      amount: this.amount,
      category: this.category,
      paidBy: this.paidBy,
      paidByMultiple: this.paidByMultiple,
      splitBetween: this.splitBetween,
      splitType: this.splitType,
      date: this.date,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Expense operations
const ExpenseModel = {
  create(expenseData) {
    const expense = new Expense(expenseData);
    expense.validateSplit();
    expenses.push(expense);
    return expense.toJSON();
  },

  findAll() {
    return expenses.map(expense => expense.toJSON());
  },

  findById(expenseId) {
    const expense = expenses.find(e => e.id === expenseId);
    return expense ? expense.toJSON() : null;
  },

  findByGroupId(groupId) {
    return expenses
      .filter(expense => expense.groupId === groupId)
      .map(expense => expense.toJSON());
  },

  update(expenseId, updateData) {
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) return null;

    const expense = expenses[expenseIndex];
    
    // Update fields
    if (updateData.description) expense.description = updateData.description;
    if (updateData.amount) expense.amount = parseFloat(updateData.amount);
    if (updateData.category) expense.category = updateData.category;
    if (updateData.paidBy) expense.paidBy = updateData.paidBy;
    if (updateData.splitBetween) expense.splitBetween = updateData.splitBetween;
    if (updateData.splitType) expense.splitType = updateData.splitType;
    if (updateData.date) expense.date = new Date(updateData.date);
    
    expense.updatedAt = new Date();
    
    // Validate the updated split
    expense.validateSplit();
    
    return expense.toJSON();
  },

  delete(expenseId) {
    const expenseIndex = expenses.findIndex(e => e.id === expenseId);
    if (expenseIndex === -1) return false;

    expenses.splice(expenseIndex, 1);
    return true;
  },

  // Calculate balances for a group
  calculateBalances(groupId) {
    const groupExpenses = expenses.filter(expense => expense.groupId === groupId);
    const balances = {}; // memberId -> {paid, owes, balance}

    groupExpenses.forEach(expense => {
      // Handle payments - either single payer or multiple payers
      if (expense.splitType === 'multi-payer' && expense.paidByMultiple.length > 0) {
        // Multi-payer expense: distribute payments among multiple members
        expense.paidByMultiple.forEach(payment => {
          if (!balances[payment.memberId]) {
            balances[payment.memberId] = { paid: 0, owes: 0, balance: 0 };
          }
          balances[payment.memberId].paid += parseFloat(payment.amount || 0);
        });
      } else if (expense.paidBy) {
        // Single payer expense
        if (!balances[expense.paidBy]) {
          balances[expense.paidBy] = { paid: 0, owes: 0, balance: 0 };
        }
        balances[expense.paidBy].paid += expense.amount;
      }

      // Process splits - what each member owes
      expense.splitBetween.forEach(split => {
        if (!balances[split.memberId]) {
          balances[split.memberId] = { paid: 0, owes: 0, balance: 0 };
        }
        
        balances[split.memberId].owes += parseFloat(split.amount || 0);
      });
    });

    // Calculate net balances
    Object.keys(balances).forEach(memberId => {
      const member = balances[memberId];
      member.balance = member.paid - member.owes;
    });

    return balances;
  },

  // Get settlement suggestions for a group
  getSettlements(groupId) {
    const balances = this.calculateBalances(groupId);
    const settlements = [];

    // Separate debtors and creditors
    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([memberId, balance]) => {
      if (balance.balance < -0.01) {
        debtors.push({ memberId, amount: Math.abs(balance.balance) });
      } else if (balance.balance > 0.01) {
        creditors.push({ memberId, amount: balance.balance });
      }
    });

    // Sort by amount (largest first)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    // Calculate settlements
    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      
      const settlementAmount = Math.min(debtor.amount, creditor.amount);
      
      settlements.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount: parseFloat(settlementAmount.toFixed(2))
      });

      debtor.amount -= settlementAmount;
      creditor.amount -= settlementAmount;

      if (debtor.amount < 0.01) i++;
      if (creditor.amount < 0.01) j++;
    }

    return settlements;
  },

  // Clear all expenses (for testing)
  clearAll() {
    expenses = [];
  }
};

module.exports = { ExpenseModel, Expense };