import React from 'react';
import { BarChart3, DollarSign, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-semibold text-gray-900">2,543</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">+12.5% from yesterday</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Processing Rate</p>
              <p className="text-2xl font-semibold text-gray-900">98.7%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">Normal operation</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Flagged Transactions</p>
              <p className="text-2xl font-semibold text-gray-900">1.2%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">Within normal range</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <p className="mt-1 text-sm text-gray-600">
            Overview of today's transaction activity
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Transaction #{Math.random().toString(36).substr(2, 9)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Processed {i} hour{i !== 1 ? 's' : ''} ago
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Success
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}