/**
 * CSV export utilities
 */

/**
 * Convert array of objects to CSV format
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional custom headers
 * @returns {string} CSV formatted string
 */
function arrayToCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(header => escapeCSVValue(header)).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header];
      return escapeCSVValue(value);
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape CSV values (handle commas, quotes, newlines)
 * @param {any} value - Value to escape
 * @returns {string} Escaped CSV value
 */
function escapeCSVValue(value) {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Generate CSV for group expenses
 * @param {Object} group - Group object
 * @param {Array} expenses - Array of expense objects
 * @param {Object} balances - Balance calculations
 * @returns {Object} Object with expenses CSV and balances CSV
 */
function generateGroupCSV(group, expenses, balances) {
  // Create member lookup
  const memberLookup = {};
  group.members.forEach(member => {
    memberLookup[member.id] = member.name;
  });

  // Format expenses for CSV
  const expenseData = expenses.map(expense => {
    const splitMembers = expense.splitBetween.map(split => 
      `${memberLookup[split.memberId]}: ₹${split.amount.toFixed(2)}`
    ).join('; ');

    return {
      'Date': formatDate(expense.date),
      'Description': expense.description,
      'Category': expense.category,
      'Amount': expense.amount.toFixed(2),
      'Paid By': memberLookup[expense.paidBy] || 'Unknown',
      'Split Type': expense.splitType,
      'Split Details': splitMembers,
      'Created': formatDate(expense.createdAt)
    };
  });

  // Format balances for CSV
  const balanceData = Object.entries(balances).map(([memberId, balance]) => ({
    'Member': memberLookup[memberId] || 'Unknown',
    'Total Paid': balance.paid.toFixed(2),
    'Total Owes': balance.owes.toFixed(2),
    'Net Balance': balance.balance.toFixed(2),
    'Status': balance.balance > 0.01 ? 'Should Receive' : 
              balance.balance < -0.01 ? 'Should Pay' : 'Settled'
  }));

  return {
    expenses: arrayToCSV(expenseData),
    balances: arrayToCSV(balanceData),
    summary: {
      groupName: group.name,
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2),
      exportDate: formatDate(new Date())
    }
  };
}

/**
 * Format date for CSV export
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDate(date) {
  if (!date) return '';
  
  const d = new Date(date);
  return d.toLocaleDateString('en-US') + ' ' + d.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

/**
 * Generate settlements CSV
 * @param {Array} settlements - Array of settlement objects
 * @param {Object} memberLookup - Member ID to name lookup
 * @returns {string} CSV formatted settlements
 */
function generateSettlementsCSV(settlements, memberLookup) {
  const settlementData = settlements.map(settlement => ({
    'From': memberLookup[settlement.from] || 'Unknown',
    'To': memberLookup[settlement.to] || 'Unknown',
    'Amount': settlement.amount.toFixed(2),
    'Status': 'Pending'
  }));

  return arrayToCSV(settlementData);
}

module.exports = {
  arrayToCSV,
  escapeCSVValue,
  generateGroupCSV,
  formatDate,
  generateSettlementsCSV
};