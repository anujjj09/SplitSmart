import React from 'react';
import { Link } from 'react-router-dom';
import './GroupList.css';

const GroupList = ({ groups, onDeleteGroup }) => {
  return (
    <div className="group-list-container">
      <div className="groups-header">
        <h2>Your Active Groups</h2>
        <p className="groups-subtitle">
          Click on any group name to view expenses, add new costs, and see who owes what
        </p>
      </div>
      <div className="group-list">
        {groups.map(group => (
          <GroupCard 
            key={group.id} 
            group={group} 
            onDelete={() => onDeleteGroup(group.id)}
          />
        ))}
      </div>
    </div>
  );
};

const GroupCard = ({ group, onDelete }) => {
  const memberCount = group.members?.length || 0;

  return (
    <div className="group-card">
      <div className="group-card-header">
        <div>
          <h3 className="group-name">
            <Link to={`/groups/${group.id}`}>
              {group.name}
            </Link>
          </h3>
          {group.description && (
            <p className="group-description">{group.description}</p>
          )}
        </div>
        <div className="group-actions">
          <button
            className="btn btn-danger btn-sm"
            onClick={onDelete}
            title="Delete group"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="group-card-body">
        {memberCount > 0 && (
          <div className="member-list">
            <span className="member-list-label">Members:</span>
            <div className="members">
              {group.members.slice(0, 5).map(member => (
                <span key={member.id} className="member-tag">
                  {member.name}
                </span>
              ))}
              {memberCount > 5 && (
                <span className="member-tag more">
                  +{memberCount - 5} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="group-card-footer">
        <div className="footer-help">
          <span className="help-text">💡 Click the group name to manage expenses and see balances</span>
        </div>
        <Link 
          to={`/groups/${group.id}`}
          className="btn btn-primary"
        >
          Manage Group →
        </Link>
      </div>
    </div>
  );
};

export default GroupList;