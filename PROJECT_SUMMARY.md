# SplitSmart - My Web Development Project 🚀

## About This Project

This is a web application I built during my 3rd year at MAIT for splitting expenses among friends. The idea came when me and my roommates were constantly arguing about who owes what after ordering food or going out together. Instead of using existing apps (which are either too complicated or cost money), I decided to build my own!

## What I Built

### Frontend (React.js)
- First time building something substantial in React
- Learned about hooks, state management, and component structure
- Made it responsive so it works on phones too
- Used plain CSS instead of frameworks to understand the basics better

### Backend (Node.js + Express)
- Built my first proper REST API
- Implemented CRUD operations for groups, members, and expenses
- Added data validation and error handling
- Used in-memory storage (planning to add database later)

## Key Features

### Core Functionality
1. **Group Management**: Create groups for different friend circles, trips, or roommate situations
2. **Member Management**: Add friends to groups, handle duplicate names
3. **Expense Tracking**: Record who paid for what and how much
4. **Smart Splitting**: Equal splits or custom amounts per person
5. **Balance Calculation**: Automatically figures out who owes what
6. **Export Feature**: Download data as CSV for record keeping

### Technical Implementation
- **Frontend**: React with functional components and hooks
- **Backend**: Express.js with modular route structure
- **Data Storage**: In-memory arrays and objects (temporary solution)
- **API Design**: RESTful endpoints with proper HTTP status codes
- **Validation**: Both client-side and server-side validation
- **Error Handling**: User-friendly error messages and fallbacks

## Challenges I Faced

1. **State Management**: Figuring out when to use useState vs useEffect
2. **API Integration**: Connecting frontend and backend properly
3. **Balance Calculation**: Writing the algorithm to determine settlements
4. **Responsive Design**: Making it look good on different screen sizes
5. **Error Handling**: Gracefully handling network failures and user errors

## What I Learned

### Technical Skills
- React.js fundamentals and modern patterns
- Building REST APIs with Express.js
- Frontend-backend communication
- CSS for responsive layouts
- Git workflow and version control
- Project structure and organization

### Problem-Solving
- Breaking down complex problems into smaller parts
- Debugging both frontend and backend issues
- User experience considerations
- Code organization and maintainability

## How to Run

```bash
# Clone the repo
git clone <repo-url>
cd SplitSmart

# Install dependencies for both frontend and backend
npm run install-all

# Start both servers
npm run dev

# Access the app at http://localhost:3000
```

## Project Structure

```
SplitSmart/
├── backend/
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   ├── models/         # Data structures
│   ├── middleware/     # Validation and error handling
│   └── server.js       # Main server file
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Main page components
│   │   ├── services/   # API calls
│   │   └── utils/      # Helper functions
│   └── public/         # Static files
└── package.json        # Root scripts
```

## Current Limitations

- **Data Persistence**: Everything resets when server restarts
- **User Authentication**: No login system yet
- **Real-time Updates**: No live updates when others add expenses
- **Advanced Features**: No receipt scanning, recurring expenses, etc.
- **Testing**: Haven't written proper tests yet (know I should!)

## Future Plans

### Short-term (Next semester)
- [ ] Add a proper database (thinking PostgreSQL)
- [ ] Implement user authentication and accounts
- [ ] Write unit tests for important functions
- [ ] Better error handling and loading states

### Long-term (After graduation)
- [ ] Real-time updates using WebSockets
- [ ] Mobile app using React Native
- [ ] Receipt scanning with OCR
- [ ] Integration with payment apps
- [ ] Deploy to cloud (AWS or Heroku)

## Demo & Screenshots

*[Planning to add screenshots and maybe a demo video]*

## Reflection

This project taught me a lot about full-stack development and gave me confidence to build complete web applications. The hardest part was probably figuring out the balance calculation algorithm and making sure the frontend and backend stay in sync.

I'm pretty proud of how it turned out, especially considering this is my first major React project. The code isn't perfect, but it works and I learned a ton in the process!

---

**Built by**: Anuj (3rd Year CSE, MAIT)  
**Technologies**: React.js, Node.js, Express.js, CSS3  
**Project Duration**: [Add your timeline]  
**GitHub**: [Your GitHub profile]