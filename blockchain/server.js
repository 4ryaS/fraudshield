const express = require('express');
const cors = require('cors');
const Blockchain = require('./blockchain');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const blockchain = new Blockchain();

// Add transaction endpoint (now automatically mines)
app.post('/add-transaction', async (req, res) => {
    const transaction = req.body;
    if (!transaction) {
        return res.status(400).send('Transaction data is required');
    }

    try {
        await blockchain.add_transaction(transaction);
        res.status(201).json({
            message: 'Transaction added and mined into a new block',
            latest_block: blockchain.chain[blockchain.chain.length - 1]
        });
    } catch (error) {
        res.status(500).send('Error processing transaction');
    }
});

// Get blockchain endpoint
app.get('/chain', (req, res) => {
    res.status(200).json(blockchain);
});

// Validate chain endpoint
app.get('/validate', (req, res) => {
    const isValid = blockchain.is_chain_valid();
    res.status(200).json({ isValid });
});

app.listen(PORT, () => {
    console.log(`Blockchain server running on http://localhost:${PORT}`);
});