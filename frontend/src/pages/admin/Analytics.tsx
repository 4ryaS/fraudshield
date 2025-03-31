import React from 'react';
import { Calendar, Filter } from 'lucide-react';

export function Analytics() {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Calendar className="h-4 w-4 mr-2" />
              Date Range
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>
          <select className="border border-gray-300 rounded-lg text-sm text-gray-700 px-4 py-2">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Custom range</option>
          </select>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fraud Detection Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Fraud Detection Rate</h3>
          <div className="mt-2">
            <div className="flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">98.7%</p>
              <p className="ml-2 text-sm text-green-600">↑ 2.1%</p>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Compared to previous period
            </p>
          </div>
        </div>

        {/* False Positive Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">False Positive Rate</h3>
          <div className="mt-2">
            <div className="flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">1.3%</p>
              <p className="ml-2 text-sm text-green-600">↓ 0.5%</p>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Improved accuracy from last month
            </p>
          </div>
        </div>

        {/* Average Response Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Average Response Time</h3>
          <div className="mt-2">
            <div className="flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">2.4h</p>
              <p className="ml-2 text-sm text-green-600">↓ 0.8h</p>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Time to resolve flagged cases
            </p>
          </div>
        </div>

        {/* Total Cases Processed */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900">Total Cases Processed</h3>
          <div className="mt-2">
            <div className="flex items-baseline">
              <p className="text-3xl font-semibold text-gray-900">1,247</p>
              <p className="ml-2 text-sm text-blue-600">↑ 12%</p>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              This month
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">Detection Breakdown</h2>
          <p className="mt-1 text-sm text-gray-600">
            Analysis of fraud detection patterns
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            {[
              { label: 'Transaction Amount Anomalies', value: '45%' },
              { label: 'Location-based Flags', value: '30%' },
              { label: 'Velocity Checks', value: '15%' },
              { label: 'Pattern Recognition', value: '10%' },
            ].map((item) => (
              <div key={item.label} className="px-6 py-4">
                <dt className="text-sm font-medium text-gray-900">{item.label}</dt>
                <dd className="mt-1 flex items-center">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: item.value }}
                    />
                  </div>
                  <span className="ml-4 text-sm text-gray-500">{item.value}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}