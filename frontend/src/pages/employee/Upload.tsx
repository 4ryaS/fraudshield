import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload as UploadIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export function Upload() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Here we would process the CSV file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          // Skip header row and split into lines
          const lines = text.split('\n').slice(1);
          
          // Process each line
          const transactions = lines.map(line => {
            const [
              step,
              type,
              amount,
              nameOrig,
              oldbalanceOrg,
              newbalanceOrig,
              nameDest,
              oldbalanceDest,
              newbalanceDest,
              isFraud,
              isFlaggedFraud
            ] = line.split(',');

            return {
              step: parseInt(step),
              type,
              amount: parseFloat(amount),
              nameOrig,
              oldbalanceOrg: parseFloat(oldbalanceOrg),
              newbalanceOrig: parseFloat(newbalanceOrig),
              nameDest,
              oldbalanceDest: parseFloat(oldbalanceDest),
              newbalanceDest: parseFloat(newbalanceDest),
              isFraud: isFraud === '1',
              isFlaggedFraud: isFlaggedFraud === '1'
            };
          });

          // Here you would send the transactions to your backend
          console.log('Processed transactions:', transactions);
          toast.success(`Successfully processed ${transactions.length} transactions`);
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div
          {...getRootProps()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-500 transition-colors cursor-pointer"
        >
          <input {...getInputProps()} />
          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">
            {isDragActive
              ? 'Drop the CSV file here'
              : 'Drag and drop your CSV file here'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            or click to select a file from your computer
          </p>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">CSV Format Requirements</h3>
          <div className="mt-4 space-y-3 text-sm text-gray-600">
            <p>The CSV file must contain the following columns in order:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>step (number)</li>
              <li>type (PAYMENT, TRANSFER, CASH_OUT, etc.)</li>
              <li>amount (decimal number)</li>
              <li>nameOrig (origin account)</li>
              <li>oldbalanceOrg (decimal number)</li>
              <li>newbalanceOrig (decimal number)</li>
              <li>nameDest (destination account)</li>
              <li>oldbalanceDest (decimal number)</li>
              <li>newbalanceDest (decimal number)</li>
              <li>isFraud (0 or 1)</li>
              <li>isFlaggedFraud (0 or 1)</li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
              Example: 1,PAYMENT,9839.64,C1231006815,170136.0,160296.36,M1979787155,0.0,0.0,0,0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}