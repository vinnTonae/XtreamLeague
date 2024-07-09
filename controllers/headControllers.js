require('dotenv').config()

const { caseInSwitch } = require('../controllers/test')

const Head = require('../models/head2head')
const User = require('../models/xtreamUsers')
const ObjectId = require('mongoose').Types.ObjectId
const { HttpsProxyAgent } = require('https-proxy-agent')
const fetch = require('node-fetch')
const { proxyInstance } = require('../controllers/test')

const getBetHead = async (req, res) => {
    const xUser = req.user
    const month = new Date().getMonth()
    const fplBaseUrl = process.env.FPLBASE

    try {

        const baseUrl = `${fplBaseUrl}/bootstrap-static`
        const options = {
            method: 'GET',
            agent: new HttpsProxyAgent(proxyInstance),
            Accept: 'application/json'
        }
        const  response = await fetch(baseUrl, options)
        const data = await response.json()
        const phases = data.phases
        const currentPhase = caseInSwitch(month)
        //console.log(phases)
        const array = []
        const chunk = 38
      for (i = 0; i < chunk; i++) {
        array.push(i + 1)
          }
          const currentArray = phases.find((phase) => {
            return phase.name === currentPhase
        })
    
        // checking deadline included 
    
         if (currentArray) {
                const start = currentArray.start_event
                const end = currentArray.stop_event
                const currentGameweeks = array.slice(start - 1, end)
                //console.log(currentGameweeks)
                const events = data.events 
                const dataArray = []
                currentGameweeks.forEach((gameweek) => {
                    const event = events.find((event) => {
                        return event.id === gameweek
                    })
                    const bootstrapDeadline = new Date(event.deadline_time)
                    const dateNow = new Date()
                    const customDiffMs = ( bootstrapDeadline - dateNow ) + 86400000
                
            
                    dataArray.push( [gameweek, event.deadline_time, customDiffMs ] )
                })
    
                const latestGameweek = dataArray.find((event) => {
                    return event[2] > 0
                })
                const msToDeadline = latestGameweek[2]
                const daysLeft = Math.floor(msToDeadline / 86400000)
                const eventObject = [latestGameweek[0], daysLeft]
    
    
                const alert = 'Choose Gameweek'
                res.render('bet-h2h', { user: xUser, gameweeks: dataArray, eventData: eventObject, message: alert, phase: currentPhase })
            } else{
                const alert = 'PL is currently in Pre-Season Or Intnl Break'
                const dataArray = 'null'  
                res.render('bet-h2h', {user: xUser, gameweeks: dataArray,  message:alert, phase: currentPhase }  )
            }
       
        
    } catch (error) {
           
          req.flash('error', 'Proxy Error!! Try again Later')
          res.redirect('/main')
          console.log('PROXY DEPRICATION ERRORS')
    }
       
}

const postBetHead = (req, res) => {

    const { event, betType, amount } = req.body
    const hostId = req.user.teamId
    const newBet = new Head({
         betType,
         hostId,
         amount,
         event
    }).save().then((bet) => {
        const id = bet._id
      res.redirect(`/h2h/${id}`)
          
    })
 
    .catch((error) => {

       req.flash('error', 'Server Error!! Try again Later') 
       res.redirect('/main')
       console.log('An error occured' + error)
      })   
}

const h2hId = async (req, res) => {
    const prohibitedHost = req.user.teamId
    const balanceReqUser = req.user.totalBalance
    const id = req.params.id
    
    try {

    const betDetails = await Head.findOne({ _id: id })
    const hostId = betDetails.hostId
    const time = betDetails.createdAt
    const hostDetails = await User.findOne({ teamId: hostId })
    const toWin = betDetails.amount * 2
    const opponentDetails = await User.findOne({ teamId: betDetails.opponentId })

    
    res.render('h2h', { host: hostDetails, opponent: opponentDetails, balance: balanceReqUser, user: prohibitedHost, bet: betDetails, win: toWin, createdAt: time })

        
    } catch (error) {

        req.flash('error', 'Server Error!! Try again Later')
        res.redirect('/main')
        console.log('MongoDB Access Errors')
        
    }

}

const patchConfirmBet = async (req, res) => {
    const { betid } = req.body
    const opponent = req.user
    
    try {
    
    const bet = await Head.findOne({ _id: betid })
    const hostId = bet.hostId
    const host = await User.findOne({ teamId: hostId })
    const hostBalance = host.totalBalance
    const opponentBalance = opponent.totalBalance
    const entryFee = bet.amount
    const oppId = opponent.teamId

    if ( hostBalance < entryFee ) {
        
        req.flash('error', 'The Host has insufficient Funds')
        res.redirect('/main')
    } else if ( opponentBalance < entryFee ) {

        req.flash('error', 'You have insufficient Funds to Join the Bet')
        res.redirect('/main')

    } else if ( bet.betStatus.code !== 100 ) {
        
        req.flash('error', 'This Bet has already been Placed')
        res.redirect('/main')

    } else if ( bet.betStatus.code == 400 ) {
        
        const event = bet.event
        req.flash('error',  `Gameweek ${event} time to Join has expired`)
    
    }else {
       try {
         
       const newHostBalance = hostBalance - entryFee
       const newOpponentBalance = opponentBalance - entryFee
       const newBetDetails = await Head.findByIdAndUpdate({ _id: betid }, { $set: { opponentId: oppId, betStatus: { code: 200, message: 'Bet placed' }} })
       const newOpponent = await User.findByIdAndUpdate({ _id: opponent._id }, { $set: { totalBalance: newOpponentBalance } })
       const newHost = await User.findByIdAndUpdate({ _id: host._id }, { $set: { totalBalance: newHostBalance } })
       const event = bet.event 

       req.flash('success', `Successfully joined Bet in GW${event}`)
       res.redirect('/bets')

    } catch (error) {
         
         req.flash('error', 'Server Error!! Try to join again')
         res.redirect('/main')
    }
   }
    
        
    } catch (error) {

        req.flash('error', 'Server Error!! Try again Later')
        res.redirect('/main')
        console.log('MongoDB Access Errors')
    }
    
}

const postJoinBet = async (req, res) => {
    const { id } = req.body
    const newId = id.split(" ").join("")

    if (ObjectId.isValid(newId)) {

        try {

            const bet = await Head.findOne({ _id: newId })
    
            if (!bet) {
        
                req.flash('error', 'This Bet does Not Exist')
                res.redirect('/main')
           
            } else {
                res.redirect(`/h2h/${newId}`)
            }
            
        } catch (error) {

            req.flash('error', 'Server Error!! Try again Later')
            res.redirect('/main')
            console.log('MongoDB Access Errors')
            
        }

   
} else {
    req.flash('error', 'Invalid code')
    res.redirect('/main')
}

}

const getBets = async (req, res) => {
    
    const userDetails = req.user
    const userTeamId = req.user.teamId
    
    try {

        const headBetsHost = await Head.find({ hostId: userTeamId })       // All head to head bets this User has hosted
        const headBetsOpponent = await Head.find({ opponentId: userTeamId })  // All head to head bets this User was invited
      
    
         // FILTER FOR ONLY GW 1 BETS
    
        const headsHost = headBetsHost.filter( bet => bet.event == 1 )
        const headsOpp = headBetsOpponent.filter( bet => bet.event == 1 )
        const allHeadBets = headsHost.concat(headsOpp)
       
        
        const events = []
        const chunk = 38
        for(let i = 0; i < chunk; i++) {
            events.push(i + 1)
        }
        
         const currentGameweek = 1
    
        res.render('bets', { user: userDetails, Heads: allHeadBets, gameweeks: events, GW: currentGameweek, messages: req.flash('success') })
    
        
    } catch (error) {

         req.flash('error', 'Server Error!! Try again Later')
         res.redirect('/main')
         console.log('MongoDB Access Errors')
        
    }
   
}

const getBetsEvents = async (req, res) => {

    const eventParam = req.params.event
    const userDetails = req.user
    const userTeamId = req.user.teamId
    
    try {

        const headBetsHost = await Head.find({ hostId: userTeamId })       // All head to head bets this User has hosted
        const headBetsOpponent = await Head.find({ opponentId: userTeamId })  // All head to head bets this User was invited
       
    //    FILTER ALL BETS FOR EACH GAMEWEEK
    
        const headsHost = headBetsHost.filter( bet => bet.event == eventParam )
        const headsOpp = headBetsOpponent.filter( bet => bet.event == eventParam )
        const allHeadBets = headsHost.concat(headsOpp)
    
        const events = []
        const chunk = 38
    for(let i = 0; i < chunk; i++) {
        events.push(i + 1)
    }
       const currentGameweek = eventParam    
    
       res.render('bets', { user: userDetails, Heads: allHeadBets, gameweeks: events, GW: currentGameweek })
    
        
    } catch (error) {

        req.flash('success', 'Server Error!! Try again Later')
        res.redirect('/bets')
        console.log('MongoDB Access Errors')
        
    }

   
}

module.exports = {
    getBetHead,
    postBetHead,
    h2hId,
    patchConfirmBet,
    postJoinBet,
    getBets,
    getBetsEvents

}