const mongoose = require('mongoose')
const Schema = mongoose.Schema


const xtreamSchema = new Schema({

     userName: { type: String, required: true },
     googleId: { type: String, required: true },
     teamId: { type: String, default: 'none', required: false },
     managerName: { type: String, default: 'none', required: false },
     teamName: { type: String, default: 'none', required: false },
     totalBalance: { type: Number, default: 0.00, required: false },
     payPal: { type: String, default: 'none', required: false },
     mpesa: { type: Number, default: 254, required: false },
     favTeam: { type: Number, default: 0, required: false },
     points: { type: Array, default: [], required: false },
     totalEarned: { type: Number, default: 0, required: false }

}, { timestamps: true })

const User = new mongoose.model('xtreamUsers', xtreamSchema)

module.exports = User