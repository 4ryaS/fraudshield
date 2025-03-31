import React from 'react';
import { format } from 'date-fns';
import { Transaction, ApiResponse } from '../types';
import { AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  results: Record<string, ApiResponse>;
  onSelectTransaction: (response: ApiResponse) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  results,
  onSelectTransaction
}) => {
  const formatTime = (step: number) => {
    if (typeof step !== 'number' || step < 0) {
      return 'Invalid Time';
    }

    const hours = Math.floor(step / 60);
    const minutes = step % 60;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    
    return format(date, 'HH:mm');
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="px-6 py-3 text-left">Time</th>
            <th className="px-6 py-3 text-left">Type</th>
            <th className="px-6 py-3 text-right">Amount</th>
            <th className="px-6 py-3 text-left">From</th>
            <th className="px-6 py-3 text-left">To</th>
            <th className="px-6 py-3 text-left">Risk Level</th>
            <th className="px-6 py-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((transaction) => {
            const result = results[transaction.nameOrig + transaction.step];
            const isRisky = result?.status === 'rejected';
            
            return (
              <tr 
                key={`${transaction.nameOrig}-${transaction.step}`}
                className={`
                  ${isRisky ? 'bg-red-50' : 'hover:bg-gray-50'} 
                  transition-colors duration-150
                `}
              >
                <td className="px-6 py-4">
                  {result?.status === 'approved' && <CheckCircle className="text-green-500 h-5 w-5" />}
                  {result?.status === 'rejected' && <XCircle className="text-red-500 h-5 w-5" />}
                  {result?.status === 'review' && <AlertTriangle className="text-yellow-500 h-5 w-5" />}
                </td>
                <td className="px-6 py-4">
                  {formatTime(transaction.step)}
                </td>
                <td className="px-6 py-4">{transaction.type}</td>
                <td className="px-6 py-4 text-right">
                  ${transaction.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">{transaction.nameOrig}</td>
                <td className="px-6 py-4">{transaction.nameDest}</td>
                <td className="px-6 py-4">
                  <span className={`
                    px-2 py-1 rounded-full text-sm
                    ${isRisky ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                  `}>
                    {result?.status === 'complete' ? 'Complete' : result?.status || 'Processing'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {result && (
                    <button
                      onClick={() => onSelectTransaction(result)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                      title="View Details"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};