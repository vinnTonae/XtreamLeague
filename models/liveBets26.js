const mongoose = require('mongoose')

const Schema = mongoose.Schema

const live26 = new Schema({

     userId: { type: String, required: true },
       odds: { type: String, required: true },
      event: { type: Number, required: true },
     amount: { type: Number, required: true }, 
     market: { type: Number, required: true },
     tax: { type: Number, required: true },
     possibleWin: { type: Number, required: true },
     betStatus: {
          code: { type: Number, default: 100, required: false },
       message: { type: String, default: 'Not Placed', required: false } 
     }

}, { timeStamps: true} )

const Live = new mongoose.model('liveBets-25/2026', live26)

module.exports = Live