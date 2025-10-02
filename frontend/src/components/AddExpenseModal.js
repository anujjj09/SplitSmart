import React, { useState } from 'react';
import { getExpenseCategories, generateEqualSplit } from '../utils/helpers';
import './AddExpenseModal.css';

const AddExpenseModal = ({ isOpen, onClose, onExpenseAdded, groupId, members = [], showToast }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'General',
    paidBy: '',
    paidByMultiple: [],
    splitType: 'equal',
    splitBetween: [],
    date: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = getExpenseCategories();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // If splitType changes, handle special cases
      if (name === 'splitType') {
        if (value === 'multi-payer') {
          // For multi-payer, clear single payer and setup multi-payer splits
          newData.paidBy = '';
          if (newData.splitBetween.length === 0) {
            // Initialize with all members if none selected
            newData.splitBetween = members.map(member => ({
              memberId: member.id,
              amount: 0
            }));
          }
          // Setup paidByMultiple to match splitBetween
          newData.paidByMultiple = newData.splitBetween.map(split => ({
            memberId: split.memberId,
            amount: split.amount
          }));
        } else {
          // For equal/unequal, clear multi-payer data
          newData.paidByMultiple = [];
          
          // If paidBy changes and splitBetween is empty, default to equal split with payer
          if (prev.paidBy && prev.splitBetween.length === 0) {
            newData.splitBetween = [{ memberId: prev.paidBy, amount: 0 }];
          }
        }
      }
      
      // If paidBy changes and splitBetween is empty, default to equal split with payer
      if (name === 'paidBy' && prev.splitBetween.length === 0 && value) {
        newData.splitBetween = [{ memberId: value, amount: 0 }];
      }
      
      // If amount changes, recalculate splits based on type
      if (name === 'amount' && newData.splitBetween.length > 0) {
        const amount = parseFloat(value) || 0;
        if (amount > 0) {
          if (newData.splitType === 'equal') {
            const memberIds = newData.splitBetween.map(split => split.memberId);
            newData.splitBetween = generateEqualSplit(memberIds, amount);
          } else if (newData.splitType === 'multi-payer') {
            // For multi-payer, update both split and payment amounts proportionally
            const totalCurrentSplit = newData.splitBetween.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
            if (totalCurrentSplit > 0) {
              const ratio = amount / totalCurrentSplit;
              newData.splitBetween = newData.splitBetween.map(split => ({
                ...split,
                amount: parseFloat((parseFloat(split.amount) * ratio).toFixed(2))
              }));
              newData.paidByMultiple = newData.splitBetween.map(split => ({
                memberId: split.memberId,
                amount: split.amount
              }));
            }
          }
        }
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleMemberToggle = (memberId) => {
    setFormData(prev => {
      const isSelected = prev.splitBetween.some(split => split.memberId === memberId);
      let newSplitBetween;
      
      if (isSelected) {
        newSplitBetween = prev.splitBetween.filter(split => split.memberId !== memberId);
      } else {
        // When adding a member, preserve existing split amounts for other members
        const amount = parseFloat(prev.amount) || 0;
        const existingTotal = prev.splitBetween.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
        const remainingAmount = amount - existingTotal;
        
        newSplitBetween = [...prev.splitBetween, { 
          memberId, 
          amount: prev.splitType === 'equal' ? 0 : Math.max(0, remainingAmount)
        }];
      }
      
      // Recalculate for equal split only
      const amount = parseFloat(prev.amount) || 0;
      if (amount > 0 && prev.splitType === 'equal' && newSplitBetween.length > 0) {
        const memberIds = newSplitBetween.map(split => split.memberId);
        newSplitBetween = generateEqualSplit(memberIds, amount);
      }
      
      const newFormData = {
        ...prev,
        splitBetween: newSplitBetween
      };

      // Update paidByMultiple for multi-payer expenses
      if (prev.splitType === 'multi-payer') {
        newFormData.paidByMultiple = newSplitBetween.map(split => ({
          memberId: split.memberId,
          amount: split.amount
        }));
      }
      
      return newFormData;
    });
  };

  const handleSplitAmountChange = (memberId, amount) => {
    setFormData(prev => {
      const newSplitBetween = prev.splitBetween.map(split =>
        split.memberId === memberId 
          ? { ...split, amount: parseFloat(amount) || 0 }
          : split
      );

      const newFormData = {
        ...prev,
        splitBetween: newSplitBetween
      };

      // Don't auto-sync payment amounts - let users set them independently
      
      return newFormData;
    });
  };

  const handlePaymentAmountChange = (memberId, amount) => {
    setFormData(prev => {
      const currentPayments = prev.paidByMultiple || [];
      const existingIndex = currentPayments.findIndex(p => p.memberId === memberId);
      
      if (amount === '' || parseFloat(amount) === 0) {
        // Remove the payment if amount is empty or zero
        if (existingIndex >= 0) {
          return {
            ...prev,
            paidByMultiple: currentPayments.filter(p => p.memberId !== memberId)
          };
        }
        return prev;
      }
      
      // Add or update the payment
      if (existingIndex >= 0) {
        return {
          ...prev,
          paidByMultiple: currentPayments.map(p => 
            p.memberId === memberId 
              ? { ...p, amount: amount }
              : p
          )
        };
      } else {
        return {
          ...prev,
          paidByMultiple: [...currentPayments, { memberId, amount }]
        };
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    } else if (amount > 999999.99) {
      newErrors.amount = 'Amount is too large';
    }
    
    // Payment validation
    if (formData.splitType === 'multi-payer') {
      if (!formData.paidByMultiple || formData.paidByMultiple.length === 0) {
        newErrors.paidByMultiple = 'Multi-payer expenses require at least one payer';
      } else {
        const totalPaid = formData.paidByMultiple.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);
        if (Math.abs(totalPaid - amount) > 0.01) {
          newErrors.paidByMultiple = `Payment amounts (${totalPaid.toFixed(2)}) must equal expense amount (${amount.toFixed(2)})`;
        }
      }
    } else {
      // For single payer expenses, paidBy is now optional
      if (formData.paidBy && typeof formData.paidBy !== 'string') {
        newErrors.paidBy = 'Please select a valid payer';
      }
    }
    
    // Split validation
    if (formData.splitBetween.length === 0) {
      newErrors.splitBetween = 'Please select at least one member to split with';
    } else if (formData.splitType === 'unequal' || formData.splitType === 'multi-payer') {
      const totalSplit = formData.splitBetween.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
      if (Math.abs(totalSplit - amount) > 0.01) {
        newErrors.splitBetween = `Split amounts (${totalSplit.toFixed(2)}) must equal expense amount (${amount.toFixed(2)})`;
      }
      
      // Check for zero or negative amounts
      const invalidSplits = formData.splitBetween.filter(split => !split.amount || parseFloat(split.amount) <= 0);
      if (invalidSplits.length > 0) {
        newErrors.splitBetween = 'All split amounts must be positive numbers';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Additional validation before submission
    if (!formData.splitBetween || formData.splitBetween.length === 0) {
      setErrors(prev => ({
        ...prev,
        splitBetween: 'Please select at least one member to split the expense with'
      }));
      return;
    }
    
    if (!formData.description.trim()) {
      setErrors(prev => ({
        ...prev,
        description: 'Description is required'
      }));
      return;
    }
    
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setErrors(prev => ({
        ...prev,
        amount: 'Amount must be a positive number'
      }));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare expense data based on split type
      const expenseData = {
        description: formData.description.trim(),
        amount: amount,
        splitType: formData.splitType,
        splitBetween: formData.splitBetween.map(split => ({
          memberId: split.memberId,
          amount: formData.splitType === 'equal' 
            ? amount / formData.splitBetween.length
            : parseFloat(split.amount) || 0
        }))
      };

      // Handle payment information based on split type
      if (formData.splitType === 'multi-payer') {
        expenseData.paidByMultiple = formData.paidByMultiple.map(payment => ({
          memberId: payment.memberId,
          amount: parseFloat(payment.amount) || 0
        }));
      } else if (formData.paidBy) {
        // Single payer - only include if selected
        expenseData.paidBy = formData.paidBy;
      }
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        paidBy: '',
        splitType: 'equal',
        splitBetween: [],
        paidByMultiple: []
      });
      setErrors({});
      
      // Call the parent component to handle the API call
      if (onExpenseAdded) {
        await onExpenseAdded(expenseData);
      }
      onClose();
      showToast('Expense added successfully!', 'success');
      
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast(error.message || 'Failed to add expense', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        description: '',
        amount: '',
        category: 'General',
        paidBy: '',
        splitType: 'equal',
        splitBetween: [],
        paidByMultiple: [],
        date: new Date().toISOString().split('T')[0]
      });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  const memberLookup = {};
  members.forEach(member => {
    memberLookup[member.id] = member.name;
  });

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content expense-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Expense</h2>
          <button 
            className="modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description *
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-control ${errors.description ? 'error' : ''}`}
                placeholder="What was this expense for?"
                disabled={isSubmitting}
              />
              {errors.description && (
                <div className="error-message">{errors.description}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="amount" className="form-label">
                Amount *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className={`form-control ${errors.amount ? 'error' : ''}`}
                placeholder="0.00"
                step="0.01"
                min="0"
                max="999999.99"
                disabled={isSubmitting}
              />
              {errors.amount && (
                <div className="error-message">{errors.amount}</div>
              )}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-control"
                disabled={isSubmitting}
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="date" className="form-label">
                Date
              </label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="form-control"
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          {/* Split Configuration */}
          <div className="form-group">
            <label className="form-label">How do you want to split?</label>
            <div className="split-type-selector">
              <label className="split-option">
                <input
                  type="radio"
                  name="splitType"
                  value="equal"
                  checked={formData.splitType === 'equal'}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <div className="option-content">
                  <span className="option-title">Split equally</span>
                  <span className="option-desc">Everyone owes the same amount</span>
                </div>
              </label>
              
              <label className="split-option">
                <input
                  type="radio"
                  name="splitType"
                  value="unequal"
                  checked={formData.splitType === 'unequal'}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <div className="option-content">
                  <span className="option-title">Custom amounts</span>
                  <span className="option-desc">Set different amounts</span>
                </div>
              </label>
              
              <label className="split-option">
                <input
                  type="radio"
                  name="splitType"
                  value="multi-payer"
                  checked={formData.splitType === 'multi-payer'}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <div className="option-content">
                  <span className="option-title">Multiple payers</span>
                  <span className="option-desc">Track who paid how much</span>
                </div>
              </label>
            </div>
          </div>

          {/* Who Owes What */}
          <div className="form-group">
            <label className="form-label">Who is included?</label>
            <div className="members-grid">
              {members.map(member => {
                const isSelected = formData.splitBetween.some(split => split.memberId === member.id);
                const splitAmount = formData.splitBetween.find(split => split.memberId === member.id)?.amount || 0;
                
                return (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <label className="member-name">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleMemberToggle(member.id)}
                          disabled={isSubmitting}
                        />
                        {member.name}
                      </label>
                    </div>
                    
                    {isSelected && (
                      <div className="member-amount">
                        {formData.splitType === 'equal' ? (
                          <span className="amount-display">₹{splitAmount.toFixed(2)}</span>
                        ) : (
                          <input
                            type="number"
                            className="amount-input"
                            value={splitAmount === 0 ? '' : splitAmount}
                            onChange={(e) => handleSplitAmountChange(member.id, e.target.value)}
                            placeholder="0"
                            step="0.01"
                            min="0"
                            disabled={isSubmitting}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Information */}
          <div className="form-group">
            <label className="form-label">
              {formData.splitType === 'multi-payer' ? 'Who paid and how much?' : 'Who paid? (optional)'}
            </label>
            
            {formData.splitType === 'multi-payer' ? (
              <div className="payment-grid">
                {members.map(member => {
                  const payment = formData.paidByMultiple.find(p => p.memberId === member.id);
                  return (
                    <div key={member.id} className="payment-item">
                      <span className="member-name">{member.name}</span>
                      <input
                        type="number"
                        className="amount-input"
                        value={payment?.amount || ''}
                        onChange={(e) => handlePaymentAmountChange(member.id, e.target.value)}
                        placeholder="0"
                        step="0.01"
                        min="0"
                        disabled={isSubmitting}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <select
                name="paidBy"
                value={formData.paidBy}
                onChange={handleChange}
                className={`form-control ${errors.paidBy ? 'error' : ''}`}
                disabled={isSubmitting}
              >
                <option value="">Select who paid (optional)</option>
                {members.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            )}
            
            {formData.splitType === 'multi-payer' && errors.paidByMultiple && (
              <div className="error-message">{errors.paidByMultiple}</div>
            )}
            {formData.splitType !== 'multi-payer' && errors.paidBy && (
              <div className="error-message">{errors.paidBy}</div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !formData.description.trim() || !formData.amount}
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;