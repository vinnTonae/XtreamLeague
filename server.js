require('dotenv').config()

const ObjectId = require('mongoose').Types.ObjectId

const express = require('express')
const app = express()
const port = 3000
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

app.use(session({
    secret: process.env.SECRET,
    cookie: { secure: true, maxAge: 5000 },
    resave: false,
    saveUninitialized: true
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


app.get('/', notAuthCheck, (req, res) => {
    res.render('sign')
})


























