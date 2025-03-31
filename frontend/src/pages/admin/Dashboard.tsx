import React from 'react';
import { AlertTriangle, Shield, Users } from 'lucide-react';

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-50 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Cases</p>
              <p className="text-2xl font-semibold text-gray-900">24</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-red-600">4 high priority</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-50 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cases Resolved</p>
              <p className="text-2xl font-semibold text-gray-900">127</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">This month</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Investigators</p>
              <p className="text-2xl font-semibold text-gray-900">8</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-gray-600">Online now</div>
          </div>
        </div>
      </div>

      {/* High Priority Cases */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">High Priority Cases</h2>
          <p className="mt-1 text-sm text-gray-600">
            Cases requiring immediate attention
          </p>
        </div>
        <div className="border-t border-gray-200">
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Case #{Math.random().toString(36).substr(2, 9)}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Large transaction from unverified source
                    </p>
                  </div>
                  <button className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700">
                    Review Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}