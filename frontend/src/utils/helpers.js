/**
 * Format currency amount for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: '₹')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = '₹') => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${currency}0.00`;
  }
  return `${currency}${Math.abs(parseFloat(amount)).toFixed(2)}`;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '';
  
  const d = new Date(date);
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  };
  
  return d.toLocaleDateString('en-US', options);
};

/**
 * Generate equal split for members
 * @param {Array} memberIds - Array of member IDs
 * @param {number} totalAmount - Total amount to split
 * @returns {Array} Array of {memberId, amount} objects
 */
export const generateEqualSplit = (memberIds, totalAmount) => {
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    return [];
  }
  
  const amountPerPerson = parseFloat((totalAmount / memberIds.length).toFixed(2));
  
  return memberIds.map(memberId => ({
    memberId,
    amount: amountPerPerson
  }));
};

/**
 * Validate expense split amounts
 * @param {number} totalAmount - Total expense amount
 * @param {Array} splits - Array of {memberId, amount} objects
 * @returns {boolean} True if splits are valid
 */
export const validateSplit = (totalAmount, splits) => {
  if (!Array.isArray(splits) || splits.length === 0) {
    return false;
  }
  
  const totalSplit = splits.reduce((sum, split) => sum + parseFloat(split.amount || 0), 0);
  const difference = Math.abs(totalSplit - totalAmount);
  
  // Allow for small rounding differences (1 cent)
  return difference < 0.01;
};

/**
 * Calculate balance status for display
 * @param {number} balance - Member balance
 * @returns {Object} Status object with color and text
 */
export const getBalanceStatus = (balance) => {
  if (balance > 0.01) {
    return {
      status: 'positive',
      text: 'Should receive',
      color: 'text-success'
    };
  } else if (balance < -0.01) {
    return {
      status: 'negative',
      text: 'Should pay',
      color: 'text-danger'
    };
  } else {
    return {
      status: 'settled',
      text: 'Settled',
      color: 'text-muted'
    };
  }
};

/**
 * Download CSV file
 * @param {Blob} blob - CSV blob data
 * @param {string} filename - Filename for download
 */
export const downloadCSV = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Debounce function for search/input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Get expense categories for dropdown
 * @returns {Array} Array of category options
 */
export const getExpenseCategories = () => [
  { value: 'Food & Dining', label: 'Food & Dining' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Education', label: 'Education' },
  { value: 'General', label: 'General' },
  { value: 'Other', label: 'Other' }
];

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const isValidEmail = (email) => {
  if (!email || email.trim().length === 0) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Generate a simple hash for avatar colors
 * @param {string} str - String to hash
 * @returns {string} CSS color value
 */
export const getAvatarColor = (str) => {
  if (!str) return '#6c757d';
  
  const colors = [
    '#007bff', '#28a745', '#ffc107', '#dc3545',
    '#6f42c1', '#fd7e14', '#20c997', '#6c757d'
  ];
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Get initials from name
 * @param {string} name - Full name
 * @returns {string} Initials (max 2 characters)
 */
export const getInitials = (name) => {
  if (!name) return '?';
  
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};