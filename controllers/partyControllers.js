const { caseInSwitch } = require('../controllers/test')
const User = require('../models/xtreamUsers')
const Party = require('../models/party')
const ObjectId = require('mongoose').Types.ObjectId
const { HttpsProxyAgent } = require('https-proxy-agent')
const fetch = require('node-fetch')

const postJoinParty = async (req, res) => {

    const { id } = req.body
    const newId = id.split(' ').join('')
    
    if (ObjectId.isValid(newId)) {

        const party = await Party.findOne({ _id: newId })
        
        if (!party) {
    
            req.flash('error', 'This Party does Not Exist')
            res.redirect('/main')
       
        } else {
            res.redirect(`/party/${newId}`)
        }
    } else {
        req.flash('error', 'Invalid code')
        res.redirect('/main')
    }

}

const getPartyId = async (req, res) => {
    
    const partyId = req.params.id
    console.log(partyId)
    
     const partyDetails = await Party.findOne({ _id: partyId })
     const host = partyDetails.hostId
     const hostDetails = await User.findOne({ teamId: host })
     const user = req.user

     const allPlayers = await User.find()
     const playerArray = partyDetails.players

     const detailsArray = []
     for (let i = 0; i < playerArray.length; i++) {
         detailsArray.push(allPlayers.find((player) => {
              return player.teamId == playerArray[i]
         }))
     }

     // WINNERS CALCULATIONS
     const totalPlayers = playerArray.length

     const calculateWinner = (partyDetails, totalPlayers) => {
        const entryAmount = partyDetails.amount
        let first = 0
        let second = 0
        let third = 0

        if ( totalPlayers <= 3 ) {
            first = Math.floor((entryAmount * totalPlayers) * 0.85 )
            second = 0
            third = 0 
         return [first, second, third]

        } else if ( 4 <= totalPlayers <= 10 )  {
             const amountToSpread = Math.floor( (entryAmount * totalPlayers) * 0.85 )
             first = Math.floor(amountToSpread * 0.6)
             second = Math.floor(amountToSpread * 0.3)
             third = Math.floor(amountToSpread * 0.1)
            return [first, second, third]

        } else if ( totalPlayers > 10 ) {
            const amountToSpread = Math.floor( (entryAmount * totalPlayers) * 0.85)
            first = Math.floor(amountToSpread * 0.6)
            second = Math.floor(amountToSpread * 0.25)
            third = Math.floor(amountToSpread * 0.15)
           return [first, second, third] 
        }
     }
     const winner = await calculateWinner(partyDetails, totalPlayers)


     res.render('party', { userData: user, winners: winner, host: hostDetails, party: partyDetails, players: detailsArray  })

}

const patchConfirmParty = async (req, res) => {
    const { betid } = req.body
    const player = req.user
    const playerTeamId = player.teamId
    const playerId = player._id
    const partyDetails = await Party.findOne({ _id: betid })
    const hostId = partyDetails.hostId
    const hostDetails = await User.findOne({ teamId: hostId })
    const entryFee = partyDetails.amount
    const playerBalance = player.totalBalance
    const hostBalance = hostDetails.totalBalance
    const partyStatus = partyDetails.betStatus
    
    //check if player already exists in this party
    const playersArray = partyDetails.players
    const playerAlreadyExists = () => {
        const result = playersArray.find((player) => {
            return player == playerTeamId 
         })
         if (result) {
          return true
          } else {
              return false
          }
    }
  


    if ( partyStatus.code == 100 && playerAlreadyExists() === false ) {
          //updating both host and player totalBalances
          if ( playerBalance < entryFee ) {

              req.flash('error', 'You have Insufficient Funds to join Party')
              res.redirect('/main')

          } else if ( hostBalance < entryFee ) {

              req.flash('error', 'The Host has Insufficient Funds')
              res.redirect('/main')

          } else {

              try {
                  const newHostBalance = hostBalance - entryFee
                  const newPlayerBalance = playerBalance - entryFee
                  const updatedHost = await User.findByIdAndUpdate({ _id: hostDetails._id }, { $set: { totalBalance: newHostBalance  } })
                  const updatedPlayer = await User.findByIdAndUpdate({ _id: playerId }, { $set: { totalBalance: newPlayerBalance } })
                  const updatedParty = await Party.findByIdAndUpdate({ _id: betid }, { $set: { betStatus: { code: 200, message: 'Party is now Active' } } })
                  const newUpdatedParty = await Party.findByIdAndUpdate({ _id: betid }, { $addToSet: { players: playerTeamId } })

                  req.flash('success', 'Joined Party successfully')
                  res.redirect('/parties')

              } catch (error) {
                      console.log(error)
                     req.flash('error', 'Server Error!! Try again ')
                     res.redirect('/main')
              }
          }
              

    } else if ( partyStatus.code == 200 && playerAlreadyExists() === false ) {
      //  update only the player joining
        if ( playerBalance < entryFee ) {
                  
               req.flash('error', 'You have Insufficient Funds')
               res.redirect('/main')
        } else {
            
            try {
               
                const newPlayerBalance = playerBalance - entryFee 
                const updatedPlayer = await User.findByIdAndUpdate({ _id: playerId }, { $set: { totalBalance: newPlayerBalance } })
                const updatedParty = await Party.findByIdAndUpdate({ _id: betid }, { $addToSet: { players: playerTeamId } })
                const event = partyDetails.event

                req.flash('success', `You have successfully joined Party in GW${event}`)
                res.redirect('/parties')
                
            } catch (error) {
               
                req.flash('error', 'Server Error!! Try Again')
                res.redirect('/main')
            }
              
        } 
                   

    } else if ( partyStatus.code == 400 ) {

        const event = partyDetails.event
      req.flash('error', `Gameweek ${event} joining Time has Expired`)
      res.redirect('/main')

    } else if ( playerAlreadyExists() === true ) {
         
        req.flash('error', 'You have already Joined this party')
        res.redirect('/main')
    }

}

const postBetParty = (req, res) => {

    const { betType, event, amount } = req.body
    const hostId = req.user.teamId
    
    
    const newParty = new Party({
           betType,
           hostId,
           event,
           amount,
           players: [hostId]

    }).save().then((party) => {
          const id = party._id
          res.redirect(`/party/${id}`)
        console.log('New Party Created')
    })
    .catch((error) => {

        req.flash('error', 'Server Error!! Party not created')        
        res.redirect('/main')
        console.log(error)
    })

}

const getBetParty = async (req, res) => {
    
    const userData = req.user
    const month = new Date().getMonth()
    const baseUrl = 'https://fantasy.premierleague.com/api/bootstrap-static'
    const options = {
        method: 'GET',
        agent: new HttpsProxyAgent({ host: '45.141.179.179', port: '8000', auth: '4adwq0:6DBTA2' }),
        Accept: 'application/json'
    }
    const  response = await fetch(baseUrl, options)
    const data = await response.json()
    const phases = data.phases
    const currentPhase = caseInSwitch(month + 3)
    //console.log(phases)
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
                 const customDiffMs = (dateNow - bootstrapDeadline) + 86400000 
                 dataArray.push([gameweek, event.deadline_time, customDiffMs])
                    
            }) 
            const alert = 'Choose Gameweek'
            res.render('bet-party', { user: userData, gameweeks: dataArray, message: alert, phase: currentPhase })
        } else{
            const alert = 'PL is currently in Pre-Season'
            const dataArray = 'null'  
            res.render('bet-party', { user: userData, gameweeks: dataArray, message: alert, phase: currentPhase }  )
        }
   
       
}

const getParties = async (req, res) => {
      
    const userDetails = req.user
    const userTeamId = req.user.teamId
    const partyBetsHost = await Party.find({ hostId: userTeamId })   // All parties this User has hosted
    const allParties = await Party.find()
    
    const partyOppArray = allParties.filter((party) => {         // All parties this User was invited
         
        return party.players.some( playerId =>  playerId == userTeamId ) === true 
   })
                    // filter for gameweek 1 for parent route

    const partyHost = partyBetsHost.filter( bet => bet.event == 1 )
    const partyOpp = partyOppArray.filter( bet => bet.event == 1 )
    const currentPartiesArray = partyHost.concat(partyOpp) 
    const events = []
    const chunk = 38
    for(let i = 0; i < chunk; i++) {
        events.push(i + 1)
    }
    const currentGameweek = 1
    res.render('parties', { user: userDetails, Parties: currentPartiesArray, gameweeks: events, GW: currentGameweek, messages: req.flash('success') })
}

const getPartiesEvents = async (req, res) => {
     
    const eventParam = req.params.event
    const userDetails = req.user
    const userTeamId = req.user.teamId
    const partyBetsHost = await Party.find({ hostId: userTeamId })   // All parties this User has hosted
    const allParties = await Party.find()
    
    const partyOppArray = allParties.filter((party) => {         // All parties this User was invited
         
        return party.players.some( playerId =>  playerId == userTeamId ) === true 
   })
    //    Filter bets for each gameweek
   const partyHost = partyBetsHost.filter( bet => bet.event == eventParam )
   const partyOpp = partyOppArray.filter( bet => bet.event == eventParam )
   const currentPartiesArray = partyHost.concat(partyOpp)
   const events = []
   const chunk = 38
for(let i = 0; i < chunk; i++) {
   events.push(i + 1)
}
   const currentGameweek = eventParam
 
res.render('parties', { user: userDetails, Parties: currentPartiesArray, gameweeks: events, GW: currentGameweek })
}

module.exports = {
    postJoinParty,
    patchConfirmParty,
    getPartyId,
    getBetParty,
    postBetParty,
    getParties,
    getPartiesEvents

}
