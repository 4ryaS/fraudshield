from langchain.agents import Tool, AgentExecutor, LLMSingleActionAgent
from langchain.prompts import StringPromptTemplate
from langchain_groq import ChatGroq
from langchain.schema import AgentAction, AgentFinish, BaseMessage, HumanMessage, AIMessage
from langchain.chains import LLMChain
from langchain.agents import AgentOutputParser
from typing import List, Union, Dict, TypedDict, Annotated, Sequence
import requests
import json
from pydantic import BaseModel, Field
import os
from dotenv import load_dotenv
import time
from tenacity import retry, stop_after_attempt, wait_exponential
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from operator import itemgetter
import logging
import pandas as pd
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Groq LLM with retry logic
@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=4, max=10),
    reraise=True
)
def create_groq_llm():
    return ChatGroq(
        groq_api_key=os.getenv("GROQ_API_KEY"),
        model_name="llama-3.3-70b-versatile",
        temperature=0.1,
        max_tokens=1000,
        request_timeout=30
    )

# Initialize Groq LLM
llm = create_groq_llm()

# API endpoints
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:8000")

class TransactionData(BaseModel):
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    transaction_type: str = None
    
    def model_dump(self):
        # Convert to the format expected by the model
        data = {
            "amount": self.amount,
            "oldbalanceOrg": self.oldbalanceOrg,
            "newbalanceOrig": self.newbalanceOrig,
            "oldbalanceDest": self.oldbalanceDest,
            "newbalanceDest": self.newbalanceDest,
            "balance_difference": self.oldbalanceOrg - self.newbalanceOrig,
            "dest_balance_difference": self.oldbalanceDest - self.newbalanceDest,
            "large_transaction": 1.0 if self.amount > 10000 else 0.0,
            "type_CASH_OUT": 1.0 if self.transaction_type == "CASH_OUT" else 0.0,
            "type_DEBIT": 1.0 if self.transaction_type == "DEBIT" else 0.0,
            "type_PAYMENT": 1.0 if self.transaction_type == "PAYMENT" else 0.0,
            "type_TRANSFER": 1.0 if self.transaction_type == "TRANSFER" else 0.0
        }
        
        # Create DataFrame to ensure feature names match exactly
        df = pd.DataFrame([data])
        
        # Select only the features that the scaler expects (matching model_training.py)
        numeric_features = [
            'amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest',
            'balance_difference', 'dest_balance_difference'
        ]
        
        # Convert to dict with exact feature names
        result = df[numeric_features].to_dict('records')[0]
        
        # Add categorical features (matching model_training.py's one-hot encoding)
        for col in ['type_CASH_OUT', 'type_DEBIT', 'type_PAYMENT', 'type_TRANSFER']:
            result[col] = data[col]
            
        return result
    
    def get_isolation_forest_features(self):
        """Get features specifically for Isolation Forest model"""
        # Create DataFrame with only the features used by Isolation Forest
        iso_features = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 'oldbalanceDest', 'newbalanceDest']
        df = pd.DataFrame([{
            "amount": self.amount,
            "oldbalanceOrg": self.oldbalanceOrg,
            "newbalanceOrig": self.newbalanceOrig,
            "oldbalanceDest": self.oldbalanceDest,
            "newbalanceDest": self.newbalanceDest
        }])
        
        # Return the DataFrame directly to preserve feature names
        return df.to_dict('records')[0]

class BehavioralData(BaseModel):
    avg_transaction_amount: float
    max_transaction_amount: float
    transaction_amount_std: float
    avg_balance: float
    transaction_count: int
    large_transaction_ratio: float
    balance_change_mean: float
    type_CASH_OUT_ratio: float = 0.0
    type_DEBIT_ratio: float = 0.0
    type_PAYMENT_ratio: float = 0.0
    type_TRANSFER_ratio: float = 0.0
    
    def model_dump(self):
        # Convert to the format expected by the model (matching model_training.py's behavioral features)
        data = {
            "avg_transaction_amount": self.avg_transaction_amount,
            "max_transaction_amount": self.max_transaction_amount,
            "transaction_amount_std": self.transaction_amount_std,
            "avg_balance": self.avg_balance,
            "transaction_count": self.transaction_count,
            "large_transaction_ratio": self.large_transaction_ratio,
            "balance_change_mean": self.balance_change_mean,
            "type_CASH_OUT_ratio": self.type_CASH_OUT_ratio,
            "type_DEBIT_ratio": self.type_DEBIT_ratio,
            "type_PAYMENT_ratio": self.type_PAYMENT_ratio,
            "type_TRANSFER_ratio": self.type_TRANSFER_ratio
        }
        
        # Create DataFrame to ensure feature names match exactly
        df = pd.DataFrame([data])
        
        # Return the data in the exact format expected by the behavioral model
        return df.to_dict('records')[0]

# Define state
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], "The messages in the conversation"]
    transaction: Dict
    behavior: Dict
    anomaly_result: Dict
    behavioral_result: Dict
    transaction_result: Dict
    risk_result: Dict
    status: str
    reason: str
    step: str  # Track current step in the workflow
    error: str  # Track any errors that occur

# Tools for each agent with error handling
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def call_isolation_forest(transaction: TransactionData) -> Dict:
    try:
        response = requests.post(
            f"{API_BASE_URL}/predict/isolation_forest",
            json=transaction.get_isolation_forest_features(),  # Use specific features for Isolation Forest
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error in isolation forest: {str(e)}")
        raise

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def call_transaction_monitoring(transaction: TransactionData) -> Dict:
    try:
        response = requests.post(
            f"{API_BASE_URL}/predict/transaction",
            json=transaction.model_dump(),
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error in transaction monitoring: {str(e)}")
        raise

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def call_behavioral_analysis(behavior: BehavioralData) -> Dict:
    try:
        response = requests.post(
            f"{API_BASE_URL}/predict/behavioral",
            json=behavior.model_dump(),
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error in behavioral analysis: {str(e)}")
        raise

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def call_risk_scoring(transaction: TransactionData) -> Dict:
    try:
        response = requests.post(
            f"{API_BASE_URL}/predict/risk_scoring",
            json=transaction.model_dump(),
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"Error in risk scoring: {str(e)}")
        raise

# Create tools
tools = [
    Tool(
        name="isolation_forest",
        func=call_isolation_forest,
        description="Detects anomalies in transactions using Isolation Forest model"
    ),
    Tool(
        name="transaction_monitoring",
        func=call_transaction_monitoring,
        description="Monitors transactions using XGBoost model"
    ),
    Tool(
        name="behavioral_analysis",
        func=call_behavioral_analysis,
        description="Analyzes user behavior patterns"
    ),
    Tool(
        name="risk_scoring",
        func=call_risk_scoring,
        description="Assigns risk scores to transactions"
    )
]

# Agent functions with error handling and logging
def anomaly_detection(state: AgentState) -> AgentState:
    try:
        logger.info("Starting anomaly detection")
        state["step"] = "anomaly_detection"
        result = call_isolation_forest(TransactionData(**state["transaction"]))
        state["anomaly_result"] = result
        state["messages"].append(AIMessage(content=f"Anomaly detection result: {result}"))
        logger.info("Completed anomaly detection")
        return state
    except Exception as e:
        state["error"] = f"Error in anomaly detection: {str(e)}"
        logger.error(state["error"])
        return state

def behavioral_analysis(state: AgentState) -> AgentState:
    try:
        logger.info("Starting behavioral analysis")
        state["step"] = "behavioral_analysis"
        result = call_behavioral_analysis(BehavioralData(**state["behavior"]))
        state["behavioral_result"] = result
        state["messages"].append(AIMessage(content=f"Behavioral analysis result: {result}"))
        logger.info("Completed behavioral analysis")
        return state
    except Exception as e:
        state["error"] = f"Error in behavioral analysis: {str(e)}"
        logger.error(state["error"])
        return state

def transaction_monitoring(state: AgentState) -> AgentState:
    try:
        logger.info("Starting transaction monitoring")
        state["step"] = "transaction_monitoring"
        result = call_transaction_monitoring(TransactionData(**state["transaction"]))
        state["transaction_result"] = result
        state["messages"].append(AIMessage(content=f"Transaction monitoring result: {result}"))
        logger.info("Completed transaction monitoring")
        return state
    except Exception as e:
        state["error"] = f"Error in transaction monitoring: {str(e)}"
        logger.error(state["error"])
        return state

def risk_scoring(state: AgentState) -> AgentState:
    try:
        logger.info("Starting risk scoring")
        state["step"] = "risk_scoring"
        result = call_risk_scoring(TransactionData(**state["transaction"]))
        state["risk_result"] = result
        state["messages"].append(AIMessage(content=f"Risk scoring result: {result}"))
        logger.info("Completed risk scoring")
        return state
    except Exception as e:
        state["error"] = f"Error in risk scoring: {str(e)}"
        logger.error(state["error"])
        return state

def create_fraud_detection_graph() -> StateGraph:
    workflow = StateGraph(AgentState)
    
    # Add nodes
    workflow.add_node("anomaly_detection", anomaly_detection)
    workflow.add_node("behavioral_analysis", behavioral_analysis)
    workflow.add_node("transaction_monitoring", transaction_monitoring)
    workflow.add_node("risk_scoring", risk_scoring)
    
    # Define edge conditions with decision layer
    def route_after_anomaly(state: AgentState) -> str:
        if state.get("error"):
            return END
        
        anomaly_result = state["anomaly_result"]
        anomaly_prediction = anomaly_result["prediction"]
        anomaly_prob = anomaly_result["fraud_probability"]
        
        logger.info(f"Anomaly detection result: {anomaly_prediction} (probability: {anomaly_prob})")
        
        # Business rules for anomaly detection
        if anomaly_prediction == "Fraudulent" and anomaly_prob > 0.8:
            # High confidence fraud detection - go straight to risk scoring
            state["status"] = "rejected"
            state["reason"] = f"High confidence fraud detection (probability: {anomaly_prob:.2f})"
            return END
        elif anomaly_prediction == "Fraudulent":
            # Moderate confidence fraud - proceed to transaction monitoring
            return "transaction_monitoring"
        else:
            # No anomaly detected - check behavior
            return "behavioral_analysis"
    
    def route_after_behavioral(state: AgentState) -> str:
        if state.get("error"):
            return END
        
        behavioral_result = state["behavioral_result"]
        behavioral_prediction = behavioral_result["prediction"]
        behavioral_prob = behavioral_result["fraud_probability"]
        
        logger.info(f"Behavioral analysis result: {behavioral_prediction} (probability: {behavioral_prob})")
        
        # Business rules for behavioral analysis
        if behavioral_prediction == "Suspicious Behavior" and behavioral_prob > 0.8:
            # High confidence suspicious behavior - go straight to risk scoring
            return "risk_scoring"
        elif behavioral_prediction == "Suspicious Behavior":
            # Moderate confidence suspicious behavior - proceed to transaction monitoring
            return "transaction_monitoring"
        else:
            # No suspicious behavior detected
            state["status"] = "approved"
            state["reason"] = "No suspicious behavior detected"
            logger.info("Transaction approved - no suspicious behavior")
            return END
    
    def route_after_transaction(state: AgentState) -> str:
        if state.get("error"):
            return END
        
        transaction_result = state["transaction_result"]
        transaction_prediction = transaction_result["prediction"]
        transaction_prob = transaction_result["fraud_probability"]
        
        logger.info(f"Transaction monitoring result: {transaction_prediction} (probability: {transaction_prob})")
        
        # Business rules for transaction monitoring
        if transaction_prediction == "Fraudulent" and transaction_prob > 0.8:
            # High confidence fraud - go straight to risk scoring
            return "risk_scoring"
        elif transaction_prediction == "Fraudulent":
            # Moderate confidence fraud - proceed to risk scoring
            return "risk_scoring"
        else:
            # No fraud detected - proceed to risk scoring for final assessment
            return "risk_scoring"
    
    def route_after_risk(state: AgentState) -> str:
        if state.get("error"):
            return END
        
        risk_result = state["risk_result"]
        risk_prediction = risk_result["prediction"]
        risk_prob = risk_result["fraud_probability"]
        risk_level = risk_result["details"]["risk_level"]
        
        logger.info(f"Risk scoring result: {risk_prediction} (probability: {risk_prob}, level: {risk_level})")
        
        # Final decision based on risk scoring with more lenient thresholds
        if risk_level == "High" or (risk_prediction == "High Risk" and risk_prob > 0.85):
            state["status"] = "rejected"
            state["reason"] = f"High risk transaction (probability: {risk_prob:.2f}, level: {risk_level})"
        elif risk_level == "Medium" or (risk_prediction == "High Risk" and risk_prob > 0.6):
            state["status"] = "review"
            state["reason"] = f"Medium risk transaction (probability: {risk_prob:.2f}, level: {risk_level})"
        else:
            state["status"] = "approved"
            state["reason"] = f"Low risk transaction (probability: {risk_prob:.2f}, level: {risk_level})"
        
        return END
    
    # Add edges
    workflow.set_entry_point("anomaly_detection")
    workflow.add_conditional_edges(
        "anomaly_detection",
        route_after_anomaly,
        {
            "transaction_monitoring": "transaction_monitoring",
            "behavioral_analysis": "behavioral_analysis",
            END: END
        }
    )
    workflow.add_conditional_edges(
        "behavioral_analysis",
        route_after_behavioral,
        {
            "transaction_monitoring": "transaction_monitoring",
            "risk_scoring": "risk_scoring",
            END: END
        }
    )
    workflow.add_conditional_edges(
        "transaction_monitoring",
        route_after_transaction,
        {
            "risk_scoring": "risk_scoring",
            END: END
        }
    )
    workflow.add_edge("risk_scoring", END)
    
    return workflow.compile()

def process_transaction(transaction_data: TransactionData, behavioral_data: BehavioralData):
    try:
        # Initialize the graph
        graph = create_fraud_detection_graph()
        
        # Create initial state
        initial_state = {
            "messages": [HumanMessage(content="Starting fraud detection process")],
            "transaction": transaction_data.model_dump(),
            "behavior": behavioral_data.model_dump(),
            "anomaly_result": {},
            "behavioral_result": {},
            "transaction_result": {},
            "risk_result": {},
            "status": "pending",
            "reason": "",
            "step": "initialized",
            "error": ""
        }
        
        # Run the graph
        final_state = graph.invoke(initial_state)
        
        # Check for errors
        if final_state.get("error"):
            logger.error(f"Final state error: {final_state['error']}")
            return {
                "status": "error",
                "error": final_state["error"],
                "step": final_state["step"]
            }
        
        # Create the response with initial pending status
        response = {
            "anomaly_detection": final_state["anomaly_result"],
            "transaction_monitoring": final_state.get("transaction_result"),
            "behavioral_analysis": final_state.get("behavioral_result"),
            "risk_scoring": final_state["risk_result"],
            "status": "pending",  # Start with pending status
            "reason": final_state["reason"],
            "step": final_state["step"],
            "messages": [msg.content for msg in final_state["messages"]]
        }
        
        # Update status to processed after a short delay
        async def update_status():
            await asyncio.sleep(2)  # Wait for 2 seconds
            response["status"] = "processed"
        
        # Run the status update in the background
        asyncio.create_task(update_status())
        
        return response
    except Exception as e:
        logger.error(f"Error in process_transaction: {str(e)}")
        return {
            "status": "error",
            "error": str(e),
            "step": "process_transaction"
        }

# Export the process_transaction function for use by the API
__all__ = ['process_transaction', 'TransactionData', 'BehavioralData'] 