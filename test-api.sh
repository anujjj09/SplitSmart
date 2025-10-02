#!/bin/bash

# SplitSmart MVP Test Script
# This script tests all the core API endpoints

API_BASE="http://localhost:5001/api"

echo "🧪 Testing SplitSmart MVP API"
echo "============================="

# Test 1: Health Check
echo "1. Testing health check..."
curl -s "$API_BASE/../health" | grep -q "OK" && echo "✅ Health check passed" || echo "❌ Health check failed"

# Test 2: Create a group
echo "2. Testing group creation..."
GROUP_RESPONSE=$(curl -s -X POST "$API_BASE/groups" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Group","description":"A test group for API testing"}')

GROUP_ID=$(echo $GROUP_RESPONSE | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"//')

if [ ! -z "$GROUP_ID" ]; then
  echo "✅ Group created with ID: $GROUP_ID"
else
  echo "❌ Group creation failed"
  exit 1
fi

# Test 3: Get all groups
echo "3. Testing get all groups..."
curl -s "$API_BASE/groups" | grep -q "$GROUP_ID" && echo "✅ Get all groups passed" || echo "❌ Get all groups failed"

# Test 4: Add members to group
echo "4. Testing add members..."
MEMBER1_RESPONSE=$(curl -s -X POST "$API_BASE/groups/$GROUP_ID/members" \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}')

MEMBER1_ID=$(echo $MEMBER1_RESPONSE | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"//')

MEMBER2_RESPONSE=$(curl -s -X POST "$API_BASE/groups/$GROUP_ID/members" \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob","email":"bob@example.com"}')

MEMBER2_ID=$(echo $MEMBER2_RESPONSE | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"//')

if [ ! -z "$MEMBER1_ID" ] && [ ! -z "$MEMBER2_ID" ]; then
  echo "✅ Members added: Alice ($MEMBER1_ID), Bob ($MEMBER2_ID)"
else
  echo "❌ Adding members failed"
  exit 1
fi

# Test 5: Create an expense
echo "5. Testing expense creation..."
EXPENSE_RESPONSE=$(curl -s -X POST "$API_BASE/groups/$GROUP_ID/expenses" \
  -H "Content-Type: application/json" \
  -d "{
    \"description\":\"Dinner at Restaurant\",
    \"amount\":60.00,
    \"category\":\"Food & Dining\",
    \"paidBy\":\"$MEMBER1_ID\",
    \"splitType\":\"equal\",
    \"splitBetween\":[
      {\"memberId\":\"$MEMBER1_ID\",\"amount\":30.00},
      {\"memberId\":\"$MEMBER2_ID\",\"amount\":30.00}
    ]
  }")

EXPENSE_ID=$(echo $EXPENSE_RESPONSE | grep -o '"id":"[^"]*"' | sed 's/"id":"//;s/"//')

if [ ! -z "$EXPENSE_ID" ]; then
  echo "✅ Expense created with ID: $EXPENSE_ID"
else
  echo "❌ Expense creation failed"
  exit 1
fi

# Test 6: Get group details with balances
echo "6. Testing group details and balances..."
GROUP_DETAILS=$(curl -s "$API_BASE/groups/$GROUP_ID")
echo $GROUP_DETAILS | grep -q "balances" && echo "✅ Group details with balances retrieved" || echo "❌ Group details failed"

# Test 7: Test CSV export
echo "7. Testing CSV export..."
curl -s "$API_BASE/groups/$GROUP_ID/export?type=expenses" | grep -q "Description" && echo "✅ CSV export works" || echo "❌ CSV export failed"

# Test 8: Delete expense
echo "8. Testing expense deletion..."
curl -s -X DELETE "$API_BASE/expenses/$EXPENSE_ID" | grep -q "success" && echo "✅ Expense deleted" || echo "❌ Expense deletion failed"

# Test 9: Remove member
echo "9. Testing member removal..."
curl -s -X DELETE "$API_BASE/groups/$GROUP_ID/members/$MEMBER2_ID" | grep -q "success" && echo "✅ Member removed" || echo "❌ Member removal failed"

# Test 10: Delete group
echo "10. Testing group deletion..."
curl -s -X DELETE "$API_BASE/groups/$GROUP_ID" | grep -q "success" && echo "✅ Group deleted" || echo "❌ Group deletion failed"

echo ""
echo "🎉 API Testing Complete!"
echo "========================"