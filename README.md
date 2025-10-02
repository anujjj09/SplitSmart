# SplitSmart - Expense Splitting Web App 💰

Hey! This is my expense splitting web application that I built for managing shared expenses with friends/roommates. Got tired of manually calculating who owes what after group dinners and trips, so I decided to build something to automate it.

## 🌐 Live Demo

**Try it out**: https://glittering-cajeta-240d93.netlify.app/

**Backend API**: https://splitsmart-181t.onrender.com

## What it does

- Create groups for different friend circles or trips
- Add people to groups and track shared expenses
- Automatically calculates who owes what to whom
- Supports different splitting methods (equal splits, custom amounts)
- Export everything to CSV if needed
- Works on mobile and desktop

## Tech Stack I Used

- **Frontend**: React.js (my first time building something this big in React!)
- **Backend**: Node.js with Express
- **Data**: Just stored in memory for now (planning to add a database later)
- **Styling**: Plain CSS (didn't want to overcomplicate things)

## How to run this thing

1. Clone this repo and install everything:
   ```bash
   git clone <your-repo-url>
   cd SplitSmart
   npm run install-all
   ```

2. Start both frontend and backend:
   ```bash
   npm run dev
   ```

3. Open http://localhost:3000 and you're good to go!

## Testing

I wrote a simple bash script to test all the API endpoints:
```bash
./test-api.sh
```
It creates a test group, adds members, creates expenses, and cleans up - basically tests the whole flow automatically.

## Project Structure

```
SplitSmart/
├── backend/          # API server stuff
│   ├── controllers/  # Main logic
│   ├── routes/       # API endpoints
│   └── server.js     # Entry point
├── frontend/         # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
└── package.json      # Scripts to run everything
```

## Main Features

### Groups
- Create new expense groups
- Add/remove members
- Delete groups when done

### Expenses
- Add expenses with descriptions and amounts
- Choose who paid and how to split it
- Edit or delete expenses if you made mistakes
- Different categories (food, transport, entertainment, etc.)

### Balance Tracking
- See who owes money and to whom
- Get settlement suggestions (like "Alex should pay Rs.200 to Sarah")
- Export data to CSV for record keeping

## API Endpoints (if you're interested)

- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create new group
- `POST /api/groups/:id/members` - Add member to group
- `POST /api/groups/:id/expenses` - Add expense
- And more...

## Current Limitations

- Data is stored in memory, so it resets when you restart the server
- No user authentication (anyone can access any group)
- Pretty basic UI (but functional!)

## What I learned

- How to structure a full-stack web application
- React hooks and state management
- Building RESTful APIs with Express
- CSS for responsive design
- Git workflow and project organization

## Future improvements I'm thinking about

- Add a proper database (PostgreSQL maybe?)
- User authentication and personal accounts
- Better UI with some framework like Material-UI
- Real-time updates using WebSockets
- Mobile app using React Native

---

Built by a 3rd year CSE student at MAIT 🎓