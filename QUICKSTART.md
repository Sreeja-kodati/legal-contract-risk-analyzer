# 🚀 Quick Start Guide

## 1️⃣ Verify Project Structure

```bash
# From project root
node verify-project.js
```

This will check all critical files are in place.

---

## 2️⃣ Install Dependencies

### Backend
```bash
cd backend
npm install
```

**Expected packages:**
- express, cors, dotenv
- multer (file upload)
- pdf-parse (PDF text extraction)
- pdfkit (PDF report generation)
- sqlite3 (database)
- @pinecone-database/pinecone (vector search)
- axios, node-fetch (HTTP requests)

### Frontend
```bash
cd ../frontend
npm install
```

**Expected packages:**
- react, react-dom, react-router-dom
- vite, @vitejs/plugin-react
- tailwindcss, autoprefixer, postcss
- axios (HTTP client)
- recharts (charting library)

---

## 3️⃣ Configure Environment Variables

Edit `.env` in project root:

```env
# Backend
PORT=4000

# Get from https://ai.google.dev/
GEMINI_API_KEY=your_key_here
GEMINI_API_URL=https://api.gemini.google/v1/models/gemini-2.5-flash:generateText

# Get from https://app.pinecone.io/
PINECONE_API_KEY=your_key_here
PINECONE_ENVIRONMENT=your_env_here  # e.g., "gcp-starter"
PINECONE_INDEX_NAME=contracts

# Frontend
VITE_API_URL=http://localhost:4000
```

---

## 4️⃣ Start the Application

### Option A: Two Terminal Windows (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server running on http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Open http://localhost:5173 in browser
```

### Option B: Single Terminal (Requires npm-run-all)

```bash
npm install -g npm-run-all

# In project root (if you set it up as monorepo)
npm-run-all --parallel "cd backend && npm run dev" "cd frontend && npm run dev"
```

---

## 5️⃣ Test the Workflow

### Step 1: Upload a Contract
1. Go to **Upload** page
2. Select a PDF file
3. Click **Upload and Ingest**
4. Wait for completion message

### Step 2: Ask Questions
1. Go to **Ask Questions** page
2. Type: "What is the payment term?"
3. Click **Submit Question**
4. View analysis with risk score

### Step 3: View Dashboard
1. Go to **Dashboard**
2. View aggregate risk metrics
3. Check risk distribution, clause coverage

### Step 4: Browse History
1. Go to **History**
2. See all previous analyses
3. Filter by risk level or search

### Step 5: Compare Contracts
1. Go to **Compare**
2. Upload two PDF contracts
3. Click **Compare Contracts**
4. View comparative analysis

---

## 6️⃣ Production Deployment

### Build Frontend
```bash
cd frontend
npm run build
# Creates dist/ folder with optimized build
```

### Build Backend
Backend runs as-is with `npm start`

### Deploy to Cloud
Options:
- **Frontend**: Vercel, Netlify, AWS S3 + CloudFront
- **Backend**: Heroku, AWS EC2, DigitalOcean, Railway

---

## 🆘 Troubleshooting

### Backend won't start
```bash
# Check port is available
netstat -ano | findstr :4000

# Kill process on port 4000 if needed
taskkill /PID <PID> /F
```

### Vite proxy errors
- Verify backend is running
- Check CORS is enabled
- Restart vite dev server

### Gemini/Pinecone API errors
- Verify API keys in `.env`
- Check API rate limits
- Test connectivity: `curl https://api.gemini.google`

### Database errors
- Delete `backend/database/contracts.db` to reset
- Re-run backend to reinitialize
- Check write permissions in `backend/database/` folder

---

## 📊 Project Architecture

```
Frontend (Port 5173)
    ↓ (proxy to 4000)
Backend API (Port 4000)
    ↓
├─ SQLite Database (Local)
├─ Gemini API (Embeddings & Analysis)
└─ Pinecone (Vector Search)
```

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `backend/server.js` | Express app setup |
| `backend/routes/*.js` | API route definitions |
| `backend/services/*.js` | Business logic |
| `frontend/src/App.jsx` | React routing |
| `frontend/src/pages/*.jsx` | Page components |
| `.env` | Configuration |
| `README.md` | Full documentation |

---

## ✅ Success Indicators

- ✅ Backend starts: "Server listening on port 4000"
- ✅ Frontend starts: Vite shows "Local: http://localhost:5173"
- ✅ Pages load: Upload, Dashboard, Ask, Compare, History
- ✅ Upload works: PDF uploads without error
- ✅ Ask works: Question returns analysis with risk score

---

## 🎯 Next Steps

1. **Add Sample Contracts** - Upload real contract PDFs
2. **Test Comparisons** - Upload two contracts and compare
3. **Customize Prompts** - Edit `backend/services/prompts.js`
4. **Tune Risk Scoring** - Adjust thresholds in analysis service
5. **Add Authentication** - Implement user login
6. **Deploy** - Push to cloud platform

---

**Need help?** Check README.md for full API documentation and detailed troubleshooting guide.
