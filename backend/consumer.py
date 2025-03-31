from kafka import KafkaConsumer
import json
from agents import process_transaction, TransactionData, BehavioralData
import logging
from typing import Dict, Any
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def dict_to_transaction_data(data: Dict[str, Any]) -> TransactionData:
    """Convert dictionary to TransactionData object"""
    return TransactionData(
        amount=data['amount'],
        oldbalanceOrg=data['oldbalanceOrg'],
        newbalanceOrig=data['newbalanceOrig'],
        oldbalanceDest=data['oldbalanceDest'],
        newbalanceDest=data['newbalanceDest'],
        transaction_type=data['transaction_type']
    )

def dict_to_behavioral_data(data: Dict[str, Any]) -> BehavioralData:
    """Convert dictionary to BehavioralData object"""
    return BehavioralData(
        avg_transaction_amount=data['avg_transaction_amount'],
        max_transaction_amount=data['max_transaction_amount'],
        transaction_amount_std=data['transaction_amount_std'],
        avg_balance=data['avg_balance'],
        transaction_count=data['transaction_count'],
        large_transaction_ratio=data['large_transaction_ratio'],
        balance_change_mean=data['balance_change_mean'],
        type_CASH_OUT_ratio=data['type_CASH_OUT_ratio'],
        type_DEBIT_ratio=data['type_DEBIT_ratio'],
        type_PAYMENT_ratio=data['type_PAYMENT_ratio'],
        type_TRANSFER_ratio=data['type_TRANSFER_ratio']
    )

def start_consumer():
    """Start the Kafka consumer"""
    try:
        # Create Kafka consumer
        consumer = KafkaConsumer(
            'transactions',
            bootstrap_servers=['localhost:9092'],
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='fraud_detection_group',
            value_deserializer=lambda x: json.loads(x.decode('utf-8'))
        )

        logger.info("Kafka consumer started. Waiting for messages...")

        # Process messages
        for message in consumer:
            try:
                data = message.value
                
                # Extract transaction and behavioral data
                transaction_data = dict_to_transaction_data(data['transaction'])
                behavioral_data = dict_to_behavioral_data(data['behavioral'])
                
                # Process the transaction
                result = process_transaction(transaction_data, behavioral_data)
                
                # Log the result
                logger.info(f"Processed transaction for account {message.key.decode('utf-8')}")
                logger.info(f"Result: {result}")
                
            except Exception as e:
                logger.error(f"Error processing message: {str(e)}")
                continue

    except Exception as e:
        logger.error(f"Error starting consumer: {str(e)}")
        raise

if __name__ == "__main__":
    start_consumer()
