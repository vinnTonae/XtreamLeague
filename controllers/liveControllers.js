require('dotenv').config()

const { caseInSwitch } = require('../controllers/test')
const User = require('../models/xtreamUsers')
const Live = require('../models/liveBets26')
const ObjectId = require('mongoose').Types.ObjectId


const getLiveBet = async (req, res) => {
    
     const userData = req.user
     const fplBaseUrl = process.env.FPLBASE
     const userid = req.user._id
    
   
       try {
   
           const month = new Date().getMonth()
           const baseUrl = `${fplBaseUrl}/bootstrap-static`
           const options = {
               method: 'GET',
               Accept: 'application/json'
           }
           const response = await fetch(baseUrl, options)
           const data = await response.json()
           const phases = data.phases
           const currentPhase = caseInSwitch(month)

           const array = []
           const chunk = 38
           for (i = 0; i < chunk; i++) {
               array.push(i + 1)
           }
           const currentArray = phases.find((phase) => {
               return phase.name === currentPhase
           })
   
           if (currentArray) {
               const start = currentArray.start_event
               const end = currentArray.stop_event
               const currentGameweeks = array.slice(start - 1, end)
               const events = data.events
               // console.log(currentGameweeks)
               const dataArray = []
               currentGameweeks.forEach((gameweek) => {
                   const event = events.find((event) => {
                       return event.id === gameweek
                   })
                   const bootstrapDeadline = new Date(event.deadline_time)
                   const dateNow = new Date()
   
               // TODO: REMEMBER TO RETURN BACK TO (bootstrapDeadline - datenow) after FPL UPDATES CALENDER YEAR 
   
                   const customDiffMs = ( bootstrapDeadline - dateNow ) + 21600000
   
                   dataArray.push([gameweek, event.deadline_time, customDiffMs])
   
               })
   
                const latestGameweek = dataArray.find((event) => {
                    return event[2] > 0
                })
                
                     
               const userLiveBets = await Live.find({ userId: userid  })
               const activeUserLiveBets = userLiveBets.filter((bet) => { return bet.betStatus.code !== 100 })
               const validUserLiveBetsLength = activeUserLiveBets.length

               const alert = 'Choose Gameweek'
               res.render('live', { user: userData, gameweekData: latestGameweek, userBets: activeUserLiveBets, betLength: validUserLiveBetsLength ,messages: req.flash('success') })
           } else {
               const alert = 'PL is currently in Pre-Season'
               const latestGameweek = null
               res.render('live', { user: userData, gameweekData: latestGameweek, messages: req.flash('success'), message: alert })
           }
   
   
       } catch (error) {
           req.flash('error', 'Server Error!! Try again Later')
           console.log(error)
           res.redirect('/main')
           console.log('PROXY DEPRICATION ERRORS')
   
       }
   
}

const postLiveBet = async (req, res) => {
    
    const { userId, odds, event, amount, market, tax, possibleWin } = req.body

    const newLiveBet = new Live({
        userId,
        odds,
        event,
        amount,
        market,
        tax,
        possibleWin
    }).save().then((livebet) => {
          
          const betId = livebet._id

          res.redirect(`/live/${betId}`)
         
    }).catch((err) => {
        
        req.flash('success', 'Server Error!!..Try again Later.')
        res.redirect('/live')
    })
}

const getAuthorizeLive = async ( req, res) => {

      const betid = req.params.id

      res.render('liveconfirm', { betId: betid })  
}

const patchAuthorizeLive = async (req, res) => {

    const { betid } = req.body

    if( ObjectId.isValid(betid) ) {

        try {
            
            const liveBetDetails = await Live.findOne({ _id: betid })
            const userid = liveBetDetails.userId
            const userDetails = await User.findOne({ _id: userid })
            const betAmount = liveBetDetails.amount
            const userTotalBalance = userDetails.totalBalance 

            if ( userTotalBalance < betAmount ) {

                req.flash('success', 'You have insufficient Funds to Place Bet')
                res.redirect('/live')

            } else {

            
    
            const newUserBalance = userTotalBalance - betAmount
            
            await User.findByIdAndUpdate({ _id: userid }, { totalBalance: newUserBalance })
            
            await Live.findByIdAndUpdate({ _id: betid }, { betStatus: { code: 200, message: 'pending' } })
    
            req.flash('success', 'Bet Placed Successfully!!..')
            res.redirect('/live')

            }
            
        } catch (error) {
            
            console.log(error)
            req.flash('success', 'Server Error!!...Try again later')
            res.redirect('/live')
            
        }

    
        
    } else {

        req.flash('success', 'Invalid Protocol!!...Bet creation failed')
        res.redirect('/live')

    }

}


module.exports = {
    getLiveBet,
    postLiveBet,
    getAuthorizeLive,
    patchAuthorizeLive

}