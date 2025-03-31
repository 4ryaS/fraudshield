export interface Transaction {
  step: number;
  type: string;
  amount: number;
  nameOrig: string;
  oldbalanceOrg: number;
  newbalanceOrig: number;
  nameDest: string;
  oldbalanceDest: number;
  newbalanceDest: number;
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
}