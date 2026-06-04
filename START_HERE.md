# 🎯 START HERE

## Welcome to the Legal Contract Risk Analyzer!

This project is **100% complete and ready to run**. Follow the steps below to get started in **5 minutes**.

---

## ⚡ Quick Start (5 Steps)

### Step 1: Verify Project Structure (30 seconds)
```bash
# From project root
node verify-project.js
```
✅ Should show "All critical files are in place!"

---

### Step 2: Install Backend Dependencies (2 minutes)
```bash
cd backend
npm install
```
⏳ Wait for installation to complete...

---

### Step 3: Install Frontend Dependencies (2 minutes)
```bash
cd ../frontend
npm install
```
⏳ Wait for installation to complete...

---

### Step 4: Configure API Keys
Go back to project root and edit `.env`:

```env
GEMINI_API_KEY=<your-gemini-key>
PINECONE_API_KEY=<your-pinecone-key>
PINECONE_ENVIRONMENT=<your-environment>
```

**Don't have API keys?**
- Get Gemini key: https://ai.google.dev/
- Get Pinecone account: https://www.pinecone.io/

---

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Look for: "Server listening on port 4000"

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Look for: "Local: http://localhost:5173"

**Then open browser** to: http://localhost:5173

---

## ✅ What You Should See

### Frontend Loads
- Page title: "Legal Contract Risk Analyzer"
- Navigation bar with 5 links
- Dashboard with metrics

### Troubleshooting
- **Port already in use?** → Change PORT in .env
- **Modules not found?** → Run `npm install` again
- **API errors?** → Check .env keys are correct

---

## 🧪 Test the Workflow

### 1. Upload a Contract
1. Click **"Upload"** in navbar
2. Select any PDF file
3. Click **"Upload and Ingest"**
4. Wait for success message ✅

### 2. Ask a Question
1. Click **"Ask Questions"** in navbar
2. Type: "What are the payment terms?"
3. Click **"Submit Question"**
4. See analysis with risk score ✅

### 3. View Dashboard
1. Click **"Dashboard"** in navbar
2. See metrics, charts, and analysis ✅

### 4. Check History
1. Click **"History"** in navbar
2. See your uploaded contracts and questions ✅

### 5. Compare Contracts
1. Click **"Compare"** in navbar
2. Upload two PDFs
3. Click **"Compare Contracts"**
4. See comparison results ✅

---

## 📚 Documentation

After you're running:

| Document | When to Read |
|----------|--------------|
| **[INDEX.md](INDEX.md)** | Understand project structure |
| **[README.md](README.md)** | Full guide & API reference |
| **[TESTING.md](TESTING.md)** | Run test checklist |
| **[COMPLETION_REPORT.md](COMPLETION_REPORT.md)** | See what was built |

---

## 🆘 Common Issues

### Issue: "Port 4000 already in use"
```bash
# Change port in .env
PORT=5000

# Then restart backend
```

### Issue: "Cannot find module"
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

### Issue: "API connection failed"
```bash
# Check:
1. Backend is running (Port 4000)
2. API keys in .env are correct
3. Frontend is running (Port 5173)
```

### Issue: "Gemini API error"
```env
# Check key is valid
GEMINI_API_KEY=your_actual_key_here
# Not placeholder text
```

---

## ✨ Next Steps

After you have it running:

1. **Explore the Code**: Start with `backend/server.js`
2. **Read Full Docs**: See [README.md](README.md)
3. **Run Tests**: Follow [TESTING.md](TESTING.md)
4. **Deploy**: Reference production section in [README.md](README.md)
5. **Customize**: Modify prompts, styling, database

---

## 🎉 Success!

If all 5 steps above worked, you now have:

✅ Backend API running (Port 4000)
✅ Frontend app running (Port 5173)
✅ Database ready (contracts.db)
✅ All features functional
✅ Ready for testing

**Congrats! The application is fully functional.** 🚀

---

## 📞 Need More Help?

- **Project structure?** → See [INDEX.md](INDEX.md)
- **API reference?** → See [README.md](README.md#api-endpoints)
- **Running tests?** → See [TESTING.md](TESTING.md)
- **What was built?** → See [COMPLETION_REPORT.md](COMPLETION_REPORT.md)

---

## 🚀 You're Ready!

Everything is set up. Go to http://localhost:5173 and start uploading contracts!

**Happy analyzing!** 📋✨
