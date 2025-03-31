from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
import pandas as pd
from typing import List, Dict, Optional, Union
import joblib
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Fraud Detection API",
    description="API endpoints for fraud detection models including Isolation Forest, XGBoost, LightGBM, and Behavioral Analysis",
    version="1.0.0"
)

# Hardcoded models directory
MODELS_DIR = "models"

# Dictionary to store loaded models and scalers
models = {}
scalers = {}

# Load models at startup
def load_models():
    try:
        print(f"Loading models from directory: {MODELS_DIR}")  # Debug log
        
        # Check if models directory exists
        if not os.path.exists(MODELS_DIR):
            raise ValueError(f"Models directory not found: {MODELS_DIR}")
            
        # List all files in models directory
        files = os.listdir(MODELS_DIR)
        print(f"Found files in models directory: {files}")  # Debug log
        
        # Load all model files from the models directory
        for file in files:
            if file.endswith('.pth'):
                model_name = file.replace("_agent.pth", "").replace(".pth", "")
                file_path = os.path.join(MODELS_DIR, file)
                print(f"Loading {model_name} from {file_path}")  # Debug log
                
                if "scaler" in model_name:
                    scalers[model_name] = joblib.load(file_path)
                    print(f"Loaded scaler: {model_name}")  # Debug log
                else:
                    models[model_name] = joblib.load(file_path)
                    print(f"Loaded model: {model_name}")  # Debug log
        
        # Verify required models and scalers are loaded
        required_models = ["isolation_forest", "transaction_monitoring", "behavioral_analysis", "risk_scoring"]
        required_scalers = ["transaction_scaler", "behavior_scaler"]
        
        missing_models = [model for model in required_models if model not in models]
        missing_scalers = [scaler for scaler in required_scalers if scaler not in scalers]
        
        if missing_models or missing_scalers:
            raise ValueError(
                f"Missing required models: {missing_models}, "
                f"Missing required scalers: {missing_scalers}"
            )
        
        print("All models and scalers loaded successfully")
        print(f"Loaded models: {list(models.keys())}")
        print(f"Loaded scalers: {list(scalers.keys())}")
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise

# Define request models
class TransactionRequest(BaseModel):
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    transaction_type: Optional[str] = None  # Optional transaction type

class BehavioralRequest(BaseModel):
    avg_transaction_amount: float
    max_transaction_amount: float
    transaction_amount_std: float
    avg_balance: float
    transaction_count: int
    large_transaction_ratio: float
    balance_change_mean: float
    type_CASH_OUT_ratio: Optional[float] = 0.0
    type_DEBIT_ratio: Optional[float] = 0.0
    type_PAYMENT_ratio: Optional[float] = 0.0
    type_TRANSFER_ratio: Optional[float] = 0.0

class PredictionResponse(BaseModel):
    prediction: str
    fraud_probability: float
    model_name: str
    details: Dict[str, Union[float, str]]

# Helper function to prepare transaction data
def prepare_transaction_data(transaction: TransactionRequest):
    # Create DataFrame from request data
    df = pd.DataFrame({
        'amount': [transaction.amount],
        'oldbalanceOrg': [transaction.oldbalanceOrg],
        'newbalanceOrig': [transaction.newbalanceOrig],
        'oldbalanceDest': [transaction.oldbalanceDest],
        'newbalanceDest': [transaction.newbalanceDest]
    })
    
    # Add derived features
    df['balance_difference'] = df['oldbalanceOrg'] - df['newbalanceOrig']
    df['dest_balance_difference'] = df['oldbalanceDest'] - df['newbalanceDest']
    
    # Add large_transaction feature (using 10000 as a default threshold)
    df['large_transaction'] = (df['amount'] > 10000).astype(int)
    
    # Add transaction type columns if provided
    if transaction.transaction_type:
        # Initialize all type columns to 0
        transaction_types = ['CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER']
        for t_type in transaction_types:
            df[f'type_{t_type}'] = 0
        
        # Set the provided type to 1
        if transaction.transaction_type in transaction_types:
            df[f'type_{transaction.transaction_type}'] = 1
    
    return df

@app.on_event("startup")
async def startup_event():
    load_models()

@app.get("/")
async def root():
    return {
        "message": "Fraud Detection API",
        "available_endpoints": [
            "/predict/isolation_forest",
            "/predict/transaction",
            "/predict/risk_scoring",
            "/predict/behavioral"
        ]
    }

@app.post("/predict/isolation_forest", response_model=PredictionResponse)
async def predict_isolation_forest(transaction: TransactionRequest):
    try:
        print(f"Received transaction data: {transaction}")  # Debug log
        
        # Prepare features for Isolation Forest (needs all features for scaling)
        df = prepare_transaction_data(transaction)
        print(f"Prepared DataFrame: {df}")  # Debug log
        
        # Select features needed for Isolation Forest prediction
        iso_features = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
        
        # Get all features needed for scaling
        scaling_features = [
            'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest',
            'balance_difference', 'dest_balance_difference'
        ]
        
        # Scale all required features
        try:
            scaled_features = scalers["transaction_scaler"].transform(df[scaling_features])
            print(f"Scaled features shape: {scaled_features.shape}")  # Debug log
            
            # Select only the features needed for prediction after scaling
            scaled_features_df = pd.DataFrame(scaled_features, columns=scaling_features)
            prediction_features = scaled_features_df[iso_features]
            print(f"Prediction features: {prediction_features}")  # Debug log
        except Exception as e:
            print(f"Error during scaling: {str(e)}")  # Debug log
            raise
        
        # Check if model exists
        if "isolation_forest" not in models:
            raise ValueError("Isolation Forest model not found. Please ensure models are loaded correctly.")
            
        # Get anomaly score and prediction
        try:
            anomaly_score = models["isolation_forest"].decision_function(prediction_features)[0]
            prediction = models["isolation_forest"].predict(prediction_features)[0]
            print(f"Anomaly score: {anomaly_score}, Prediction: {prediction}")  # Debug log
        except Exception as e:
            print(f"Error during prediction: {str(e)}")  # Debug log
            raise
        
        # Isolation Forest returns -1 for anomalies and 1 for normal points
        is_fraud = prediction == -1
        
        return PredictionResponse(
            prediction="Fraudulent" if is_fraud else "Legitimate",
            fraud_probability=float(1 - (anomaly_score + 0.5)),  # Convert anomaly score to probability-like value
            model_name="Isolation Forest",
            details={
                "anomaly_score": float(anomaly_score),
                "is_anomaly": str(is_fraud)
            }
        )
    except Exception as e:
        print(f"Detailed error in predict_isolation_forest: {str(e)}")  # Debug log
        import traceback
        print(f"Traceback: {traceback.format_exc()}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/transaction", response_model=PredictionResponse)
async def predict_transaction(transaction: TransactionRequest):
    try:
        print(f"Received transaction data: {transaction}")  # Debug log
        
        # Prepare features for XGBoost
        df = prepare_transaction_data(transaction)
        print(f"Prepared DataFrame: {df}")  # Debug log
        
        # Get all columns that the XGBoost model was trained on
        required_columns = [
            'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest',
            'balance_difference', 'dest_balance_difference', 'large_transaction'
        ]
        
        # Add transaction type columns
        transaction_types = ['CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER']
        for t_type in transaction_types:
            df[f'type_{t_type}'] = 0.0  # Initialize all types to 0
        
        # Set the provided type to 1 if it exists
        if transaction.transaction_type in transaction_types:
            df[f'type_{transaction.transaction_type}'] = 1.0
        
        required_columns.extend([f'type_{t_type}' for t_type in transaction_types])
        print(f"Required columns: {required_columns}")  # Debug log
        
        # Scale numeric features
        numeric_features = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest', 
                           'balance_difference', 'dest_balance_difference']
        
        # Create a copy of the features for scaling
        features_df = df[required_columns].copy()
        features_df[numeric_features] = scalers["transaction_scaler"].transform(features_df[numeric_features])
        print(f"Scaled features shape: {features_df.shape}")  # Debug log
        
        # Get prediction probabilities
        fraud_prob = models["transaction_monitoring"].predict_proba(features_df)[0][1]
        
        return PredictionResponse(
            prediction="Fraudulent" if fraud_prob > 0.5 else "Legitimate",
            fraud_probability=float(fraud_prob),
            model_name="XGBoost Transaction Monitoring",
            details={
                "threshold": 0.5,
                "features_used": ", ".join(required_columns)
            }
        )
    except Exception as e:
        print(f"Error in predict_transaction: {str(e)}")  # Debug log
        import traceback
        print(f"Traceback: {traceback.format_exc()}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/risk_scoring", response_model=PredictionResponse)
async def predict_risk_scoring(transaction: TransactionRequest):
    try:
        print(f"Received transaction data: {transaction}")  # Debug log
        
        # Prepare features for LightGBM
        df = prepare_transaction_data(transaction)
        print(f"Prepared DataFrame: {df}")  # Debug log
        
        # Get all columns that the LightGBM model was trained on
        required_columns = [
            'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest',
            'balance_difference', 'dest_balance_difference', 'large_transaction'
        ]
        
        # Add transaction type columns
        transaction_types = ['CASH_OUT', 'DEBIT', 'PAYMENT', 'TRANSFER']
        for t_type in transaction_types:
            df[f'type_{t_type}'] = 0.0  # Initialize all types to 0
        
        # Set the provided type to 1 if it exists
        if transaction.transaction_type in transaction_types:
            df[f'type_{transaction.transaction_type}'] = 1.0
        
        required_columns.extend([f'type_{t_type}' for t_type in transaction_types])
        print(f"Required columns: {required_columns}")  # Debug log
        
        # Scale numeric features
        numeric_features = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest', 
                           'balance_difference', 'dest_balance_difference']
        
        # Create a copy of the features for scaling
        features_df = df[required_columns].copy()
        features_df[numeric_features] = scalers["transaction_scaler"].transform(features_df[numeric_features])
        print(f"Scaled features shape: {features_df.shape}")  # Debug log
        
        # Get prediction probabilities
        risk_prob = models["risk_scoring"].predict_proba(features_df)[0][1]
        
        # Adjust risk levels with more lenient thresholds
        risk_level = "High" if risk_prob > 0.85 else "Medium" if risk_prob > 0.6 else "Low"
        
        return PredictionResponse(
            prediction="High Risk" if risk_prob > 0.85 else "Low Risk",
            fraud_probability=float(risk_prob),
            model_name="LightGBM Risk Scoring",
            details={
                "risk_level": risk_level,
                "threshold": 0.85  # Updated threshold for high risk
            }
        )
    except Exception as e:
        print(f"Error in predict_risk_scoring: {str(e)}")  # Debug log
        import traceback
        print(f"Traceback: {traceback.format_exc()}")  # Debug log
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/predict/behavioral", response_model=PredictionResponse)
async def predict_behavioral(behavior: BehavioralRequest):
    try:
        # Convert behavioral features to DataFrame
        df = pd.DataFrame({
            'avg_transaction_amount': [behavior.avg_transaction_amount],
            'max_transaction_amount': [behavior.max_transaction_amount],
            'transaction_amount_std': [behavior.transaction_amount_std],
            'avg_balance': [behavior.avg_balance],
            'transaction_count': [behavior.transaction_count],
            'large_transaction_ratio': [behavior.large_transaction_ratio],
            'balance_change_mean': [behavior.balance_change_mean],
            'type_CASH_OUT_ratio': [behavior.type_CASH_OUT_ratio],
            'type_DEBIT_ratio': [behavior.type_DEBIT_ratio],
            'type_PAYMENT_ratio': [behavior.type_PAYMENT_ratio],
            'type_TRANSFER_ratio': [behavior.type_TRANSFER_ratio]
        })
        
        # Scale features
        scaled_features = scalers["behavior_scaler"].transform(df)
        
        # Get prediction probabilities
        behavior_prob = models["behavioral_analysis"].predict_proba(scaled_features)[0][1]
        
        return PredictionResponse(
            prediction="Suspicious Behavior" if behavior_prob > 0.5 else "Normal Behavior",
            fraud_probability=float(behavior_prob),
            model_name="Logistic Regression Behavioral Analysis",
            details={
                "behavior_profile": "Highly Suspicious" if behavior_prob > 0.8 else 
                                   "Moderately Suspicious" if behavior_prob > 0.5 else
                                   "Slightly Unusual" if behavior_prob > 0.3 else "Normal",
                "threshold": 0.5
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app, 
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000))
    )