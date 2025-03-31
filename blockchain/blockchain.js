const Block = require('./block');

class Blockchain {
    constructor() {
        this.chain = [this.create_genesis_block()];
        this.difficulty = 2; // Lower difficulty for demo purposes
        this.pending_transactions = [];
    }

    create_genesis_block() {
        return new Block(0, Date.now().toString(), "Genesis Block", "0");
    }

    get_latest_block() {
        return this.chain[this.chain.length - 1];
    }

    async add_transaction(transaction) {
        this.pending_transactions.push(transaction);
        
        // Automatically mine a block after adding the transaction
        await this.mine_pending_transactions();
    }

    async mine_pending_transactions() {
        if (this.pending_transactions.length === 0) {
            console.log("No transactions to mine");
            return;
        }

        const new_block = new Block(
            this.chain.length,
            Date.now(),
            this.pending_transactions,
            this.get_latest_block().hash
        );

        new_block.mine_block(this.difficulty);
        this.chain.push(new_block);
        this.pending_transactions = [];
        console.log('Block successfully mined and added to chain');
        return new_block;
    }

    is_chain_valid() {
        for (let i = 1; i < this.chain.length; i++) {
            const current_block = this.chain[i];
            const previous_block = this.chain[i - 1];

            if (current_block.hash !== current_block.calculate_hash()) {
                return false;
            }
            
            if (current_block.previous_hash !== previous_block.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Blockchain;