<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Shield } from 'lucide-react';
import { Transaction, ApiResponse } from './types';
import { prepareTransactionRequest } from './utils/dataProcessing';
import { TransactionTable } from './components/TransactionTable';
import { DashboardStats } from './components/Dashboard';
import { TransactionDetails } from './components/TransactionDetails';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [results, setResults] = useState<Record<string, ApiResponse>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<ApiResponse | null>(null);

  useEffect(() => {
    const fetchCSV = async () => {
      try {
        const response = await fetch('/trimmed_dataset.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          transform: (value) => value.trim(),
          complete: (result) => {
            if (result.errors.length > 0) {
              console.error('CSV parsing errors:', result.errors);
              // Log the problematic rows
              result.errors.forEach(error => {
                if (error.row) {
                  console.error(`Error at row ${error.row}:`, {
                    error: error.message,
                    row: result.data[error.row - 1],
                    expectedFields: result.meta.fields
                  });
                }
              });
            }
            
            // Filter out any rows that don't have all required fields
            const validTransactions = result.data.filter((row: any) => {
              const requiredFields = ['step', 'type', 'amount', 'nameOrig', 'oldbalanceOrg', 
                                   'newbalanceOrig', 'nameDest', 'oldbalanceDest', 'newbalanceDest'];
              return requiredFields.every(field => row[field] !== undefined && row[field] !== null);
            });

            console.log(`Loaded ${validTransactions.length} valid transactions out of ${result.data.length} total rows`);
            setTransactions(validTransactions as Transaction[]);
            setLoading(false);
          },
          error: (error: Error) => {
            console.error('Error parsing CSV:', error);
            setError('Error parsing CSV file');
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading CSV:', error);
        setError('Failed to load CSV file. Please ensure the file exists in the public directory.');
        setLoading(false);
      }
    };

    fetchCSV();
  }, []);

  useEffect(() => {
    const checkTransactions = async () => {
      if (!transactions.length) return;

      const API_ENDPOINT = 'http://localhost:8001/process_transaction';

      for (const transaction of transactions) {
        const key = transaction.nameOrig + transaction.step;
        
        if (!results[key]) {
          try {
            const request = prepareTransactionRequest(
              transaction,
              transactions.slice(Math.max(0, transactions.indexOf(transaction) - 10))
            );

            console.log('Sending request:', JSON.stringify(request, null, 2));

            const response = await fetch(API_ENDPOINT, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(request),
            });

            if (!response.ok) {
              const errorText = await response.text();
              console.error('Error response:', errorText);
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Received response:', JSON.stringify(result, null, 2));
            
            // Set initial result with pending status
            setResults(prev => ({
              ...prev,
              [key]: result,
            }));

            // Update status to approved after 2 seconds
            setTimeout(() => {
              setResults(prev => ({
                ...prev,
                [key]: {
                  ...prev[key],
                  status: "approved"
                }
              }));
            }, 2000);

          } catch (error) {
            console.error('Error checking transaction:', error);
          }
        }
      }
    };

    // Initial delay of 20 seconds before starting requests
    const initialDelay = setTimeout(() => {
      checkTransactions();
      // Then check every 20 seconds
      const interval = setInterval(checkTransactions, 20000);
      return () => clearInterval(interval);
    }, 20000);

    return () => clearTimeout(initialDelay);
  }, [transactions, results]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading FraudShield...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Shield className="h-8 w-8 text-blue-500 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">FraudShield Dashboard</h1>
          </div>
        </div>

        <DashboardStats transactions={transactions} results={results} />
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          <TransactionTable 
            transactions={transactions.slice(0, 50)} 
            results={results}
            onSelectTransaction={setSelectedTransaction}
          />
        </div>
      </div>

      {selectedTransaction && (
        <TransactionDetails
          response={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}
    </div>
=======
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';

// Bank Employee Routes
import { Dashboard } from './pages/employee/Dashboard';
import { Upload } from './pages/employee/Upload';
import { History } from './pages/employee/History';

// Admin Routes
import { AdminDashboard } from './pages/admin/Dashboard';
import { FraudCases } from './pages/admin/FraudCases';
import { Analytics } from './pages/admin/Analytics';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Bank Employee Routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/history" element={<History />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/cases" element={<FraudCases />} />
          <Route path="/admin/analytics" element={<Analytics />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <Toaster position="top-right" />
    </BrowserRouter>
>>>>>>> 933d26ab9ab8ab8a4c1f6811ca1d5647cfa57738
  );
}

export default App;