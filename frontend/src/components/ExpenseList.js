import React from 'react';
import { formatCurrency, formatDate } from '../utils/helpers';
import './ExpenseList.css';

const ExpenseList = ({ expenses, members, onUpdate, onDelete }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="empty-state">
        <h4>No expenses yet</h4>
        <p>Add your first expense to start tracking group spending.</p>
      </div>
    );
  }

  // Create member lookup
  const memberLookup = {};
  members.forEach(member => {
    memberLookup[member.id] = member.name;
  });

  return (
    <div className="expense-list">
      {expenses.map(expense => (
        <ExpenseItem 
          key={expense.id} 
          expense={expense} 
          memberLookup={memberLookup}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

const ExpenseItem = ({ expense, memberLookup, onUpdate, onDelete }) => {
  const splitDetails = expense.splitBetween.map(split => 
    `${memberLookup[split.memberId]}: ${formatCurrency(split.amount)}`
  ).join(', ');

  // Handle payment display for different split types
  const getPaymentDetails = () => {
    if (expense.splitType === 'multi-payer' && expense.paidByMultiple && expense.paidByMultiple.length > 0) {
      const paymentDetails = expense.paidByMultiple.map(payment => 
        `${memberLookup[payment.memberId]}: ${formatCurrency(payment.amount)}`
      ).join(', ');
      
      // Check if it's truly multi-payer (more than one person paid)
      const activePayers = expense.paidByMultiple.filter(payment => payment.amount > 0);
      if (activePayers.length > 1) {
        return `Paid by: ${paymentDetails}`;
      } else if (activePayers.length === 1) {
        return `Paid by ${memberLookup[activePayers[0].memberId]}: ${formatCurrency(activePayers[0].amount)}`;
      } else {
        return 'Payment details: None specified';
      }
    } else if (expense.paidBy) {
      return `Paid by ${memberLookup[expense.paidBy] || 'Unknown'}`;
    } else {
      return 'Payer not specified';
    }
  };

  return (
    <div className="expense-item">
      <div className="expense-main">
        <div className="expense-header">
          <h4 className="expense-description">{expense.description}</h4>
          <div className="expense-amount">{formatCurrency(expense.amount)}</div>
        </div>
        
        <div className="expense-details">
          <div className="expense-meta">
            <span className="expense-category">{expense.category}</span>
            <span className="expense-date">{formatDate(expense.date)}</span>
            <span className="expense-payer">
              {getPaymentDetails()}
            </span>
          </div>
          
          <div className="expense-split">
            <strong>Split:</strong> {splitDetails}
          </div>
          
          {expense.splitType === 'multi-payer' && (
            <div className="expense-note">
              <em>Multi-payer expense - each person paid different amounts</em>
            </div>
          )}
        </div>
      </div>
      
      <div className="expense-actions">
        <button
          className="btn btn-danger btn-sm"
          onClick={() => onDelete(expense.id)}
          title="Delete expense"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ExpenseList;