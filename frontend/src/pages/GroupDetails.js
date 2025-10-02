import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { groupAPI, expenseAPI, handleAPIError } from '../services/api';
import { formatDate, downloadCSV } from '../utils/helpers';
import MemberList from '../components/MemberList';
import ExpenseList from '../components/ExpenseList';
import BalanceSummary from '../components/BalanceSummary';
import AddMemberModal from '../components/AddMemberModal';
import AddExpenseModal from '../components/AddExpenseModal';
import './GroupDetails.css';

const GroupDetails = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  // Helper function for toast notifications
  const showToast = (message, type = 'info') => {
    if (type === 'success') {
      toast.success(message);
    } else if (type === 'error') {
      toast.error(message);
    } else {
      toast(message);
    }
  };

  const fetchGroup = useCallback(async () => {
    try {
      setLoading(true);
      const response = await groupAPI.getById(groupId);
      setGroup(response.data.data);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to load group: ${errorInfo.message}`);
      
      if (errorInfo.status === 404) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  }, [groupId, navigate]);

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const handleAddMember = async (memberData) => {
    try {
      await groupAPI.addMember(groupId, memberData);
      await fetchGroup(); // Refresh group data
      setShowAddMember(false);
      toast.success('Member added successfully!');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to add member: ${errorInfo.message}`);
      throw error;
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member? This action cannot be undone if they have expenses.')) {
      return;
    }

    try {
      await groupAPI.removeMember(groupId, memberId);
      await fetchGroup();
      toast.success('Member removed successfully!');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to remove member: ${errorInfo.message}`);
    }
  };

  const handleAddExpense = async (expenseData) => {
    try {
      await expenseAPI.create(groupId, expenseData);
      await fetchGroup(); // Refresh group data
      setShowAddExpense(false);
      toast.success('Expense added successfully!');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to add expense: ${errorInfo.message}`);
      throw error;
    }
  };

  const handleUpdateExpense = async (expenseId, expenseData) => {
    try {
      await expenseAPI.update(expenseId, expenseData);
      await fetchGroup(); // Refresh group data
      toast.success('Expense updated successfully!');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to update expense: ${errorInfo.message}`);
      throw error;
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseAPI.delete(expenseId);
      await fetchGroup();
      toast.success('Expense deleted successfully!');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to delete expense: ${errorInfo.message}`);
    }
  };

  const handleExportData = async (type) => {
    try {
      const response = await groupAPI.export(groupId, type);
      const filename = `${group.name.replace(/[^a-zA-Z0-9]/g, '_')}_${type}.csv`;
      downloadCSV(response.data, filename);
      toast.success(`${type} data exported successfully!`);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to export data: ${errorInfo.message}`);
    }
  };

  if (loading) {
    return (
      <div className="group-details">
        <div className="loading">Loading group details...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="group-details">
        <div className="error-state">
          <h2>Group not found</h2>
          <Link to="/" className="btn btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="group-details">
      <div className="group-header">
        <div className="breadcrumb">
          <Link to="/">Dashboard</Link>
          <span>/</span>
          <span>{group.name}</span>
        </div>
        
        <div className="group-title-section">
          <div>
            <h1>{group.name}</h1>
            {group.description && (
              <p className="group-description">{group.description}</p>
            )}
            <div className="group-meta">
              <span>Created {formatDate(group.createdAt)}</span>
              <span>•</span>
              <span>{group.members?.length || 0} members</span>
              <span>•</span>
              <span>{group.expenses?.length || 0} expenses</span>
            </div>
          </div>
          
          <div className="group-actions">
            <div className="export-dropdown">
              <button className="btn btn-secondary dropdown-toggle">
                Export
              </button>
              <div className="dropdown-menu">
                <button onClick={() => handleExportData('expenses')}>
                  Export Expenses
                </button>
                <button onClick={() => handleExportData('balances')}>
                  Export Balances
                </button>
                <button onClick={() => handleExportData('settlements')}>
                  Export Settlements
                </button>
                <button onClick={() => handleExportData('all')}>
                  Export All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="group-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            Expenses ({group.expenses?.length || 0})
          </button>
          <button
            className={`tab ${activeTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            Members ({group.members?.length || 0})
          </button>
          <button
            className={`tab ${activeTab === 'balances' ? 'active' : ''}`}
            onClick={() => setActiveTab('balances')}
          >
            Balances
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'expenses' && (
            <div className="expenses-tab">
              <div className="tab-header">
                <h3>Expenses</h3>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddExpense(true)}
                  disabled={!group.members || group.members.length === 0}
                >
                  Add Expense
                </button>
              </div>
              
              {!group.members || group.members.length === 0 ? (
                <div className="empty-state">
                  <h4>No members yet</h4>
                  <p>Add members to the group before creating expenses.</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowAddMember(true)}
                  >
                    Add Members
                  </button>
                </div>
              ) : (
                <ExpenseList
                  expenses={group.expenses || []}
                  members={group.members}
                  onUpdate={handleUpdateExpense}
                  onDelete={handleDeleteExpense}
                />
              )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="members-tab">
              <div className="tab-header">
                <h3>Members</h3>
                <button
                  className="btn btn-primary"
                  onClick={() => setShowAddMember(true)}
                >
                  Add Member
                </button>
              </div>
              
              <MemberList
                members={group.members || []}
                onRemove={handleRemoveMember}
              />
            </div>
          )}

          {activeTab === 'balances' && (
            <div className="balances-tab">
              <div className="tab-header">
                <h3>Balances & Settlements</h3>
              </div>
              
              <BalanceSummary
                balances={group.balances || {}}
                settlements={group.settlements || []}
                members={group.members || []}
              />
            </div>
          )}
        </div>
      </div>

      {showAddMember && (
        <AddMemberModal
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          onSubmit={handleAddMember}
          existingMembers={group.members || []}
        />
      )}

      {showAddExpense && (
        <AddExpenseModal
          isOpen={showAddExpense}
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={handleAddExpense}
          groupId={groupId}
          members={group.members || []}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default GroupDetails;