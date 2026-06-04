function buildLegalAnalysisPrompt(contractText, contractName = 'Contract') {
  if (typeof contractText !== 'string' || !contractText.trim()) {
    throw new Error('contractText must be a non-empty string');
  }

  return {
    prompt: `You are a legal contract analysis assistant. Analyze the provided contract text and produce a structured JSON report. Do not include any narrative outside the JSON object. Ensure the output is valid JSON.

Contract Name: ${contractName}

Contract Text:
${contractText}

Tasks:
1. Extract key clauses and identify their type.
2. Detect and classify risks in the contract.
3. Identify missing clauses that should typically be present.
4. Detect penalty provisions and explain their impact.
5. Analyze renewal terms and obligations.
6. Analyze termination provisions and potential issues.
7. Identify compliance gaps and regulatory exposure.
8. Provide clear recommendations to mitigate risk.

Required JSON structure:
{
  "contractName": string,
  "clauseExtraction": [
    {
      "clauseId": string,
      "clauseType": string,
      "clauseText": string,
      "summary": string
    }
  ],
  "riskDetection": [
    {
      "riskId": string,
      "riskCategory": string,
      "description": string,
      "severity": "low" | "medium" | "high",
      "recommendation": string
    }
  ],
  "missingClauses": [
    {
      "clauseType": string,
      "reason": string,
      "recommendation": string
    }
  ],
  "penaltyDetection": [
    {
      "penaltyId": string,
      "penaltyType": string,
      "description": string,
      "riskLevel": "low" | "medium" | "high",
      "recommendation": string
    }
  ],
  "renewalAnalysis": {
    "renewalType": string,
    "noticePeriod": string,
    "autoRenewalRisks": string,
    "recommendation": string
  },
  "terminationAnalysis": {
    "terminationTriggers": string,
    "noticeRequirements": string,
    "terminationRisks": string,
    "recommendation": string
  },
  "complianceGaps": [
    {
      "gapId": string,
      "description": string,
      "impact": string,
      "recommendation": string
    }
  ],
  "recommendations": [
    {
      "recommendationId": string,
      "area": string,
      "action": string,
      "priority": "low" | "medium" | "high"
    }
  ]
}`,
    metadata: {
      type: 'legalAnalysis',
      generatedAt: new Date().toISOString(),
    },
  };
}

module.exports = {
  buildLegalAnalysisPrompt,
};
