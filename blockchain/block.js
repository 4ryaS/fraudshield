const crypto = require('crypto');

class Block {
    constructor(index, timestamp, transactions, previous_hash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previous_hash = previous_hash;
        this.nonce = 0;
        this.hash = this.calculate_hash();
    }

    calculate_hash() {
        return crypto.createHash('sha256').update(
            this.index + this.previous_hash + this.timestamp + JSON.stringify(this.transactions) + this.nonce
        ).digest('hex');
    }

    mine_block(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculate_hash();
        }
        console.log(`Block mined: ${this.hash}`);
    }
}

module.exports = Block;