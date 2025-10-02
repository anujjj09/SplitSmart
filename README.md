# SplitSmart - Expense Splitting Web App 💰

Hey! This is my expense splitting web application that I built for managing shared expenses with friends/roommates. Got tired of manually calculating who owes what after group dinners and trips, so I decided to build something to automate it.

## 🌐 Live Demo

**✨ Try it live**: https://glittering-cajeta-240d93.netlify.app/

The app is fully deployed and working! You can create groups, add expenses, and see real-time balance calculations.

## What it does

- **Create Groups**: Different friend circles, trips, or roommate arrangements
- **Manage Members**: Add people with names and emails  
- **Track Expenses**: Add expenses with descriptions, amounts, and categories
- **Smart Splitting**: Automatic equal splits or custom amount distribution
- **Balance Calculations**: See who owes what to whom with settlement suggestions
- **Export Data**: Download group data and settlements as CSV
- **Responsive Design**: Works perfectly on mobile and desktop

## Tech Stack I Used

- **Frontend**: React.js with modern hooks and responsive CSS
- **Backend**: Node.js with Express.js RESTful API
- **Deployment**: Netlify (frontend) + Render (backend) 
- **Data Storage**: In-memory with JSON structures (perfect for MVP)
- **Styling**: Custom CSS with modern design principles

## How to run locally

1. **Clone and install dependencies**:
   ```bash
   git clone https://github.com/anujjj09/SplitSmart.git
   cd SplitSmart
   npm run install-all
   ```

2. **Start the development servers**:
   ```bash
   npm run dev
   ```
   This starts both frontend (http://localhost:3000) and backend (http://localhost:5001)

3. **Test the API** (optional):
   ```bash
   chmod +x test-api.sh
   ./test-api.sh
   ```

## 📁 Project Structure

```
SplitSmart/
├── backend/              # Express.js API server
│   ├── controllers/      # Business logic
│   ├── routes/          # API endpoints  
│   ├── models/          # Data models
│   ├── utils/           # Helper functions
│   └── middleware/      # CORS, error handling
├── frontend/            # React.js application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Main app pages
│   │   ├── services/    # API integration
│   │   └── utils/       # Client-side helpers
│   └── public/          # Static assets
├── netlify.toml         # Frontend deployment config
└── package.json         # Root scripts and dependencies
```

## ✨ Key Features

### 👥 Group Management
- Create unlimited expense groups
- Add/remove members with email validation
- Delete groups when projects are complete

### 💰 Expense Tracking  
- Add expenses with detailed descriptions
- Multiple categories (Food, Transport, Entertainment, Bills, etc.)
- Flexible payment tracking (who paid what)
- Edit or delete expenses if mistakes happen

### 🧮 Smart Calculations
- Automatic equal splitting between members
- Custom amount distribution for complex splits
- Real-time balance updates
- Settlement optimization (minimize number of transactions)

### 📊 Balance & Reports
- Clear "who owes what to whom" breakdown
- Settlement suggestions with exact amounts
- Export functionality for record keeping
- CSV downloads for external tracking

## 🔧 API Endpoints

### Groups
- `GET /api/groups` - Fetch all groups
- `POST /api/groups` - Create new group  
- `GET /api/groups/:id` - Get specific group
- `DELETE /api/groups/:id` - Delete group

### Members  
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:groupId/members/:memberId` - Remove member

### Expenses
- `POST /api/groups/:id/expenses` - Create expense
- `PUT /api/groups/:groupId/expenses/:expenseId` - Update expense
- `DELETE /api/groups/:groupId/expenses/:expenseId` - Delete expense

### Analytics
- `GET /api/groups/:id/balances` - Get balance calculations
- `GET /api/groups/:id/csv` - Export group data

## 🚀 Deployment

The app is deployed using modern cloud platforms:

- **Frontend**: Netlify with automatic deployments from GitHub
- **Backend**: Render with environment-based configuration  
- **CORS**: Properly configured for cross-origin requests
- **Build Process**: Optimized with dependency resolution and caching

## 🎯 Current Capabilities

✅ **Fully Functional**: All core features working in production  
✅ **Responsive Design**: Mobile and desktop optimized  
✅ **Real-time Calculations**: Instant balance updates  
✅ **Data Export**: CSV download functionality  
✅ **Error Handling**: Comprehensive validation and error messages  
✅ **Modern UI**: Clean, intuitive user interface  

## 🔮 Future Enhancements I'm Planning

- **Database Integration**: PostgreSQL for persistent data storage
- **User Authentication**: Personal accounts and group privacy  
- **Enhanced UI**: Material Design or Chakra UI framework
- **Real-time Updates**: WebSocket integration for live collaboration
- **Mobile App**: React Native version for iOS/Android
- **Payment Integration**: Direct payment links (UPI, PayPal)
- **Expense Categories**: Custom categories and budget tracking
- **Notifications**: Email/SMS reminders for outstanding balances

## 💭 What I Learned Building This

- **Full-Stack Development**: End-to-end application architecture
- **React Ecosystem**: Hooks, state management, component patterns
- **RESTful API Design**: Proper HTTP methods and response structures  
- **Deployment Pipeline**: CI/CD with GitHub, Netlify, and Render
- **CORS Configuration**: Cross-origin security and troubleshooting
- **Responsive CSS**: Mobile-first design principles
- **Error Handling**: Both client and server-side validation
- **Version Control**: Git workflow and collaborative development

---

**Built with ❤️ by a 3rd year CSE student at MAIT** 🎓  
*This project represents my journey into modern web development and problem-solving through code.*