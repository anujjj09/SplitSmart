import React from 'react';
import { formatCurrency, getBalanceStatus } from '../utils/helpers';
import './BalanceSummary.css';

const BalanceSummary = ({ balances, settlements, members }) => {
  // Create member lookup
  const memberLookup = {};
  members.forEach(member => {
    memberLookup[member.id] = member.name;
  });

  const hasBalances = Object.keys(balances).length > 0;
  const hasSettlements = settlements && settlements.length > 0;

  return (
    <div className="balance-summary">
      <div className="balances-section">
        <h4>Member Balances</h4>
        {!hasBalances ? (
          <div className="empty-state">
            <p>No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="balance-cards">
            {Object.entries(balances).map(([memberId, balance]) => {
              const member = memberLookup[memberId];
              const status = getBalanceStatus(balance.balance);
              
              return (
                <div key={memberId} className="balance-card">
                  <div className="balance-header">
                    <h5 className="member-name">{member || 'Unknown'}</h5>
                    <div className={`balance-amount ${status.color}`}>
                      {formatCurrency(Math.abs(balance.balance))}
                    </div>
                  </div>
                  
                  <div className="balance-details">
                    <div className="balance-row">
                      <span>Total Paid:</span>
                      <span>{formatCurrency(balance.paid)}</span>
                    </div>
                    <div className="balance-row">
                      <span>Total Owes:</span>
                      <span>{formatCurrency(balance.owes)}</span>
                    </div>
                    <div className={`balance-row balance-status ${status.color}`}>
                      <span>Status:</span>
                      <span>{status.text}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {hasSettlements && (
        <div className="settlements-section">
          <h4>Suggested Settlements</h4>
          <div className="settlements-list">
            {settlements.map((settlement, index) => (
              <div key={index} className="settlement-item">
                <div className="settlement-description">
                  <strong>{memberLookup[settlement.from] || 'Unknown'}</strong>
                  {' should pay '}
                  <strong>{memberLookup[settlement.to] || 'Unknown'}</strong>
                </div>
                <div className="settlement-amount">
                  {formatCurrency(settlement.amount)}
                </div>
              </div>
            ))}
          </div>
          
          <div className="settlement-note">
            <p>
              <strong>Note:</strong> These are suggested settlements to minimize 
              the number of transactions needed to balance all accounts.
            </p>
          </div>
        </div>
      )}

      {hasBalances && !hasSettlements && (
        <div className="settlements-section">
          <div className="all-settled">
            <h4>🎉 All Settled!</h4>
            <p>Everyone is even - no settlements needed.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceSummary;