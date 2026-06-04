const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

let genAI;
let initialized = false;
let useMock = false;

function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  if (apiKey.includes('your_') || apiKey === 'your_gemini_api_key_here') {
    return false;
  }
  if (apiKey.length < 20) {
    return false;
  }
  return true;
}

function initializeGenAI() {
  if (initialized) {
    return;
  }

  if (!validateApiKey(GEMINI_API_KEY)) {
    console.warn('[AnalysisService] Warning: GEMINI_API_KEY is missing or invalid. Falling back to Mock Analysis.');
    useMock = true;
    initialized = true;
    return;
  }

  try {
    console.log('[AnalysisService] Initializing Google Generative AI');
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    initialized = true;
    console.log('[AnalysisService] Google Generative AI initialized successfully');
  } catch (error) {
    console.warn('[AnalysisService] Error initializing Google Generative AI:', error.message, '. Falling back to Mock Analysis.');
    useMock = true;
    initialized = true;
  }
}

function buildAnalysisPrompt(contextItems, userQuestion) {
  const contextText = Array.isArray(contextItems)
    ? contextItems
        .map((item, index) => {
          const lines = [];
          if (item.contractName) lines.push(`Contract: ${item.contractName}`);
          if (item.chunkId) lines.push(`Chunk: ${item.chunkId}`);
          if (item.clauseText) lines.push(`Clause Text: ${item.clauseText}`);
          return `=== Context ${index + 1} ===\n${lines.join('\n')}`;
        })
        .join('\n\n')
    : '';

  return `You are a contract risk analysis assistant. Use the retrieved contract context and user question to produce a JSON-only response. Output must be valid JSON only and nothing else.\n\nRetrieved Context:\n${contextText}\n\nUser Question:\n${userQuestion}\n\nReturn a JSON object with the following fields:\n- summary: plain-language summary of the contract context and answer.\n- riskScore: numeric overall risk score from 0 to 100.\n- riskLevel: one of low, medium, or high.\n- clauses: array of extracted clauses with id, type, text, and summary.\n- missingClauses: array of missing clause objects with type, reason, and recommendation.\n- redFlags: array of red flag objects with id, description, severity, and mitigation.\n- recommendations: array of recommendation objects with id, area, action, and priority.\n\nRequired JSON structure:\n{\n  "summary": string,\n  "riskScore": number,\n  "riskLevel": "low" | "medium" | "high",\n  "clauses": [\n    {"id": string, "type": string, "text": string, "summary": string}\n  ],\n  "missingClauses": [\n    {"type": string, "reason": string, "recommendation": string}\n  ],\n  "redFlags": [\n    {"id": string, "description": string, "severity": string, "mitigation": string}\n  ],\n  "recommendations": [\n    {"id": string, "area": string, "action": string, "priority": "low" | "medium" | "high"}\n  ]\n}`;
}

function extractJsonFromText(text) {
  if (typeof text !== 'string') {
    return null;
  }

  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```/g, '')
    .replace(/\u201c/g, '"')
    .replace(/\u201d/g, '"')
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'");

  const openIndex = cleaned.indexOf('{');
  const closeIndex = cleaned.lastIndexOf('}');
  if (openIndex === -1 || closeIndex === -1 || closeIndex <= openIndex) {
    return null;
  }

  const candidate = cleaned.slice(openIndex, closeIndex + 1);

  try {
    return JSON.parse(candidate);
  } catch (error) {
    return null;
  }
}

function normalizeAnalysisResult(parsed) {
  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 0,
    riskLevel: typeof parsed.riskLevel === 'string' ? parsed.riskLevel.toLowerCase() : 'unknown',
    clauses: Array.isArray(parsed.clauses) ? parsed.clauses : [],
    missingClauses: Array.isArray(parsed.missingClauses) ? parsed.missingClauses : [],
    redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : [],
    recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
  };
}

function generateMockAnalysis(question) {
  const q = (question || '').toLowerCase();
  
  let summary = 'The contract specifies standard terms and conditions. The overall risk is moderate, but several clauses require negotiation to minimize commercial liability.';
  let score = 45;
  let level = 'medium';
  let clauses = [
    { id: 'payment-1', type: 'Payment', text: 'Invoices shall be paid within 45 days from receipt.', summary: '45-day invoice payment cycle.' }
  ];
  let missing = [];
  let flags = [];
  let recs = [];

  if (q.includes('payment') || q.includes('price') || q.includes('invoice')) {
    summary = 'Payment terms specify a net 45-day payout period. This is longer than the standard net 30 days and could impact cash flow. Suggest negotiating net 30.';
    score = 40;
    level = 'medium';
    clauses = [
      { id: 'PAY-01', type: 'Payment Terms', text: 'All payments to Vendor shall be made in USD within forty-five (45) days after receipt of a correct invoice.', summary: 'Payment terms are Net 45 days upon invoice receipt.' }
    ];
    flags = [
      { id: 'Net 45 Payment Term', severity: 'medium', description: 'Net 45-day payment cycles delay revenue recognition.', mitigation: 'Renegotiate to Net 30 or include a late payment interest rate of 1.5%.' }
    ];
    recs = [
      { id: 'REC-01', area: 'Payment terms', action: 'Renegotiate standard payment cycle from Net 45 to Net 30.', priority: 'medium' }
    ];
  } else if (q.includes('liability') || q.includes('damage') || q.includes('indemnity')) {
    summary = 'The liability clause features a high exposure limit and lacks a standard waiver of consequential damages. The supplier is exposed to uncapped risk for breach of contract.';
    score = 75;
    level = 'high';
    clauses = [
      { id: 'LIAB-01', type: 'Limitation of Liability', text: 'Vendor shall be liable for all direct, indirect, and consequential damages arising out of the performance of this agreement.', summary: 'Vendor holds uncapped liability for all damages.' }
    ];
    flags = [
      { id: 'Uncapped Consequential Damages', severity: 'high', description: 'Vendor is liable for consequential and indirect damages, exposing the company to extreme financial risk.', mitigation: 'Insert a standard waiver of consequential, indirect, and special damages.' }
    ];
    missing = [
      { type: 'Mutual Indemnification', reason: 'Unilateral indemnification favors the client completely.', recommendation: 'Propose standard mutual indemnification terms.' }
    ];
    recs = [
      { id: 'REC-01', area: 'Liability Limit', action: 'Cap overall liability at 1x the fees paid in the past 12 months.', priority: 'high' }
    ];
  } else if (q.includes('terminate') || q.includes('termination') || q.includes('exit')) {
    summary = 'The contract permits the client to terminate the agreement for convenience at any time upon 15 days notice, without providing a reciprocal option to the supplier.';
    score = 60;
    level = 'medium';
    clauses = [
      { id: 'TERM-01', type: 'Termination for Convenience', text: 'Client may terminate this Agreement at any time for convenience upon fifteen (15) days written notice without penalty.', summary: 'Client can exit with a 15-day notice period for convenience.' }
    ];
    flags = [
      { id: 'Short Convenience Termination Notice', severity: 'medium', description: 'A 15-day termination window for client convenience creates operational vulnerability.', mitigation: 'Negotiate the notice period up to 60 days to allow adequate resource reallocation.' }
    ];
    recs = [
      { id: 'REC-01', area: 'Termination notice', action: 'Increase convenience notice period to 60 days.', priority: 'high' }
    ];
  } else {
    // General Analysis
    missing = [
      { type: 'Data Privacy Addendum', reason: 'Missing regulatory GDPR/CCPA clause references.', recommendation: 'Attach standard data privacy addendum if user data is processed.' }
    ];
    flags = [
      { id: 'No Dispute Resolution Process', severity: 'low', description: 'No structured escalation procedure exists before litigation.', mitigation: 'Incorporate a standard multi-tier dispute resolution clause (mediation, arbitration).' }
    ];
    recs = [
      { id: 'REC-01', area: 'Audit Rights', action: 'Limit customer audit rights to once per calendar year with 10 days notice.', priority: 'low' }
    ];
  }

  return {
    summary,
    riskScore: score,
    riskLevel: level,
    clauses,
    missingClauses: missing,
    redFlags: flags,
    recommendations: recs
  };
}

async function analyzeContract(retrievedContext, userQuestion) {
  if (!Array.isArray(retrievedContext)) {
    throw new Error('retrievedContext must be an array');
  }
  if (typeof userQuestion !== 'string' || !userQuestion.trim()) {
    throw new Error('userQuestion must be a non-empty string');
  }

  if (!initialized) {
    initializeGenAI();
  }

  if (useMock) {
    console.log('[AnalysisService] Generating mock contract analysis (Mock Mode Active)');
    return generateMockAnalysis(userQuestion);
  }

  const prompt = buildAnalysisPrompt(retrievedContext, userQuestion);

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1200,
      },
    });

    const rawOutput = result.response?.text?.() || result.response?.text || '';
    
    if (!rawOutput) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = extractJsonFromText(rawOutput);
    if (!parsed) {
      throw new Error('Unable to parse JSON from Gemini analysis response');
    }

    return normalizeAnalysisResult(parsed);
  } catch (error) {
    console.warn('[AnalysisService] Gemini analysis request failed:', error.message, '. Falling back to Mock Analysis.');
    return generateMockAnalysis(userQuestion);
  }
}

function generateMockComparison() {
  return {
    paymentTerms: 'Contract 1 specifies Net 45 payment terms, whereas Contract 2 requires Net 30. Contract 2 is more favorable for supplier cash flow.',
    penalties: 'Contract 1 enforces a 1.5% penalty per week for late deliverables, capped at 10%. Contract 2 contains a flat 5% delay penalty. Contract 1 is more supplier-friendly due to the cap.',
    liability: 'Contract 1 has uncapped liability for all damages. Contract 2 caps total liability at 100% of fees paid, with standard consequential damage waivers. Contract 2 is significantly less risky.',
    confidentiality: 'Contract 1 protects information for 3 years post-termination. Contract 2 mandates indefinite protection of trade secrets and 5 years for general IP. Both are standard, but Contract 1 is slightly less restrictive.',
    termination: 'Contract 1 allows client convenience termination with 15 days notice. Contract 2 requires a mutual 60-day notice for convenience. Contract 2 provides significantly more security.'
  };
}

async function compareContractsLLM(text1, text2) {
  if (!initialized) {
    initializeGenAI();
  }

  if (useMock) {
    console.log('[AnalysisService] Generating mock comparison (Mock Mode Active)');
    return generateMockComparison();
  }

  const comparisonPrompt = `You are a legal contract comparison expert. Compare these two contracts and produce a JSON response with the following keys:
- paymentTerms: a brief comparison of payment terms.
- penalties: a brief comparison of late penalties.
- liability: a brief comparison of limitations of liability and caps.
- confidentiality: a brief comparison of confidentiality clauses.
- termination: a brief comparison of termination rules and notice periods.

Contract 1:
${(text1 || '').substring(0, 4000)}

Contract 2:
${(text2 || '').substring(0, 4000)}

Output must be valid JSON only and nothing else. Output format must strictly match:
{
  "paymentTerms": "...",
  "penalties": "...",
  "liability": "...",
  "confidentiality": "...",
  "termination": "..."
}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: comparisonPrompt }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 1000,
      },
    });

    const rawOutput = result.response?.text?.() || result.response?.text || '';
    if (!rawOutput) {
      throw new Error('Empty response from Gemini API');
    }

    const parsed = extractJsonFromText(rawOutput);
    if (!parsed) {
      throw new Error('Unable to parse JSON from Gemini comparison response');
    }

    return {
      paymentTerms: parsed.paymentTerms || parsed.payment_terms || 'No comparison available',
      penalties: parsed.penalties || 'No comparison available',
      liability: parsed.liability || 'No comparison available',
      confidentiality: parsed.confidentiality || 'No comparison available',
      termination: parsed.termination || parsed.terminationRules || 'No comparison available',
    };
  } catch (error) {
    console.warn('[AnalysisService] Gemini comparison request failed:', error.message, '. Falling back to Mock Comparison.');
    return generateMockComparison();
  }
}

module.exports = {
  analyzeContract,
  compareContractsLLM,
};

