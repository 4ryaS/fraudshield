export interface FinancialTransaction {
    step: number;
    type: 'PAYMENT' | 'TRANSFER' | 'CASH_OUT' | 'DEBIT';
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