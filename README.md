# SplitSmart MVP

A web application to easily share and split expenses among groups.

## Features

- Create and manage expense groups
- Add members to groups
- Track shared expenses with flexible splitting
- Real-time balance calculations
- Export data as CSV
- Responsive design

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express
- **Storage**: In-memory (for MVP)
- **Styling**: CSS3 with responsive design

## Quick Start

1. Install all dependencies:
   ```bash
   npm run install-all
   ```

2. Start development servers:
   ```bash
   npm run dev
   ```

3. Open your browser:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Project Structure

```
/splitsmart
  /backend          # Express.js server
  /frontend         # React.js client
  package.json      # Root package.json for scripts
```

## API Endpoints

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create a new group
- `GET /api/groups/:id` - Get group details
- `DELETE /api/groups/:id` - Delete a group

### Members
- `POST /api/groups/:groupId/members` - Add member to group
- `DELETE /api/groups/:groupId/members/:memberId` - Remove member

### Expenses
- `GET /api/groups/:groupId/expenses` - Get group expenses
- `POST /api/groups/:groupId/expenses` - Add new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Export
- `GET /api/groups/:groupId/export` - Export group data as CSV

## Development

This is an MVP with in-memory data storage. Data will be lost when the server restarts.

For production, consider:
- Database integration (PostgreSQL/MongoDB)
- User authentication
- Data persistence
- Advanced splitting algorithms