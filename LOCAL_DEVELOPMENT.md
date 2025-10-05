# Local Development Setup

## Quick Start

### 1. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
Backend will run on: http://localhost:5001

### 2. Start Frontend Server (in a new terminal)
```bash
cd frontend
npm install
PORT=3001 npm start
```
Frontend will run on: http://localhost:3001

### 3. Test the API
```bash
# Test health endpoint
curl http://localhost:5001/health

# Test groups endpoint
curl http://localhost:5001/api/groups
```

## Environment Variables

### Backend (.env file in backend/)
```
PORT=5001
NODE_ENV=development
```

### Frontend (.env file in frontend/)
```
REACT_APP_API_URL=http://localhost:5001/api
PORT=3001
```

## Common Issues & Solutions

### Issue: Backend not starting
**Solution:** Make sure you're in the backend directory and run:
```bash
cd backend
npm install
npm run dev
```

### Issue: Frontend can't connect to backend
**Solution:** Ensure backend is running on port 5001 and check REACT_APP_API_URL in frontend/.env

### Issue: Port conflicts
**Solution:** Kill existing processes:
```bash
# Kill process on port 5001
lsof -ti:5001 | xargs kill -9

# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

### Issue: CORS errors
**Solution:** The backend is already configured for CORS. Make sure you're using the correct ports.

## Testing the Full Stack

1. Create a new group via the frontend
2. Add members to the group
3. Add expenses
4. Check balance calculations

## API Testing Script

Run the test script to verify everything works:
```bash
chmod +x test-api.sh
./test-api.sh
```

This will test all API endpoints automatically.