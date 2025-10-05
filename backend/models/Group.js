const { v4: uuidv4 } = require('uuid');

// In-memory data store
let groups = [];
let expenses = [];

class Group {
  constructor(name, description = '') {
    this.id = uuidv4();
    this.name = name;
    this.description = description;
    this.members = [];
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  addMember(memberData) {
    const member = {
      id: uuidv4(),
      name: memberData.name,
      email: memberData.email || '',
      joinedAt: new Date()
    };
    this.members.push(member);
    this.updatedAt = new Date();
    return member;
  }

  removeMember(memberId) {
    const memberIndex = this.members.findIndex(m => m.id === memberId);
    if (memberIndex === -1) {
      throw new Error('Member not found');
    }
    
    // Check if member has any expenses
    const memberExpenses = expenses.filter(expense => 
      expense.groupId === this.id && 
      (expense.paidBy === memberId || expense.splitBetween.some(split => split.memberId === memberId))
    );
    
    if (memberExpenses.length > 0) {
      throw new Error('Cannot remove member with existing expenses');
    }
    
    this.members.splice(memberIndex, 1);
    this.updatedAt = new Date();
    return true;
  }

  getMember(memberId) {
    return this.members.find(m => m.id === memberId);
  }

  getMemberByEmail(email) {
    return this.members.find(m => m.email === email);
  }

  getMemberByIdOrEmail(identifier) {
    return this.members.find(m => m.id === identifier || m.email === identifier);
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      members: this.members,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

// Group operations
const GroupModel = {
  create(groupData) {
    const group = new Group(groupData.name, groupData.description);
    groups.push(group);
    return group;
  },

  findAll() {
    return groups.map(group => group.toJSON());
  },

  findById(groupId) {
    const group = groups.find(g => g.id === groupId);
    return group ? group.toJSON() : null;
  },

  findInstanceById(groupId) {
    return groups.find(g => g.id === groupId);
  },

  update(groupId, updateData) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return null;

    if (updateData.name) group.name = updateData.name;
    if (updateData.description !== undefined) group.description = updateData.description;
    group.updatedAt = new Date();

    return group.toJSON();
  },

  delete(groupId) {
    const groupIndex = groups.findIndex(g => g.id === groupId);
    if (groupIndex === -1) return false;

    // Remove all expenses for this group
    expenses = expenses.filter(expense => expense.groupId !== groupId);
    
    groups.splice(groupIndex, 1);
    return true;
  },

  // Get all data (for testing/debugging)
  getAllData() {
    return {
      groups: groups.map(g => g.toJSON()),
      expenses: expenses
    };
  },

  // Clear all data (for testing)
  clearAll() {
    groups = [];
    expenses = [];
  }
};

module.exports = { GroupModel, Group };