import React from 'react';
import { getInitials, getAvatarColor } from '../utils/helpers';
import './MemberList.css';

const MemberList = ({ members, onRemove }) => {
  if (!members || members.length === 0) {
    return (
      <div className="empty-state">
        <h4>No members yet</h4>
        <p>Add members to start tracking expenses together.</p>
      </div>
    );
  }

  return (
    <div className="member-list">
      {members.map(member => (
        <MemberCard 
          key={member.id} 
          member={member} 
          onRemove={() => onRemove(member.id)}
        />
      ))}
    </div>
  );
};

const MemberCard = ({ member, onRemove }) => {
  const initials = getInitials(member.name);
  const avatarColor = getAvatarColor(member.name);

  return (
    <div className="member-card">
      <div className="member-info">
        <div 
          className="member-avatar"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div className="member-details">
          <h4 className="member-name">{member.name}</h4>
          {member.email && (
            <p className="member-email">{member.email}</p>
          )}
          <p className="member-joined">
            Joined {new Date(member.joinedAt).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <div className="member-actions">
        <button
          className="btn btn-danger btn-sm"
          onClick={onRemove}
          title="Remove member"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default MemberList;