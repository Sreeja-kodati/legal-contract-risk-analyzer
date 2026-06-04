#!/usr/bin/env node

/**
 * Verification script to check project structure and critical files
 * Usage: node verify-project.js
 */

const fs = require('fs');
const path = require('path');

const checks = {
  backend: {
    'server.js': 'Express app entry point',
    'package.json': 'Backend dependencies',
    'database/database.js': 'SQLite setup',
    'routes/uploadRoutes.js': 'Upload routes',
    'routes/ingestionRoutes.js': 'Ingestion routes',
    'routes/analysisRoutes.js': 'Analysis routes',
    'routes/compareRoutes.js': 'Compare routes',
    'routes/historyRoutes.js': 'History routes',
    'controllers/uploadController.js': 'Upload handler',
    'controllers/ingestionController.js': 'Ingestion handler',
    'controllers/analysisController.js': 'Analysis handler',
    'controllers/compareController.js': 'Compare handler',
    'controllers/historyController.js': 'History handler',
    'services/pdfService.js': 'PDF extraction',
    'services/chunkService.js': 'Text chunking',
    'services/embeddingService.js': 'Gemini embeddings',
    'services/pineconeService.js': 'Pinecone integration',
    'services/ragService.js': 'RAG retrieval',
    'services/analysisService.js': 'Gemini analysis',
    'services/reportService.js': 'PDF report generation',
  },
  frontend: {
    'package.json': 'Frontend dependencies',
    'vite.config.ts': 'Vite configuration',
    'tailwind.config.js': 'Tailwind configuration',
    'postcss.config.js': 'PostCSS configuration',
    'tsconfig.json': 'TypeScript configuration',
    'index.html': 'HTML entry point',
    'src/main.tsx': 'React app entry',
    'src/App.jsx': 'App component',
    'src/styles/index.css': 'Tailwind styles',
    'src/pages/Upload.jsx': 'Upload page',
    'src/pages/AskQuestions.jsx': 'Ask page',
    'src/pages/Dashboard.jsx': 'Dashboard page',
    'src/pages/CompareContracts.jsx': 'Compare page',
    'src/pages/History.jsx': 'History page',
  },
  root: {
    '.env': 'Environment variables',
    'README.md': 'Project documentation',
  },
};

let passed = 0;
let failed = 0;

console.log('\n📋 Legal Contract Risk Analyzer - Project Verification\n');
console.log('================================================\n');

function checkFile(dir, file) {
  const filePath = path.join(process.cwd(), dir, file);
  const exists = fs.existsSync(filePath);

  if (exists) {
    const stats = fs.statSync(filePath);
    const size = stats.size;
    console.log(`✅ ${dir}/${file} (${size} bytes)`);
    passed++;
  } else {
    console.log(`❌ ${dir}/${file} - MISSING`);
    failed++;
  }
}

console.log('🔧 Backend Files:');
Object.entries(checks.backend).forEach(([file, desc]) => {
  checkFile('backend', file);
});

console.log('\n🎨 Frontend Files:');
Object.entries(checks.frontend).forEach(([file, desc]) => {
  checkFile('frontend', file);
});

console.log('\n📦 Root Files:');
Object.entries(checks.root).forEach(([file, desc]) => {
  checkFile('.', file);
});

console.log('\n================================================');
console.log(`\n✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All critical files are in place!');
  console.log('\nNext steps:');
  console.log('  1. cd backend && npm install');
  console.log('  2. cd ../frontend && npm install');
  console.log('  3. Update .env with your API keys');
  console.log('  4. npm run dev (in each directory)');
  process.exit(0);
} else {
  console.log('\n⚠️  Some files are missing. Check the output above.');
  process.exit(1);
}
