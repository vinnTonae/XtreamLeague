const User = require('../models/xtreamUsers')
const Head = require('../models/head2head')
const Party = require('../models/party')
const Transactions = require('../models/transactions')
const fetch = require('node-fetch')
const { HttpsProxyAgent } = require('https-proxy-agent')
const { proxyInstance } = require('../controllers/test')
const Transactions = require('../models/transactions')


const getDev = async (req, res) => {
    const array = []
    const chunk = 38

    try {
             
     const baseUrl = 'https://fantasy.premierleague.com/api/bootstrap-static'
     const options = {
         method: 'GET',
         agent: new HttpsProxyAgent(proxyInstance),
         Accept: 'application/json'
     }

     const response = await fetch(baseUrl, options)
     const data = await response.json()
      const eventDetails = data.events
     const dataArray = []

    for(let i = 0; i < chunk; i++ ) {
        array.push(i + 1)
    }

    array.forEach((gameweek) => {
        const event = eventDetails.find((event) => {
            return event.id ===gameweek
        })
        if(event){
            const eventStatus = event.finished
          dataArray.push( [gameweek, eventStatus] ) 
        } else {
            dataArray.push([gameweek, false])
        }

    })

    
     res.render('dev', { GW: dataArray })  
        
    } catch (error) {

        req.flash('error', 'Proxy Errors To Fix')
        res.redirect('/main')
        
    }

}

const getDevConsole = async (req, res) => {  
    const id = req.params.id
    const allUsers = await User.find()

    const updatedUsers = allUsers.filter((user) => {
        return user.points.some((pointsObject) => { return pointsObject.gameweek == id })
    })
    
    const withdraws = await Transactions.find({ tranx_type: 'Withdraw' })
    const withdrawCount = withdraws.length

    const updatedWithdraws = withdraws.filter((tranx) => {
            return tranx.status == 'settled'
    })
    const updatedWithCount = updatedWithdraws.length    

    const updatedCount = updatedUsers.length

    const userCount = allUsers.length
    const currentHeads = await Head.find({ event: id })
    const currentParties = await Party.find({ event: id })
    const headCount = currentHeads.length 
    const partyCount = currentParties.length
    const depricatedHeads = currentHeads.filter((bet) => {
             return bet.betStatus.code == 100
    })
    const depricatedParty = currentParties.filter((party) => {
           return party.betStatus.code == 100
    })
    const updatedHeads = currentHeads.filter((bet) => {
        return bet.betStatus.code === 1000
    })
    const updatedParty = currentParties.filter((party) => {
        return party.betStatus.code === 1000
    })
    const updatedHeadCount = updatedHeads.length
    const updatedPartyCount = updatedParty.length     
    const depHeadCount = depricatedHeads.length
    const depPartyCount = depricatedParty.length 
    const depArray = [depHeadCount, depPartyCount]

    res.render('devconsole', { event: id, messages: req.flash('error'), withdraws: withdrawCount, heads: headCount, party: partyCount, users: userCount, updated: updatedCount, updatedWithdraws: updatedWithCount, updatedHead: updatedHeadCount, updatedParty: updatedPartyCount, deps: depArray })
}

const getDevUsers = async (req, res) => {
    
    const event = req.params.id
    const allUsers = await User.find()
    
    res.render('xusers', { users: allUsers, event: event, messages: req.flash('success') })
}

const patchDevUsers = async (req, res) => {

    const event = req.params.id
    const { userid } = req.body
    const userToUpdate = await User.findOne({ _id: userid })
    const teamId = userToUpdate.teamId
    const baseUrl = `https://fantasy.premierleague.com/api/entry/${teamId}/history`
    const options = {
        method: 'GET',
        agent: new HttpsProxyAgent(proxyInstance),
        Accept: 'application/json'
    }
    const response = await fetch(baseUrl, options)
    const data = await response.json()
    const eventDetails = data.current
    const currentEvent = eventDetails.find((eventData) => {
           return eventData.event == event
    })

    if (currentEvent) {
          
        const gameweekPoints = currentEvent.points
        const pointsObject = { gameweek: event, points: gameweekPoints  }

        const updatedUser = await User.findByIdAndUpdate({ _id: userid }, { $push: { points: pointsObject } })

        req.flash('success', 'User Updated')
        res.redirect(`/dev/${event}/xUsers`)

    } else {

        req.flash('success', `Gw${event} Points not Found`)
        res.redirect(`/dev/${event}/xUsers`)

    }
   
}

const getDevHeads = async (req, res) => {

    const event = req.params.id
    const allHeads = await Head.find({ event: event })

    res.render('devheads', { gameweek: event, heads: allHeads, messages: req.flash('success') })
}

const updateDevHeads = async (req, res) => {

    const event = req.params.id
    const { betid } = req.body
    const betDetails = await Head.findOne({ _id: betid })
    const hostId = betDetails.hostId
    const opponentId = betDetails.opponentId
    const Host = await User.findOne({ teamId: hostId })
    const Opponent = await User.findOne({ teamId: opponentId })

    const hostPoints = Host.points[event - 1].points
    const oppPoints = Opponent.points[event - 1].points

    const updatedBet = await Head.findByIdAndUpdate({ _id: betid }, { points: { host: hostPoints, opponent: oppPoints  } })

    req.flash('success', 'Bet Updated')
    res.redirect(`/dev/${event}/heads`)
}

const settleDevHeads = async (req, res) => {

    const event = req.params.id
    const { betid } = req.body
    const betDetails = await Head.findOne({ _id: betid })
    const entryAmount = betDetails.amount
    const amountToPay = entryAmount * 2 
    const hostId = betDetails.hostId
    const opponentId = betDetails.opponentId
    const Host = await User.findOne( { teamId: hostId } )
    const Opponent = await User.findOne({ teamId: opponentId })
    const hostBalance = Host.totalBalance
    const oppBalance = Opponent.totalBalance
    const hostNewBalance = hostBalance + amountToPay
    const oppNewBalance = oppBalance + amountToPay

    const hostPoints = betDetails.points.host
    const oppPoints = betDetails.points.opponent

    if ( hostPoints < oppPoints ) {

        try {
            
            const updatedWinner = await User.findOneAndUpdate({ teamId: opponentId }, { totalBalance: oppNewBalance })
            const updatedBetDetails = await Head.findByIdAndUpdate({ _id: betid }, { winner: { winnerId: opponentId, winAmount: amountToPay }, betStatus: { code: 1000, message: "Bet settled" } })
            
            req.flash('success', 'Opponent Paid')
            res.redirect(`/dev/${event}/heads`)

        } catch (error) {
            console.log(error)
            req.flash('success', 'Bet Not Settled')
            res.redirect(`/dev/${event}/heads`)
            
        } 


    } else if ( hostPoints > oppPoints ) {

        try {
            
           const updatedWinner = await User.findOneAndUpdate({ teamId: hostId }, { totalBalance: hostNewBalance })
           const updatedBet = await Head.findByIdAndUpdate({ _id: betid }, { winner: { winnerId: hostId, winAmount: amountToPay }, betStatus: { code: 1000, message: "Bet settled" } }) 

           req.flash('success', 'Host Paid')
           res.redirect(`/dev/${event}/heads`)


        } catch (error) {
            console.log(error)
            req.flash('success', 'Bet Not Settled')
            res.redirect(`/dev/${event}/heads`)
        }

    } else {

        try {
             
            const hostCompensation =  entryAmount + hostBalance
            const oppCompensation = entryAmount + oppBalance

            const newHost = await User.findOneAndUpdate({ teamId: hostId }, { totalBalance: hostCompensation  })
            const newOpp = await User.findOneAndUpdate({ teamId: hostId }, { totalBalance: oppCompensation  })
            const updatedBet = await Head.findByIdAndUpdate({ _id: betid }, { winner: { winnerId: 'Draw', winAmount: entryAmount }, betStatus: { code: 1000, message: "Bet settled" } })

            req.flash('success', 'Both users Compensated')            
            res.redirect(`/dev/${event}/heads`)


        } catch (error) {
           console.log(error)
           req.flash('success', 'Bet Not Settled')
           res.redirect(`/dev/${event}/heads`)
            
        }


    }

}

const getDevParties = async (req, res) => {
    const event = req.params.id
    const currentParties = await Party.find({ event: event })
    
    res.render('devparties', { parties: currentParties, event: event })
}

const getDevParty = async (req, res) => {

    const gameweek = req.params.id
    const partyId = req.params.party
    const party = await Party.findOne({ _id: partyId })
    
    const host = party.hostId
    const hostDetails = await User.findOne({ teamId: host })
    const user = req.user

    const allPlayers = await User.find()
    const playerArray = party.players

    //DEV CHANGES
    const playersInParty = []
    const detailsArray = []
    for (let i = 0; i < playerArray.length; i++) {
        playersInParty.push(allPlayers.find((player) => {
             return player.teamId == playerArray[i]
        }))
    }

    playersInParty.forEach((user) => {
       const teamid = user.teamId
       const team = user.teamName  
       const pointsObject = user.points.find((oneObject) => {
           return oneObject.gameweek == gameweek 
       })

       if (!pointsObject) {
           
           detailsArray.push({ teamId: teamid, teamName: team, points: 0 })
       } else {

           const eventpoints = pointsObject.points

           detailsArray.push({ teamId: teamid, teamName: team, points: eventpoints })
       }
    })

    // SORT DETAILS ARRAY
     detailsArray.sort((a, b) => b.points - a.points)
     const first = detailsArray[0]
     const second = detailsArray[1] 
     const third = detailsArray[2]  || { teamId: 'none', teamName: 'none' } 

    // WINNERS CALCULATIONS
    const totalPlayers = playerArray.length

    const calculateWinner = (party, totalPlayers) => {
       const entryAmount = party.amount
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
    const winner = await calculateWinner(party, totalPlayers)



    res.render('devParty', {messages: req.flash('success'), event: gameweek, Party: party, winners: winner, firstObject: first, secondObject: second, thirdObject: third, host: hostDetails, players: detailsArray })

}

const updateDevParty = async (req, res) => {
       
    const { first, second, third, firstId, secondId, thirdId, firstteam, secondteam, thirdteam } = req.body
    const partyId = req.params.party
    const event = req.params.id
    const winnerObject = {
             first: { teamId: firstId, teamName: firstteam, amount: first },
            second: { teamId: secondId, teamName: secondteam, amount: second },
             third: { teamId: thirdId, teamName: thirdteam, amount: third } 
    }
    
      try {
          
        const updatedParty = await Party.findByIdAndUpdate({ _id: partyId }, { winners: winnerObject  })

        req.flash('success', 'Party details Updated') 
        res.redirect(`/dev/${event}/party/${partyId}`)

      } catch (error) {
        console.log(error)

        req.flash('success', 'Error Updating Party Details')
        res.redirect(`/dev/${event}/party/${partyId}`)   
      }
          
    }

    const settleDevParty = async (req, res) => {

        const { partyid } = req.body
        const event = req.params.id
        const partyDetails = await Party.findOne({ _id: partyid })
        const firstId = partyDetails.winners.first.teamId
        const secondId = partyDetails.winners.second.teamId
        const thirdId = partyDetails.winners.third.teamId
        const firstAmount = partyDetails.winners.first.amount
        const secondAmount = partyDetails.winners.second.amount
      
        const first = await User.findOne({ teamId: firstId })
        const second = await User.findOne({ teamId: secondId})
        const firstBalance = first.totalBalance
        const secondBalance = second.totalBalance
        const firstNewBalance = firstBalance + firstAmount
        const secondNewBalance = secondBalance + secondAmount
        
          
        if ( thirdId == 'none' ) {
    
            // PARTY HAS ONLY TWO PLAYERS
     try {
              
                
                 const uptFirst = await User.findOneAndUpdate({ teamId: firstId }, { totalBalance: firstNewBalance })
                 const uptSecond = await User.findOneAndUpdate({ teamId: secondId }, { totalBalance: secondNewBalance })
                 const upParty = await Party.findByIdAndUpdate({ _id: partyid}, { betStatus: { code: 1000, message: "Bet settled" }  })
                 
                 req.flash('success', 'Bet Settled for 2 player Party')
                 res.redirect(`/dev/${event}/party/${partyid}`)
    
              } catch (error) {
                    console.log(error)
                    req.flash('success', 'Error updating All the Target documents')
                    res.redirect(`/dev/${event}/party/${partyid}`)
              }
             
        } else {
            
            // SETTLE A THREE AND ABOVE PLAYER PARTY
    
            const thirdAmount = partyDetails.winners.third.amount
            const third = await User.findOne({ teamId: thirdId })
            const thirdBalance = third.totalBalance
            const thirdNewBalance = thirdBalance + thirdAmount
    
            try {
                
                const uptFirst = await User.findOneAndUpdate({ teamId: firstId }, { totalBalance: firstNewBalance })
                const uptSecond = await User.findOneAndUpdate({ teamId: secondId }, { totalBalance: secondNewBalance })
                const uptThird = await User.findOneAndUpdate({ teamId: thirdId }, { totalBalance: thirdNewBalance })
                const upParty = await Party.findByIdAndUpdate({ _id: partyid}, { betStatus: { code: 1000, message: "Bet settled" } })
    
                req.flash('success', 'Bet Settled for above 2 Players party')
                res.redirect(`/dev/${event}/party/${partyid}`)
            } catch (error) {
                    console.log(error)
                    req.flash('success', 'Error updating All the Target documents')
                    res.redirect(`/dev/${event}/party/${partyid}`)
            }
    
    
        }
    }

    const deleteDepHeads = async (req, res) => {
    
        const { event } = req.body

        try {

            const updatedHeads = await Head.deleteMany( { "betStatus.code": 100 } )
    
            res.redirect(`/dev/${event}`)
            
        } catch (error) {

            req.flash('error', 'Delete Request Failed')
            res.redirect(`/dev/${event}`)
            
        }
        
      
    
    }

    const deleteDepParties =  async (req, res) => {

        const { event } = req.body
        
        try {

            const updatedParties = await Party.deleteMany( { "betStatus.code": 100 } )
            res.redirect(`/dev/${event}`)
        
        } catch (error) {
            
            req.flash('error', 'Delete Request Failed')
            res.redirect(`/dev/${event}`)
            
        }

        
    }

    const getDevWithdraws = async (req, res) => {
        const event = req.params.id
        const withdraws = await Transactions.find({ tranx_type: 'Withdraw' })

        res.render('devwithdraws', { gameweek: event, Transactions: withdraws, messages: req.flash('error') })
    }

    const patchDevWithdraws = async (req, res) => {

        const event = req.params.id
        const { tranxid } = req.body

        try {

            const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxid }, { $set: { status: 'settled' } })
            req.flash('error', 'Transaction Updated')
            res.redirect(`/dev/${event}/withdraws`)
            
        } catch (error) {

            req.flash('error', 'Update Failed')
            res.redirect(`/dev/${event}/withdraws`)
            console.log('MongoDB Access Errors')
            
        }
    }



module.exports = {
    getDev,
    getDevConsole,
    getDevUsers,
    patchDevUsers,
    getDevHeads,
    updateDevHeads,
    settleDevHeads,
    getDevParties,
    getDevParty,
    updateDevParty,
    settleDevParty,
    deleteDepHeads,
    deleteDepParties,
    getDevWithdraws,
    patchDevWithdraws
}
