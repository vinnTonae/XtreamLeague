require('dotenv').config()

const router = require('express').Router()

const Transactions = require('../models/transactions')
const User = require('../models/xtreamUsers')


const getAccessToken =  async () => {
    const accessUrl = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    const consumerKey = process.env.CONSUMER_KEY 
    const secret = process.env.CONSUMER_SECRET
    const auth = new Buffer.from(`${consumerKey}:${secret}`).toString('base64')
    const Headers = {
          headers: {
            'Authorization': `Basic ${auth}`
                  }
          }

    try {

        const response = await axios.get(accessUrl, Headers)
        const token = response.data.access_token

        return token
        
    } catch (error) {
        
        const token = null
        return token
    }
     
     
}


router.post('/stk', async (req, res) => {
    //const { mpesaAmount } = req.body 
    const { phone } = req.body
    const amount = 1
    const requiredlength = phone.toString().length
    const startingNum = phone.toString().charAt(0)

    if ( requiredlength !== 10 && startingNum !== 0 ) {

         req.flash('error', 'Incorrect Mpesa Number')
         res.redirect('/deposit')
    } else {
        
        // TODO: MPESA API LOGIC
    const token = await getAccessToken()

    if (token == null) {
    
        req.flash('error', 'AccessToken Error')
        res.redirect('/deposit')

    } else {

    const inputPhone = phone.substring(1)
    const correctPhone = `254${inputPhone}`
    const stkUrl = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    const passkey = process.env.PASSKEY
    const shortcode = process.env.SHORTCODE 
    const date = new Date()
    const year = date.getFullYear()
    const month = date.getMonth() + 1 < 10 ?  `0${date.getMonth() + 1}` : date.getMonth() + 1
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
    const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
    const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
    const seconds = date.getSeconds() < 10 ?  `0${date.getSeconds()}` : date.getSeconds()
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`

    const password = new Buffer.from(shortcode + passkey + timestamp).toString('base64')



    await axios.post(stkUrl,  
         {
            "BusinessShortCode": shortcode,    
            "Password": password,    
            "Timestamp": timestamp,    
            "TransactionType": "CustomerBuyGoodsOnline",    
            "Amount": amount,    
            "PartyA": correctPhone,    
            "PartyB": '8811882',    
            "PhoneNumber": correctPhone,    
            "CallBackURL": `https://xtreamleague.onrender.com/mpesa/${process.env.CALLBACK}`,    
            "AccountReference": correctPhone,    
            "TransactionDesc": "Test" 
         },
         {
         headers: {
            Authorization: `Bearer ${token}`
         }
        }
        
    )
            .then((response) => {
                
                
                const merchantID = response.data.MerchantRequestID

                res.redirect(`/mpesa?reqID=${merchantID}`)
            })
            .catch((err) => {
            
                req.flash('error', 'STK PUSH ERROR')
                res.redirect('/deposit')
            })


    }
  }
})


router.post(`/${process.env.CALLBACK}`, (req, res) => {
    const mpesaResponse = req.body
    
    
    const stkCallback = mpesaResponse.Body.stkCallback
    const metaData = mpesaResponse.Body.stkCallback.CallbackMetadata

   if (!metaData) {
      
      const merchantID = stkCallback.MerchantRequestID
      const resCode = stkCallback.ResultCode
      const resDesc = stkCallback.ResultDesc
      
    //   TODO: SAVE FAILED TRANSACTION

      const tranx = new Transactions({
         
           tranx_type: 'Deposit',
               method: 'mpesa',
               userId: 'failed',
               status: 'pending',
          mpesaObject: {
                   reqID: merchantID,
                   status: {
                       resultCode: resCode,
                       resultDesc: resDesc 
           }  
      } 
          
      }).save().then((data) => {
        
        console.log('--INCOMPLETE TRANX SAVED--')
      }).catch((err) => {
        console.log('--FAILED TO SAVE TRANX--')
      })

      return res.json({ message: 'Response OK'})

   } else {

      const merchantID = stkCallback.MerchantRequestID
      const mpesaAmount = metaData.Item[0].Value
      const phoneNumber = metaData.Item[4].Value
      const succResCode = stkCallback.ResultCode
      const succResDesc = stkCallback.ResultDesc
      
    // todo: SAVE SUCCESSFUL TRANSACTION
    
      const newSuccTranx = new Transactions({
            tranx_type: 'Deposit',
                method: 'mpesa',
                userId: 'success',
                amount: mpesaAmount,
                status: 'pending',
           mpesaObject: {
            mpesaNumber: phoneNumber,
                  reqID: merchantID,
                 status: {
                      resultCode: succResCode,
                      resultDesc: succResDesc
                 } 
           }  
      }).save()
        .then((data) => {

            console.log('--SUCCESSFUL TRANSACTION SAVED')
        
        })
        .catch( error  => console.log('--ERROR SAVING TRANX SUCC')) 

      
    return res.json({ message: 'Response OK'})
   }
        
})



router.get('/', (req, res) => {
    const reqid = req.query.reqID
    res.render('mpesaconfirm', { messages: req.flash('error'), reqID: reqid })
})


router.patch('/confirm', async (req, res) => {
    
    const userId = req.user._id 
    const { reqid } = req.body
    const transaction = await Transactions.findOne({ "mpesaObject.reqID": reqid  })

    if (!transaction) {

        req.flash('error', 'Transaction Not recorded..CONTACT 0701280373')
        res.redirect('/main')

    } else {

        try {

            
          const userObject = await User.findOne({ _id: userId })
          const mpesaNumber = userObject.mpesa 
          const currentBalance = userObject.totalBalance
          const tranxAmount = transaction.amount
          const tranxPhone = transaction.mpesaObject.mpesaNumber
          const newBalance = currentBalance + tranxAmount
          const resDesc = transaction.mpesaObject.status.resultDesc
          const tranxId = transaction._id

        if (tranxAmount === 0) {

           req.flash('error', resDesc)
           res.redirect('/deposit')
         
        } else {

            if (mpesaNumber === 254) {
               
               const updatedUser = await User.findByIdAndUpdate({ _id: userId }, { totalBalance: newBalance, mpesa: tranxPhone  })
               const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxId }, { status: 'complete', userId: userId } )

               req.flash('error', 'Deposit Complete')
               res.redirect('/main')
        
        } else {

            const updatedUser = await User.findByIdAndUpdate({ _id: userId }, { totalBalance: newBalance })
            const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxId }, { status: 'complete', userId: userId })

            req.flash('error', 'Deposit Complete')
            res.redirect('/main')
        }

    }    
            
        } catch (error) {

            req.flash('error', 'Transaction Not recorded..CONTACT 0701280373')
            res.redirect('/main')
            
        }

    }

})






module.exports = router