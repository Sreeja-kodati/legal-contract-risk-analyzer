# 🧪 Testing Checklist

## Pre-Flight Checks

- [ ] All npm dependencies installed (backend and frontend)
- [ ] `.env` file configured with API keys
- [ ] API keys are valid and have sufficient quota
- [ ] Project structure verified with `node verify-project.js`

---

## ✅ Backend Tests

### Server Startup
- [ ] Backend starts without errors: `npm run dev` in backend/
- [ ] Console shows: "Server listening on port 4000"
- [ ] Test health check: `curl http://localhost:4000/` returns `{"status":"ok"}`

### Database
- [ ] `backend/database/contracts.db` file created
- [ ] No database errors in console

### Route Wiring
- [ ] All routes mounted correctly (check server.js)
- [ ] Test each endpoint exists:
  - [ ] POST /upload
  - [ ] POST /ingest
  - [ ] POST /ask
  - [ ] POST /compare
  - [ ] GET /history

### Services
- [ ] Gemini API key validates (no "Missing GEMINI_API_KEY" error)
- [ ] Pinecone configuration validates (no "Missing Pinecone" error)

---

## ✅ Frontend Tests

### Build & Startup
- [ ] Frontend starts: `npm run dev` in frontend/
- [ ] Vite shows: "Local: http://localhost:5173"
- [ ] Browser opens to application
- [ ] No console errors on page load

### Page Navigation
- [ ] Dashboard page loads
- [ ] Upload page loads
- [ ] Ask Questions page loads
- [ ] Compare Contracts page loads
- [ ] History page loads
- [ ] NavBar shows all links working

### Styling
- [ ] Pages have Tailwind CSS styling
- [ ] Dashboard charts render (Recharts)
- [ ] Dark/light theme colors visible
- [ ] Responsive layout works

---

## ✅ Integration Tests

### Upload Workflow
- [ ] Navigate to Upload page
- [ ] Select a sample PDF file
- [ ] Click "Upload and Ingest"
- [ ] Progress bar shows during upload
- [ ] Success message appears
- [ ] File appears in `backend/uploads/`

### Ingestion
- [ ] PDF text extraction completes
- [ ] Embeddings generated (Gemini API called)
- [ ] Vectors stored in Pinecone
- [ ] Database history entry created

### Ask Questions
- [ ] Navigate to Ask Questions page
- [ ] Enter question: "What are the payment terms?"
- [ ] Click "Submit Question"
- [ ] Analysis returns with:
  - [ ] Risk Score (0-100)
  - [ ] Risk Level (low/medium/high)
  - [ ] Retrieved Sources
  - [ ] Red Flags
  - [ ] Summary
- [ ] Entry appears in History

### Dashboard
- [ ] Risk metrics display
- [ ] Charts render properly
- [ ] Responsive grid layout

### History
- [ ] Previous analyses appear in table
- [ ] Can filter by risk level
- [ ] Can search by name/summary
- [ ] Click to view details

### Compare Contracts
- [ ] Upload two PDF files
- [ ] Click "Compare Contracts"
- [ ] Comparison results appear
- [ ] Both contracts analyzed

---

## 🔴 Error Cases

### Error Handling
- [ ] Missing .env variables show clear error
- [ ] Invalid PDF file rejected with message
- [ ] Network timeout handled gracefully
- [ ] API errors show user-friendly messages
- [ ] Database errors logged but don't crash app

### Missing API Keys
- [ ] Test with empty GEMINI_API_KEY → error message
- [ ] Test with empty PINECONE_API_KEY → error message

### Invalid PDFs
- [ ] Non-PDF file rejected with error
- [ ] Empty PDF handled gracefully
- [ ] Corrupted PDF shows error message

---

## 🚀 Performance Tests

### Load Times
- [ ] Frontend loads in < 3 seconds
- [ ] Dashboard renders within 1 second
- [ ] API responses < 2 seconds (excluding AI processing)

### Concurrent Requests
- [ ] Upload file while asking questions
- [ ] Multiple questions in quick succession
- [ ] Compare while previous upload in progress

---

## 🔐 Security Tests

### Input Validation
- [ ] Empty question returns error
- [ ] Empty file returns error
- [ ] SQL injection attempt in search → no issues
- [ ] XSS attempt in history search → sanitized

### API Security
- [ ] CORS enabled (test with curl)
- [ ] No sensitive data in response bodies
- [ ] Error messages don't expose internals

---

## 📊 Data Flow Tests

### End-to-End
1. [ ] Upload contract A
2. [ ] Upload contract B
3. [ ] Ask question about A
4. [ ] Ask different question about B
5. [ ] Compare A and B
6. [ ] History shows all 5 operations
7. [ ] Dashboard shows aggregate stats

### Data Persistence
- [ ] Refresh page → history still visible
- [ ] Restart backend → history still exists
- [ ] Restart frontend → connections restore

---

## 🛠️ Debugging Tests

### Console Logs
- [ ] No red errors in browser console
- [ ] No red errors in backend console
- [ ] Request/response logged correctly

### Network Tab
- [ ] API requests show in DevTools Network tab
- [ ] Response payloads look correct
- [ ] Status codes are 200/201/400/500 as expected

---

## ✨ Feature Completeness

- [ ] Upload → Ingest → Ask works end-to-end
- [ ] Compare contracts functional
- [ ] History persistence working
- [ ] Dashboard displays real data
- [ ] All pages accessible
- [ ] Navigation working
- [ ] Responsive on mobile/tablet

---

## 🎯 Success Criteria

✅ **Pass if all tests under "✅" sections complete successfully**

⚠️ **Warning if any error handling tests fail**

❌ **Fail if any core integration test fails**

---

## 📝 Test Report Template

```
Date: ___________
Tester: ___________
Backend Status: PASS / FAIL / PARTIAL
Frontend Status: PASS / FAIL / PARTIAL
Integration Status: PASS / FAIL / PARTIAL

Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________

Notes:
_________________________________
```

---

## 🚀 Deployment Readiness

Only deploy if:
- [ ] All "✅" tests pass
- [ ] All "🔐" security tests pass
- [ ] All "📊" data flow tests pass
- [ ] No critical errors in logs
- [ ] Performance acceptable
