import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Transaction, ApiResponse } from '../types';

interface DashboardStatsProps {
  transactions: Transaction[];
  results: Record<string, ApiResponse>;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ transactions, results }) => {
  const totalTransactions = transactions.length;
  const processedResults = Object.values(results);
  const rejectedCount = processedResults.filter(r => r.status === 'rejected').length;
  const approvedCount = processedResults.filter(r => r.status === 'approved').length;
  const reviewCount = processedResults.filter(r => r.status === 'review').length;

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total Transactions</p>
            <p className="text-2xl font-semibold">{totalTransactions}</p>
          </div>
          <Shield className="h-8 w-8 text-blue-500" />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Total Volume: ${totalAmount.toLocaleString()}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-semibold text-green-600">{approvedCount}</p>
          </div>
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          {((approvedCount / totalTransactions) * 100).toFixed(1)}% of total
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Under Review</p>
            <p className="text-2xl font-semibold text-yellow-600">{reviewCount}</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Requires manual verification
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Rejected</p>
            <p className="text-2xl font-semibold text-red-600">{rejectedCount}</p>
          </div>
          <AlertTriangle className="h-8 w-8 text-red-500" />
        </div>
        <p className="text-sm text-gray-400 mt-2">
          Potential fraud detected
        </p>
      </div>
    </div>
  );
};