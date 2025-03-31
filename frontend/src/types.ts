export interface Transaction {
  step: number;
<<<<<<< HEAD
  type: string;
=======
  type: 'PAYMENT' | 'TRANSFER' | 'CASH_OUT' | 'DEBIT' | 'CASH_IN';
>>>>>>> 933d26ab9ab8ab8a4c1f6811ca1d5647cfa57738
  amount: number;
  nameOrig: string;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  nameDest: string;
  oldbalanceDest: number;
  newbalanceDest: number;
<<<<<<< HEAD
  isFraud: number;
  isFlaggedFraud: number;
}

export interface TransactionRequest {
  transaction: {
    amount: number;
    oldbalanceOrg: number;
    newbalanceOrig: number;
    oldbalanceDest: number;
    newbalanceDest: number;
    transaction_type: string;
  };
  behavioral: {
    avg_transaction_amount: number;
    max_transaction_amount: number;
    transaction_amount_std: number;
    avg_balance: number;
    transaction_count: number;
    large_transaction_ratio: number;
    balance_change_mean: number;
    type_CASH_OUT_ratio: number;
    type_DEBIT_ratio: number;
    type_PAYMENT_ratio: number;
    type_TRANSFER_ratio: number;
  };
}

interface DetectionResult {
  prediction: string;
  fraud_probability: number;
  model_name: string;
  details: Record<string, any>;
}

export interface ApiResponse {
  messages: string[];
  transaction: Record<string, any>;
  behavior: Record<string, any>;
  anomaly_detection: DetectionResult;
  behavioral_analysis: DetectionResult;
  transaction_monitoring: Record<string, any>;
  risk_scoring: DetectionResult;
  status: 'approved' | 'rejected' | 'review' | 'complete' | 'error' | 'pending' | 'processed';
  reason: string;
  step: string;
  error?: string;
=======
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
>>>>>>> 933d26ab9ab8ab8a4c1f6811ca1d5647cfa57738
}