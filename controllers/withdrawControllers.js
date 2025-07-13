// require('dotenv').config()

const User = require('../models/xtreamUsers')
const Transactions = require('../models/transactions')
const axios = require('axios')

const patchAuthorize = async (req, res) => {

    const { tranxid } = req.body
    
    try {
        const tranx = await Transactions.findOne({ _id: tranxid })
        const userid = tranx.userId
        const amount = tranx.amount 
        const userDetails = await User.findOne({ _id: userid })
        const userTotal = userDetails.totalBalance
        const newUserTotal = userTotal - amount
        
        const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxid }, { $set: { status: 'passed' } })
        const updatedUser = await User.findByIdAndUpdate({ _id: userid }, { $set: { totalBalance: newUserTotal  } })
        
        req.flash('error', 'User Updated')
        res.redirect('/main')
    
        
    } catch (error) {

        req.flash('error', 'Server Error!!..Try again later')
        res.redirect('/main')
        
    }
   
}

const patchAuthorizeMpesa = async (req, res) => {

    const { tranxid } = req.body

    try {
        
        const tranx = await Transactions.findOne({ _id: tranxid })
        const userId = tranx.userId
        const userDetails = await User.findOne({ _id: userId })
        const amount = tranx.amount
        const userTotal = userDetails.totalBalance
        const newUserTotal = userTotal - amount

        const updatedUser = await User.findByIdAndUpdate({ _id: userId }, { $set: { totalBalance: newUserTotal } })
        const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxid }, { $set: { status: 'passed' } })

        req.flash('error', 'User Updated')
        res.redirect('/main')

    } catch (error) {
        
        console.log('MongoDB eRROR')
            req.flash('error', 'Server Error!!-- Try again Later')
            res.redirect('/main')
    }

}

const getAuthorizePaypal =  (req, res) => {
    
    res.render('authorize-paypal', { user: req.user, deposit: req.query })
}

const getAuthorizeMpesa = (req, res) => {

    res.render('authorize-mpesa', { user: req.user, deposit: req.query })
}

const postWithdraw = async (req, res) => {
    const { amount } = req.body
    const userId = req.user._id
    const userDetails = await User.findOne({ _id: userId })
    const pplEmail = userDetails.payPal
    const method = 'paypal'
    const status = "waiting"
    const tranx_type = "Withdraw"
    const userBalance = userDetails.totalBalance

    if ( userBalance < amount ) {
         
         req.flash('error', 'You have Insufficient Funds')
         res.redirect('/withdraw') 

    } else if ( amount < 150 ) {
          
        
         req.flash('error', 'Minimum Withdrawable Amount is KSH 150')
         res.redirect('/withdraw')
        
    } else {


    const withdrawTransaction = new Transactions({
          tranx_type,
          userId,
          method,
          amount,
          status,
          pplEmail
    }).save().then((tranx) => {
        console.log('--NEW WITHDRAW TRANSACTION--')
          
        res.redirect(`/authorize/paypal?ajaxtranxID=${tranx._id}`)
    })
    .catch((error) => {
        console.log('MongoDB eRROR')
        
        req.flash('error', 'Withdraw request Failed')
        res.redirect('/main')
        })
   }      
}

const postWithdrawMpesa = async (req, res) => {
    
    const { amount } = req.body
    const userId = req.user._id
    const userDetails = await User.findOne({ _id: userId })
    const method = 'mpesa'
    const status = "waiting"
    const tranx_type = "Withdraw"
    const mpesa = userDetails.mpesa
    const userBalance = userDetails.totalBalance

    if ( userBalance < amount ) {
         
          req.flash('error', 'You have Insufficient Funds')
          res.redirect('/withdraw') 


    } else if ( amount < 150 ) {
          
         req.flash('error', 'Minimum Withdrawable Amount is KSH 150')
         res.redirect('/withdraw')
        
    } else {


    const withdrawTransaction = new Transactions({
          tranx_type,
          userId,
          method,
          amount,
          status,
          mpesaObject: {
            mpesaNumber: mpesa, 
          }
    }).save().then((tranx) => {

        const tranxId = tranx._id
     res.redirect(`/authorize/mpesa?ajaxtranxID=${tranxId}`)
            
    })
    .catch((error) => {
        console.log('Mongodb eRROR')
         req.flash('error', 'Withdraw request Failed')
         res.redirect('/main')
        })
   }   
     
}

const getWithdraw = async (req, res) => {
    const userDetails = await User.findOne({ _id: req.user._id }) 

    res.render('withdraw', { user: userDetails, messages: req.flash('error') })
}

module.exports = {
    patchAuthorize,
    patchAuthorizeMpesa,
    getAuthorizeMpesa,
    getAuthorizePaypal,
    postWithdraw,
    postWithdrawMpesa,
    getWithdraw
}