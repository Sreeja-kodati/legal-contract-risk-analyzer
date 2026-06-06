const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'contracts.db');
const dbDir = path.dirname(dbPath);
try {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('[Database] Created database directory at:', dbDir);
  }
} catch (error) {
  console.error('[Database] Failed to create database directory:', error.message);
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[Database] SQLite Database connection error:', err.message);
  } else {
    console.log('[Database] SQLite Database opened successfully at:', dbPath);
  }
});

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db.run(
      `CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        riskScore REAL,
        riskLevel TEXT,
        summary TEXT,
        redFlags TEXT,
        recommendations TEXT,
        createdAt TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      }
    );
  });
}

function saveAnalysis({ filename, riskScore, riskLevel, summary, redFlags, recommendations }) {
  return new Promise((resolve, reject) => {
    const createdAt = new Date().toISOString();
    const query = `INSERT INTO contracts (filename, riskScore, riskLevel, summary, redFlags, recommendations, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(
      query,
      [filename, riskScore, riskLevel, summary, redFlags, recommendations, createdAt],
      function (err) {
        if (err) {
          return reject(err);
        }
        resolve({ id: this.lastID, filename, riskScore, riskLevel, summary, redFlags, recommendations, createdAt });
      }
    );
  });
}

function getHistory() {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM contracts ORDER BY createdAt DESC`, (err, rows) => {
      if (err) {
        return reject(err);
      }
      resolve(rows);
    });
  });
}

function getAnalysisById(id) {
  return new Promise((resolve, reject) => {
    db.get(`SELECT * FROM contracts WHERE id = ?`, [id], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

module.exports = {
  initializeDatabase,
  saveAnalysis,
  getHistory,
  getAnalysisById,
};
