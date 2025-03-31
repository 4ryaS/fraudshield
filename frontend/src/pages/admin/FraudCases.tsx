import React from 'react';
import { Search, Filter } from 'lucide-react';
import type { FraudCase } from '../../types';

export function FraudCases() {
  // Mock data based on the CSV structure with additional fraud case fields
  const mockCases: FraudCase[] = [
    {
      caseId: 'CASE-001',
      step: 1,
      type: 'TRANSFER',
      amount: 181.0,
      nameOrig: 'C1305486145',
      oldbalanceOrg: 181.0,
      newbalanceOrig: 0.0,
      nameDest: 'C553264065',
      oldbalanceDest: 0.0,
      newbalanceDest: 0.0,
      isFraud: true,
      isFlaggedFraud: false,
      reviewStatus: 'pending',
      riskLevel: 'high',
      aiInsights: [
        'Unusual pattern: Account emptied completely',
        'Destination account has no prior history',
        'Multiple rapid small transfers detected'
      ]
    },
    // Add more mock cases as needed
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search cases..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
            <select className="border border-gray-300 rounded-lg text-sm text-gray-700 px-4 py-2">
              <option>All Risk Levels</option>
              <option>High Risk</option>
              <option>Medium Risk</option>
              <option>Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Case ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Origin Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockCases.map((fraudCase, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {fraudCase.caseId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fraudCase.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${fraudCase.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {fraudCase.nameOrig}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    fraudCase.riskLevel === 'high'
                      ? 'bg-red-100 text-red-800'
                      : fraudCase.riskLevel === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {fraudCase.riskLevel.charAt(0).toUpperCase() + fraudCase.riskLevel.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {fraudCase.reviewStatus.charAt(0).toUpperCase() + fraudCase.reviewStatus.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900">
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Case Details Modal would go here */}
    </div>
  );
}