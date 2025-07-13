// require('dotenv').config()
const User = require('../models/xtreamUsers')
const Transactions = require('../models/transactions')


const getConfirmDeposit = (req, res) => {

    res.render('confirm', { user: req.user, deposit: req.query })
}

const postConfirmDeposit =  async (req, res) => {

    const { valuePaid, paypalEmail } = req.body
    const userId = req.user._id
    const status = 'pending'
    const valueToAdd = () => {
        const value = valuePaid
        if (value == '1.08') { return 100 }
    else if (value == '1.85') { return  200}
    else if (value == '4.25') { return 500 }
    else if (value == '8.15') { return  1000 }
    else if (value == '16.45') { return  2000 }
    else if (value == '39.45') { return 5000 }
    }
    
    const newTransaction = new Transactions({
         tranx_type: 'Deposit',
             method: 'paypal',
             userId: userId,
             amount: valueToAdd(),
             status: status,
           pplEmail: paypalEmail
          
    }).save().then((result) => {
          
          console.log('--NEW DEPOSIT PAYPAL--')
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
    
    try {

        const transaction = await Transactions.findOne({ _id: tranxId })
        const user = await User.findOne({ _id: userId })
        const existingPaypal = user.payPal    
        const amount = transaction.amount    
        const userBalance = user.totalBalance
        const userNewBalance = userBalance + amount 
          
        if (existingPaypal == 'none') {

            const updatedUser = await User.findByIdAndUpdate({ _id: userId }, { $set: { totalBalance: userNewBalance, payPal: pplEmail } })
    
            const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxId }, { $set: { status: 'complete'  } })
    
            req.flash('error', 'Deposit Complete!!..Account Credited')
            res.redirect('/main')

        } else {

            const updatedUser = await User.findByIdAndUpdate({ _id: userId }, { $set: { totalBalance: userNewBalance } })

            const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxId }, { $set: { status: 'complete' } })

            req.flash('error', 'Deposit Complete!!..Account Credited')
            res.redirect('/main')

        }

         
        
    } catch (error) {
        console.log('MongoDB eRROR')
        req.flash('error','Transaction not Recorded!!.. call 0701280373')
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