require('dotenv').config()

const ObjectId = require('mongoose').Types.ObjectId

const express = require('express')
const app = express()
const port = 5511
const mongoose = require('mongoose')
const User = require('./models/xtreamUsers')
const Head = require('./models/head2head')
const Party = require('./models/party')
const Transactions = require('./models/transactions')
const ejs = require('ejs') 
const methodOverride = require('method-override')
const passportSetUp = require('./config/passport-google')
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')
const cookieSession = require('cookie-session')

const authRoutes = require('./routes/auth-routes')
const {  notAuthCheck } = require('./controllers/authControllers')


const myTeamRoutes = require('./routes/myteam-routes')
const betHeadRoutes = require('./routes/bethead-routes')
const joinPartyRoutes = require('./routes/joinparty-routes')
const confirmPartyRoutes = require('./routes/confirmparty-routes')
const partyRoute = require('./routes/party-route')
const betPartyRoutes = require('./routes/betparty-routes')
const h2hRoute = require('./routes/h2h-route')
const joinBetRoute = require('./routes/joinbet-route')
const confirmBetRoute = require('./routes/confirmbet-route')
const partiesRoutes = require('./routes/parties-routes')
const betsRoutes = require('./routes/bets-routes')
const confirmDepositRoutes = require('./routes/confirmdeposit-routes') 
const depositRoute = require('./routes/deposit-route')
const withdrawRoutes = require('./routes/withdraw-routes')
const authorizeRoutes = require('./routes/authorize-routes')
const mainRoute = require('./routes/main-route')
const searchRoute= require('./routes/search-route')
const registerRoute = require('./routes/register-route')
const patchIdRoute = require('./routes/patchid-route')
const topdollarRoute = require('./routes/topdollar-route')
const transactionRoute = require('./routes/transaction-route')
const mpesaRoutes = require('./routes/mpesa')
const devRoutes = require('./routes/dev-routes')
const { getBootstrap } = require('./controllers/profileControllers')


// MIDDLEWARE 

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use('*/logos', express.static('public/logos'))
app.use('*/jerseys', express.static('public/jerseys'))
app.use(express.json())
app.use(methodOverride('_method'))

app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [process.env.COOKIE_KEY]
}))

app.use(flash())


app.use(passport.initialize())
app.use(passport.session())




// CONNECT TO DB

const dbURI = process.env.MONGODB_URI


mongoose.connect(dbURI)
.then(() => {
    console.log('connected to Database')
    app.listen(port, () => console.log(`Server listening on port ${port}`))
})
.catch((err) => { console.log(err) })



//ROUTES

app.use('/auth', authRoutes)
app.use('/myteam', myTeamRoutes)
app.use('/join-party', joinPartyRoutes)
app.use('/confirm-party', confirmPartyRoutes)
app.use('/party', partyRoute)
app.use('/bet-party', betPartyRoutes)
app.use('/bet-head', betHeadRoutes)
app.use('/h2h', h2hRoute)
app.use('/confirm-bet', confirmBetRoute)
app.use('/join-bet', joinBetRoute)
app.use('/bets', betsRoutes)
app.use('/parties', partiesRoutes)
app.use('/confirm-deposit', confirmDepositRoutes)
app.use('/deposit', depositRoute)
app.use('/withdraw', withdrawRoutes)
app.use('/authorize', authorizeRoutes)
app.use('/topdollar', topdollarRoute)
app.use('/transactions', transactionRoute)
app.use('/main', mainRoute)
app.use('/patchId', patchIdRoute)
app.use('/register', registerRoute)
app.use('/search', searchRoute)
app.use('/mpesa', mpesaRoutes)
app.use('/dev', devRoutes)


app.get('/', notAuthCheck, (req, res) => {
    res.render('sign')
})

app.get('/boot', getBootstrap)

app.get('/public', async (req, res) => {

   const allParties = await Party.find()

   const publicParties = allParties.filter((party) => {
     return party.betStatus.code == 1000
   }) 

   publicParties.sort((a, b) => b.amount - a.amount)

    res.render('public', { parties: publicParties })
})

app.get('/settings', async (req, res) => {

    const userId = req.user._id

    try {
        
        const userData = await User.findOne({ _id: userId })
    
        res.render('settings', { user: userData, messages: req.flash('error') })
        
    } catch (error) {
         
        req.flash('error', 'Server Error..Try again later!!')
        res.redirect('/main')
    }
    
})

app.patch('/settings', async (req, res) => {
     
       const { mpesaNumber, paypalEmail } = req.body
       const userId = req.user._id

     try {

       if(mpesaNumber == 254) {

             await User.findByIdAndUpdate({ _id: userId }, { payPal: paypalEmail })
           
             req.flash('error', 'Paypal Email Updated')
             res.redirect('/settings')

       } else {

          

           const formatNumber = mpesaNumber.substring(1)
           const stringFormatNumber = `254${formatNumber}`
           const correctFormatNumber = Number(stringFormatNumber)
           const userNumberExists = await User.findOne({ mpesa: correctFormatNumber })
    
           if (userNumberExists) {
                 
                 req.flash('error', 'Mpesa Number already Taken...Choose Another number!!')
                 res.redirect('/settings')
           } else {
              
              await User.findByIdAndUpdate({ _id: userId}, { mpesa: correctFormatNumber, payPal: paypalEmail })
              req.flash('error', 'Update successful!!')
              res.redirect('/settings')
           }
        
         
       }

        } catch (error) {
            
            req.flash('error', 'Server Error!!!...Try Again Please')
            res.redirect('/settings')
       }


})

app.patch('/refresh', async (req, res) => {
     
      const { tranxId, userId } = req.body
      
      if (tranxId == 'none' ) {
           
          req.flash('error', 'No Pending Deposits')
          res.redirect('/main')

      } else {

     try {
        
         const pendingTranx = await Transactions.findOne({ _id: tranxId })
         const userToPatch = await User.findOne({ _id: userId })
    
         const tranxAmount = pendingTranx.amount
         const userBalance = userToPatch.totalBalance
         const newUserBalance = userBalance + tranxAmount 
    
         await Transactions.findByIdAndUpdate({ _id: tranxId }, { userId: userId, status: 'complete' })
         await User.findByIdAndUpdate({ _id: userId }, { totalBalance: newUserBalance })
         
         req.flash('error', 'Balance Updated successfully')
         res.redirect('/main')

     } catch (error) {
         
         req.flash('error', 'Database Timeout Error')
         res.redirect('/main')
        
     }


     }
})
























