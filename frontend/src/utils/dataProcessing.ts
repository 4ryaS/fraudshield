import { Transaction, TransactionRequest } from '../types';

export const calculateBehavioralMetrics = (transactions: Transaction[]): TransactionRequest['behavioral'] => {
  // Handle empty transactions array
  if (!transactions.length) {
    return {
      avg_transaction_amount: 0,
      max_transaction_amount: 0,
      transaction_amount_std: 0,
      avg_balance: 0,
      transaction_count: 0,
      large_transaction_ratio: 0,
      balance_change_mean: 0,
      type_CASH_OUT_ratio: 0,
      type_DEBIT_ratio: 0,
      type_PAYMENT_ratio: 0,
      type_TRANSFER_ratio: 0,
    };
  }

  const amounts = transactions.map(t => t.amount);
  const balances = transactions.map(t => t.oldbalanceOrg);
  const balanceChanges = transactions.map(t => t.newbalanceOrig - t.oldbalanceOrg);
  
  const typeCount = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalTransactions = transactions.length;
  
  return {
    avg_transaction_amount: mean(amounts),
    max_transaction_amount: Math.max(...amounts),
    transaction_amount_std: standardDeviation(amounts),
    avg_balance: mean(balances),
    transaction_count: totalTransactions,
    large_transaction_ratio: amounts.filter(a => a > mean(amounts)).length / totalTransactions,
    balance_change_mean: mean(balanceChanges),
    type_CASH_OUT_ratio: (typeCount['CASH_OUT'] || 0) / totalTransactions,
    type_DEBIT_ratio: (typeCount['DEBIT'] || 0) / totalTransactions,
    type_PAYMENT_ratio: (typeCount['PAYMENT'] || 0) / totalTransactions,
    type_TRANSFER_ratio: (typeCount['TRANSFER'] || 0) / totalTransactions,
  };
};

const mean = (arr: number[]): number => 
  arr.reduce((a, b) => a + b, 0) / arr.length;

const standardDeviation = (arr: number[]): number => {
  const avg = mean(arr);
  const squareDiffs = arr.map(value => Math.pow(value - avg, 2));
  return Math.sqrt(mean(squareDiffs));
};

export const prepareTransactionRequest = (
  transaction: Transaction,
  transactions: Transaction[]
): TransactionRequest => ({
  transaction: {
    amount: transaction.amount,
    oldbalanceOrg: transaction.oldbalanceOrg,
    newbalanceOrig: transaction.newbalanceOrig,
    oldbalanceDest: transaction.oldbalanceDest,
    newbalanceDest: transaction.newbalanceDest,
    transaction_type: transaction.type,
  },
  behavioral: calculateBehavioralMetrics(transactions),
});