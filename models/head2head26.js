const mongoose = require('mongoose')
const Schema = mongoose.Schema


const headSchema26 = new Schema({
      
     betType: { type: String, required: true },
      hostId: { type: String, required: true },
       event: { type: Number, required: true },
      amount: { type: Number, required: true },
  opponentId: { type: String, default: 'null', required: false },
      points: {
            host: { type: Number, default: 0, required: false },
        opponent: { type: Number, default: 0, required: false }
      },
      winner: {
          winnerId: { type: String, default: 'none', required: false },
         winAmount: { type: Number, default: 0, required: false }
      },
   betStatus: { 
            code: { type: Number, default: 100, required: false },
            message: { type: String, default: 'waiting for opponent', required: false }
    }

}, { timestamps: true })

const Head26 = new mongoose.model('h2hBets-25/2026', headSchema26)

module.exports = Head26