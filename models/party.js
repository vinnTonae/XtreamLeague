const mongoose = require('mongoose')
const Schema = mongoose.Schema

const partySchema = new Schema({

    betType: { type: String, required: true },
    hostId: { type: String, required: true },
    event: { type: Number, required: true },
    amount: { type: Number, required: true },
    players: { type: [String], default: [], required: false },
    winners: { 
        first: { type: Number, default: 0, required: false },
        second: { type: Number, default: 0, required: false},
        third: { type: Number, default: 0, required: false }
     },
    betStatus: { 
        code: { type: Number, default: 100, required: false },
        message: { type: String, default: 'waiting for opponents', required: false }
     }

}, { timestamps: true })

const Party = new mongoose.model('partybets', partySchema)

module.exports = Party