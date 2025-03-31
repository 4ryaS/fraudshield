import React from 'react';
import { X } from 'lucide-react';
import { ApiResponse } from '../types';

interface TransactionDetailsProps {
  response: ApiResponse;
  onClose: () => void;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ response, onClose }) => {
  const formatProbability = (prob: number) => `${(prob * 100).toFixed(2)}%`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Transaction Analysis Results</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status and Messages */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Status</h3>
            <div className="space-y-2">
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Current Status:</span>
                <span className={`font-medium px-3 py-1 rounded-full ${
                  response.status === 'approved' ? 'bg-green-100 text-green-800' :
                  response.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                </span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Current Step:</span>
                <span className="font-medium">{response.step}</span>
              </p>
            </div>
          </div>

          {/* Anomaly Detection */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Anomaly Detection</h3>
            <div className="space-y-3">
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Prediction:</span>
                <span className="font-medium">{response.anomaly_detection?.prediction}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Fraud Probability:</span>
                <span className="font-medium">{formatProbability(response.anomaly_detection?.fraud_probability)}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{response.anomaly_detection?.model_name}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Anomaly Score:</span>
                <span className="font-medium">{response.anomaly_detection?.details?.anomaly_score.toFixed(4)}</span>
              </p>
            </div>
          </div>

          {/* Behavioral Analysis */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Behavioral Analysis</h3>
            <div className="space-y-3">
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Prediction:</span>
                <span className="font-medium">{response.behavioral_analysis?.prediction}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Fraud Probability:</span>
                <span className="font-medium">{formatProbability(response.behavioral_analysis?.fraud_probability)}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{response.behavioral_analysis?.model_name}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Behavior Profile:</span>
                <span className="font-medium">{response.behavioral_analysis?.details?.behavior_profile}</span>
              </p>
            </div>
          </div>

          {/* Risk Scoring */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Risk Scoring</h3>
            <div className="space-y-3">
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Prediction:</span>
                <span className="font-medium">{response.risk_scoring?.prediction}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Fraud Probability:</span>
                <span className="font-medium">{formatProbability(response.risk_scoring?.fraud_probability)}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Model:</span>
                <span className="font-medium">{response.risk_scoring?.model_name}</span>
              </p>
              <p className="flex items-center justify-between">
                <span className="text-gray-600">Risk Level:</span>
                <span className="font-medium">{response.risk_scoring?.details?.risk_level}</span>
              </p>
            </div>
          </div>

          {/* Analysis Log */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Analysis Log</h3>
            <div className="bg-gray-50 rounded p-3 space-y-2">
              {response.messages.map((message, index) => (
                <p key={index} className="text-sm text-gray-600 font-mono">{message}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};