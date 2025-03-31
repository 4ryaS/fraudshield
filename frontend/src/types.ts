export interface Transaction {
  step: number;
  type: 'PAYMENT' | 'TRANSFER' | 'CASH_OUT' | 'DEBIT' | 'CASH_IN';
  amount: number;
  nameOrig: string;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  nameDest: string;
  oldbalanceDest: number;
  newbalanceDest: number;
  isFraud: boolean;
  isFlaggedFraud: boolean;
  timestamp?: string; // We'll add this for display purposes
}

export interface User {
  id: string;
  name: string;
  role: 'employee' | 'admin';
}

export interface FraudCase extends Transaction {
  caseId: string;
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'investigating';
  reviewedBy?: string;
  reviewedAt?: string;
  riskLevel: 'high' | 'medium' | 'low';
  aiInsights?: string[];
}