/**
 * Splitting utilities for expense calculations
 */

/**
 * Calculate equal split amounts for a given total and number of people
 * @param {number} totalAmount - Total amount to split
 * @param {number} numberOfPeople - Number of people to split between
 * @returns {number} Amount per person (rounded to 2 decimal places)
 */
function calculateEqualSplit(totalAmount, numberOfPeople) {
  if (numberOfPeople <= 0) {
    throw new Error('Number of people must be greater than 0');
  }
  
  return parseFloat((totalAmount / numberOfPeople).toFixed(2));
}

/**
 * Validate that unequal split amounts add up to total
 * @param {number} totalAmount - Total expense amount
 * @param {Array} splits - Array of {memberId, amount} objects
 * @returns {boolean} True if splits are valid
 */
function validateUnequalSplit(totalAmount, splits) {
  const totalSplit = splits.reduce((sum, split) => sum + parseFloat(split.amount), 0);
  const difference = Math.abs(totalSplit - totalAmount);
  
  // Allow for small rounding differences (1 cent)
  return difference < 0.01;
}

/**
 * Generate equal split array for given members
 * @param {Array} memberIds - Array of member IDs
 * @param {number} totalAmount - Total amount to split
 * @returns {Array} Array of {memberId, amount} objects
 */
function generateEqualSplits(memberIds, totalAmount) {
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    throw new Error('Member IDs array cannot be empty');
  }
  
  const amountPerPerson = calculateEqualSplit(totalAmount, memberIds.length);
  
  return memberIds.map(memberId => ({
    memberId,
    amount: amountPerPerson
  }));
}

/**
 * Optimize settlements to minimize number of transactions
 * This implements a simplified debt settlement algorithm
 * @param {Object} balances - Object with member balances {memberId: {balance: number}}
 * @returns {Array} Array of settlement transactions {from, to, amount}
 */
function optimizeSettlements(balances) {
  const settlements = [];
  
  // Convert balances to arrays of debtors and creditors
  const debtors = [];
  const creditors = [];
  
  Object.entries(balances).forEach(([memberId, data]) => {
    const balance = data.balance || 0;
    if (balance < -0.01) {
      debtors.push({ memberId, amount: Math.abs(balance) });
    } else if (balance > 0.01) {
      creditors.push({ memberId, amount: balance });
    }
  });
  
  // Sort by amount (largest first) for optimization
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  
  // Match debtors with creditors
  let debtorIndex = 0;
  let creditorIndex = 0;
  
  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    
    const settlementAmount = Math.min(debtor.amount, creditor.amount);
    
    if (settlementAmount > 0.01) {
      settlements.push({
        from: debtor.memberId,
        to: creditor.memberId,
        amount: parseFloat(settlementAmount.toFixed(2))
      });
    }
    
    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;
    
    // Move to next debtor/creditor if current one is settled
    if (debtor.amount < 0.01) debtorIndex++;
    if (creditor.amount < 0.01) creditorIndex++;
  }
  
  return settlements;
}

/**
 * Format amount as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount, currency = '₹') {
  return `${currency}${Math.abs(amount).toFixed(2)}`;
}

/**
 * Calculate percentage split
 * @param {number} totalAmount - Total amount
 * @param {Array} percentages - Array of {memberId, percentage} objects
 * @returns {Array} Array of {memberId, amount} objects
 */
function calculatePercentageSplit(totalAmount, percentages) {
  // Validate percentages add up to 100
  const totalPercentage = percentages.reduce((sum, p) => sum + p.percentage, 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Percentages must add up to 100%');
  }
  
  return percentages.map(p => ({
    memberId: p.memberId,
    amount: parseFloat((totalAmount * p.percentage / 100).toFixed(2))
  }));
}

module.exports = {
  calculateEqualSplit,
  validateUnequalSplit,
  generateEqualSplits,
  optimizeSettlements,
  formatCurrency,
  calculatePercentageSplit
};