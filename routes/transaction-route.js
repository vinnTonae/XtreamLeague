const router = require('express').Router()
const { authCheck, registerCheck } = require('../controllers/authControllers')
const { getTransactions } = require('../controllers/profileControllers')
const Transactions = require('../models/transactions')
const User = require('../models/xtreamUsers')



router.get('/', authCheck, registerCheck, getTransactions )

router.patch('/updateDeposit', async (req, res) => {

     const { tranxid } = req.body
     const userId = req.user._id

     try {

        const tranx = await Transactions.findOne({ _id: tranxid })
        const user = await User.findOne({ _id: userId })
        const tranxAmount = tranx.amount
        const tranxNum = tranx.mpesaObject.mpesaNumber
        const userBalance = user.totalBalance
        const newBalance = userBalance + tranxAmount

        if ( user.mpesa === 254 ) {

            const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxid }, { $set: { status: 'complete' } })
            const updatedUser = await User.findByIdAndUpdate({ _id: tranxid }, { $set: { totalBalance: newBalance, mpesa: tranxNum } })

            res.redirect('/transactions')

         } else {

            const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxid }, { $set: { status: 'complete' } })
            const updatedUser = await User.findByIdAndUpdate({ _id: tranxid }, { $set: { totalBalance: newBalance } })

            res.redirect('/transactions')

            }

        
     } catch (error) {

         req.flash('error', 'Failed to Update Transaction')
         res.redirect('/main')
        
     }

     

})







module.exports = router