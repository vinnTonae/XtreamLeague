const User = require('../models/xtreamUsers')
const Transactions = require('../models/transactions')
require('dotenv').config()


const getConfirmDeposit = (req, res) => {

    res.render('confirm', { user: req.user, depost: req.query })
}

const postConfirmDeposit =  async (req, res) => {

    const { valuePaid, paypalEmail } = req.body
    const userId = req.user._id
    const status = 'pending'
    const valueToAdd = () => {
        const value = valuePaid
        if (value == '1.05') { return 100 }
    else if (value == '1.75') { return  200}
    else if (value == '4.25') { return 500 }
    else if (value == '8.15') { return  1000 }
    else if (value == '16.42') { return  2000 }
    else if (value == '39.25') { return 5000 }
    }
    
    const newTransaction = new Transactions({
         tranx_type: 'Deposit',
             method: 'paypal',
             userId: userId,
             amount: valueToAdd(),
             status: status,
           pplEmail: paypalEmail
          
    }).save().then((result) => {
          res.send(result)
             
    }).catch((error) => {
        console.log(error)
        req.flash('error', 'Failed to update transaction. Please contact 0701280373')
        res.redirect('/main')
    })

   
}

const patchConfirmDeposit = async (req, res) => {
    
    const { pplEmail, tranxId } = req.body
    const userId = req.user._id
    const transaction = await Transactions.findOne({ _id: tranxId })
    const user = await User.findOne({ _id: userId })

    if ( transaction.status !== 'pending') {

        req.flash('error', 'Buda!!..This transaction was recorded')
        res.redirect('/main')
    }else {

        const amount = transaction.amount    
        const userBalance = user.totalBalance
        const userNewBalance = userBalance + amount 

        const updatedUser = await User.findByIdAndUpdate({ _id: userId }, { $set: { totalBalance: userNewBalance, payPal: pplEmail } })

        const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxId }, { $set: { status: 'completed'  } })

        req.flash('error', 'Transaction Complete!!..User Updated ')
        res.redirect('/main')
    }



}

const getDeposit = (req, res) => {

    res.render('deposit', { CLIENT: process.env.PAYPAL_CLIENT_ID, messages: req.flash('error') })
}


module.exports = {
    getConfirmDeposit,
    postConfirmDeposit,
    patchConfirmDeposit,
    getDeposit
}