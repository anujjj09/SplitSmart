import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { groupAPI, handleAPIError } from '../services/api';
import GroupList from '../components/GroupList';
import CreateGroupModal from '../components/CreateGroupModal';
import './Dashboard.css';

const Dashboard = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await groupAPI.getAll();
      setGroups(response.data.data || []);
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to load groups: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (groupData) => {
    try {
      const response = await groupAPI.create(groupData);
      setGroups(prev => [...prev, response.data.data]);
      setShowCreateModal(false);
      toast.success('Group created successfully!');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to create group: ${errorInfo.message}`);
      throw error; // Re-throw to keep modal open
    }
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await groupAPI.delete(groupId);
      setGroups(prev => prev.filter(group => group.id !== groupId));
      toast.success('Group deleted successfully!');
    } catch (error) {
      const errorInfo = handleAPIError(error);
      toast.error(`Failed to delete group: ${errorInfo.message}`);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading groups...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Your Groups</h1>
            <p className="subtitle">Manage your expense sharing groups</p>
          </div>
          <button 
            className="btn btn-primary btn-large"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="btn-icon">+</span>
            Create New Group
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {groups.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>Ready to start splitting expenses?</h3>
            <p>Create your first group and invite friends to start sharing costs for meals, trips, rent, and more!</p>
            <button 
              className="btn btn-primary btn-large mt-3"
              onClick={() => setShowCreateModal(true)}
            >
              <span className="btn-icon">+</span>
              Create Your First Group
            </button>
          </div>
        ) : (
          <GroupList 
            groups={groups} 
            onDeleteGroup={handleDeleteGroup}
          />
        )}
      </div>

      {showCreateModal && (
        <CreateGroupModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateGroup}
        />
      )}
    </div>
  );
};

export default Dashboard;