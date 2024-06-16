const mongoose = require('mongoose')
const Schema = mongoose.Schema

const pointsSchema = new Schema({
    gameweek: { type: Number, required: false },
      points: { type: Number, required: false }
})

const xtreamSchema = new Schema({
     
        userName: { type: String, required: true },
        googleId: { type: String, required: true },
          teamId: { type: String, default: 'none', required: false },
     managerName: { type: String, default: 'none', required: false },
        teamName: { type: String, default: 'none', required: false },
    totalBalance: { type: Number, default: 0.00, required: false  },
          payPal: { type: String, default: 'xxx@paypal.com', required: false },
         favTeam: { type: Number, default: 0, required: false },
          points: { type: [pointsSchema], default: [], required: false }  

}, {timestamps: true})

const User = new mongoose.model('xtreamUsers', xtreamSchema)

module.exports = User