const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transactionSchema = new Schema({
    tranx_type: { type: String, required: true }, 
        userId: { type: String, required: true },
        amount: { type: Number, required: true },
        status: { type: String, required: true },         
      pplEmail: { type: String, required: true}

}, { timestamps: true })

const Transactions = new mongoose.model('transactions', transactionSchema)

module.exports = Transactions