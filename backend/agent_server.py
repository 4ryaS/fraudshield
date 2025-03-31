from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional
from agents import TransactionData, BehavioralData, process_transaction
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Fraud Detection Agent API",
    description="API endpoint for the fraud detection agent that orchestrates multiple models",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define request models
class TransactionRequest(BaseModel):
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    transaction_type: Optional[str] = None

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

class AgentRequest(BaseModel):
    transaction: TransactionRequest
    behavioral: BehavioralRequest

@app.get("/")
async def root():
    return {
        "message": "Fraud Detection Agent API",
        "available_endpoints": [
            "/process_transaction"
        ]
    }

@app.post("/process_transaction")
async def process_transaction_endpoint(request: AgentRequest):
    try:
        # Convert request data to TransactionData and BehavioralData
        transaction_data = TransactionData(
            amount=request.transaction.amount,
            oldbalanceOrg=request.transaction.oldbalanceOrg,
            newbalanceOrig=request.transaction.newbalanceOrig,
            oldbalanceDest=request.transaction.oldbalanceDest,
            newbalanceDest=request.transaction.newbalanceDest,
            transaction_type=request.transaction.transaction_type
        )

        behavioral_data = BehavioralData(
            avg_transaction_amount=request.behavioral.avg_transaction_amount,
            max_transaction_amount=request.behavioral.max_transaction_amount,
            transaction_amount_std=request.behavioral.transaction_amount_std,
            avg_balance=request.behavioral.avg_balance,
            transaction_count=request.behavioral.transaction_count,
            large_transaction_ratio=request.behavioral.large_transaction_ratio,
            balance_change_mean=request.behavioral.balance_change_mean,
            type_CASH_OUT_ratio=request.behavioral.type_CASH_OUT_ratio,
            type_DEBIT_ratio=request.behavioral.type_DEBIT_ratio,
            type_PAYMENT_ratio=request.behavioral.type_PAYMENT_ratio,
            type_TRANSFER_ratio=request.behavioral.type_TRANSFER_ratio
        )

        # Process the transaction
        result = process_transaction(transaction_data, behavioral_data)
        
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing transaction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("AGENT_API_HOST", "0.0.0.0"),
        port=int(os.getenv("AGENT_API_PORT", 8001))
    ) 