const patchAuthorize = async (req, res) => {

    const { userid, amount } = req.body
    const userDetails = await User.findOne({ _id: userid })
    const userTotal = userDetails.totalBalance
    const newUserTotal = userTotal - amount
    
    const updatedUser = await User.findByIdAndUpdate({ _id: userid }, { $set: { totalBalance: newUserTotal  } })
    req.flash('error', 'User Updated')
    res.redirect('/main') 

}

const getAuthorize =  (req, res) => {
    
    res.render('authorize', { user: req.user, deposit: req.query })
}

const postWithdraw = async (req, res) => {
    const { amount } = req.body
    const userId = req.user._id
    const userDetails = await User.findOne({ _id: userId })
    const pplEmail = userDetails.payPal
    const status = "pending"
    const tranx_type = "Withdraw"
    const userBalance = userDetails.totalBalance

    if ( userBalance < amount ) {

         req.flash('error', 'You have Insufficient Funds')
         res.redirect('/withdraw') 

    } else if ( amount < 300 ) {
          
         req.flash('error', 'Minimum Withdrawable Amount is KSH 300')
         res.redirect('/withdraw')
        
    } else {


    const withdrawTransaction = new Transactions({
          tranx_type,
          userId,
          amount,
          status,
          pplEmail
    }).save().then((tranx) => {
        const amount = tranx.amount
        const user = tranx.userId
       

        res.redirect(`/authorize?ajaxppluser=${user}&deduct=${amount}`)
            
    })
    .catch((error) => {
        console.log(error)
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
    getAuthorize,
    postWithdraw,
    getWithdraw
}