require('dotenv').config()

const User = require('../models/xtreamUsers')
const Head = require('../models/head2head')
const Party = require('../models/party')
const Transactions = require('../models/transactions')
const fetch = require('node-fetch')
const { HttpsProxyAgent } = require('https-proxy-agent')
const { proxyInstance } = require('../controllers/test')



const getDev = async (req, res) => {
    const array = []
    const chunk = 38
    const fplBaseUrl = process.env.FPLBASE

    try {
             
     const baseUrl = `${fplBaseUrl}/bootstrap-static`
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
            const eventStatus = event.data_checked
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

    try {

        const allUsers = await User.find()
        const dev = await User.findOne({ teamId: '571043' })

        const updatedUsers = allUsers.filter((user) => {
            return user.points.some((pointsObject) => { return pointsObject.gameweek == id })
    })

    // TODO: USERTOTALBAL

    const totalUserBal = allUsers.reduce((currentTotal, user) => {
           return user.totalBalance + currentTotal
    }, 0)

    const userTotal = totalUserBal - dev.totalBalance  //! USERTOTAL 



    // TODO: REDUCE DEPS AND WITHDRAWS
    
    const completedDepos = await Transactions.find({ tranx_type: 'Deposit', status: 'complete' })
    const completedWiths = await Transactions.find({ tranx_type: 'Withdraw', status: 'passed' })
    
    const totalDepos = completedDepos.reduce(( currentTotal, tranx ) => {
           
            return tranx.amount + currentTotal 
    }, 0)

    const totalWiths = completedWiths.reduce(( currentTotal, tranx ) => {

          return tranx.amount + currentTotal
    }, 0)


    
    const depWithdraws = await Transactions.find({ tranx_type: 'Withdraw', status: 'waiting' })
    const depWithCount = depWithdraws.length

    const deprecatedTranx = await Transactions.find({ tranx_type: 'Deposit', userId: 'failed' })
    const depTranxCount = deprecatedTranx.length
    const pendingDeposits = await Transactions.find({ status: 'pending' })
    const pendingCounts = pendingDeposits.length

    
    const withdraws = await Transactions.find({ tranx_type: 'Withdraw' })
    const withdrawCount = withdraws.length

    const updatedWithdraws = withdraws.filter((tranx) => {
            return tranx.status == 'settled'
    })
    const updatedWithCount = updatedWithdraws.length    

    const updatedCount = updatedUsers.length
    const userCount = allUsers.length

    // TODO: BETS & PROFITS

    const currentHeads = await Head.find({ event: id })
    const currentParties = await Party.find({ event: id })

    // TODO: BETS

    const headCount = currentHeads.length 
    const partyCount = currentParties.length
    const currentActiveHeads = currentHeads.filter((bet) => {
             return bet.betStatus.code !== 100
    })
    const currentActiveParties = currentParties.filter((party) => {
             return party.betStatus.code !== 100
    })
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

    // TODO: PROFITS 

    const profitHeadArray = []
    const profitPartyArray = []

    currentActiveHeads.forEach((bet) => {
        const profit = Math.floor( (bet.amount * 2) * 0.15 )
        profitHeadArray.push(profit)
    })

    const totalProfHeads =  profitHeadArray.reduce((current, value) => { return value + current }, 0)


    currentActiveParties.forEach((party) => {
        const totalPlayers = party.players.length
        const partyAmount = party.amount
        const profit = Math.floor( ( totalPlayers * partyAmount ) * 0.15 )
        profitPartyArray.push(profit)
    })

    const totalProfParty = profitPartyArray.reduce((current, value) => {
        return value + current
    }, 0)
    
    const totalProfit = totalProfParty + totalProfHeads
                            


    const depArray = [depHeadCount, depPartyCount, depTranxCount, depWithCount, pendingCounts]
    const reducedArray = [totalDepos, totalWiths, userTotal, totalProfHeads, totalProfParty, totalProfit]

    res.render('devconsole', { event: id, messages: req.flash('error'), finance: reducedArray, withdraws: withdrawCount, heads: headCount, party: partyCount, users: userCount, updated: updatedCount, updatedWithdraws: updatedWithCount, updatedHead: updatedHeadCount, updatedParty: updatedPartyCount, deps: depArray })

        
    } catch (error) {

        req.flash('error', 'MongoDB Access Errors')
        console.log(error)
        res.redirect('/main')
        
    }

    
}

const getDevUsers = async (req, res) => {
    
    const event = req.params.id
    
    try {

        
    const allUsers = await User.find()
    
    res.render('xusers', { users: allUsers, event: event, messages: req.flash('success') })

        
    } catch (error) {

        req.flash('error', 'MongoDB Access Errors')
        res.redirect(`/dev/${event}`)
        
    }

}

const patchDevUsers = async (req, res) => {

    const event = req.params.id
    const { userid } = req.body
  
    const userToUpdate = await User.findOne({ _id: userid })
    const teamId = userToUpdate.teamId
    
    try {

        
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
        console.log('POINTS NOT FOUND')

    }
        
    } catch (error) {

        req.flash('error', 'PROXY ERRORS')
        res.redirect(`/dev/${event}`)
        console.log('PROXY IMENASWA')
        
    }

   
   
}

const getDevUser = async (req, res) => {

    const event  = req.params.id
    const userid = req.params.userId
    try {
        
        const userDetails = await User.findOne({ _id: userid })

        // TODO: ALL TRANSACTIONS
        const mpesaDeposits = await Transactions.find({ method: 'mpesa', userId: userid, tranx_type: 'Deposit'  })
        const paypalDeposits = await Transactions.find({ method: 'paypal', userId: userid, tranx_type: 'Deposit' })

        const mpesaWithdraws = await Transactions.find({ method: 'mpesa', userId: userid, tranx_type: 'Withdraw' })
        const paypalWithdraws = await Transactions.find({ method: 'paypal', userId: userid, tranx_type: 'Withdraw' })

        const mpesaDepcounts = mpesaDeposits.length
        const paypalDepcounts = paypalDeposits.length
        const mpesaWithcounts = mpesaWithdraws.length
        const paypalWithcounts = paypalWithdraws.length

        const mpesaDepTotal = mpesaDeposits.reduce((current, tranx) => {
              return tranx.amount + current
        }, 0)

        const paypalDepTotal = paypalDeposits.reduce((current, tranx) => {
              return tranx.amount + current
        }, 0)

        const totalDeposits = mpesaDepTotal + paypalDepTotal

        const mpesaWithTotal = mpesaWithdraws.reduce((current, tranx) => {
              return tranx.amount + current
        }, 0)

        const paypalWithTotal = paypalWithdraws.reduce((current, tranx) => {
              return tranx.amount + current
        }, 0)

        const totalWithdraws = mpesaWithTotal + paypalWithTotal

        // TODO: BETS PARTICIPATED
        
        const userteamId = userDetails.teamId
        const headsPlayedHost = await Head.find({ hostId: userteamId })
        const headsPlayedOpp = await Head.find({ opponentId: userteamId })
        const TotalHeadCounts = headsPlayedHost.length + headsPlayedOpp.length
        
        const allParties = await Party.find()

        const partiesPlayed =  allParties.filter((party) => {
            return party.players.some((player) => { return player == userteamId})
        })
        const TotalPartiesCount = partiesPlayed.length

        const Bets = [TotalHeadCounts, TotalPartiesCount ]
        const Amounts = [mpesaDepTotal, paypalDepTotal, mpesaWithTotal, paypalWithTotal, totalDeposits, totalWithdraws ]
        const Counts = [mpesaDepcounts, paypalDepcounts, mpesaWithcounts, paypalWithcounts ] 

        res.render('userDetails', { user: userDetails, gameweek: event, tranxCount: Counts, amounts: Amounts, betCount: Bets })

    } catch (error) {

        req.flash('error', 'MongoDB Access Errors')
        res.redirect(`/dev/${event}`)      
    }
    
}

const getDevHeads = async (req, res) => {

    const event = req.params.id

    try {

        const allHeads = await Head.find({ event: event })

        res.render('devheads', { gameweek: event, heads: allHeads, messages: req.flash('success') })

        
    } catch (error) {

        req.flash('error', 'MongoDB Access Errors')
        res.redirect(`/dev/${event}`)
        
    }

    
}

const updateDevHeads = async (req, res) => {

    const event = req.params.id
    const { betid } = req.body
    
    try {

        const betDetails = await Head.findOne({ _id: betid })
        const hostId = betDetails.hostId
        const opponentId = betDetails.opponentId
        const Host = await User.findOne({ teamId: hostId })
        const Opponent = await User.findOne({ teamId: opponentId })

        const hostPointsObject = Host.points.find((eventObject) => {
            return eventObject.gameweek == event
        })

        const oppPointsObject = Opponent.points.find((eventObject) => {
            return eventObject.gameweek == event
        })
    
        const hostPoints = hostPointsObject.points 
        const oppPoints = oppPointsObject.points
    
        const updatedBet = await Head.findByIdAndUpdate({ _id: betid }, { points: { host: hostPoints, opponent: oppPoints  } })
    
        req.flash('success', 'Bet Updated')
        res.redirect(`/dev/${event}/heads`)
    
        
    } catch (error) {

        req.flash('success', 'Update Failed, MongoDB err')
        res.redirect(`/dev/${event}/heads`)
        console.log('MongoDB Update errors')
        
    }
   
}

const settleDevHeads = async (req, res) => {

    const event = req.params.id
    const { betid } = req.body

    try {

        const betDetails = await Head.findOne({ _id: betid })
    const entryAmount = betDetails.amount
    const amountToPay = Math.floor( (entryAmount * 2) * 0.85 )  
    const hostId = betDetails.hostId
    const opponentId = betDetails.opponentId
    const Host = await User.findOne( { teamId: hostId } )
    const Opponent = await User.findOne({ teamId: opponentId })
    const hostBalance = Host.totalBalance
    const oppBalance = Opponent.totalBalance
    const hostTotalEarned = Host.totalEarned
    const oppTotalEarned = Opponent.totalEarned
    const newHostEarned = hostTotalEarned + amountToPay
    const newOppEarned = oppTotalEarned + amountToPay
    const hostNewBalance = hostBalance + amountToPay
    const oppNewBalance = oppBalance + amountToPay

    const hostPoints = betDetails.points.host
    const oppPoints = betDetails.points.opponent

    if ( hostPoints < oppPoints ) {

        try {
            
            const updatedWinner = await User.findOneAndUpdate({ teamId: opponentId }, { $set: { totalBalance: oppNewBalance, totalEarned: newOppEarned } })
            const updatedBetDetails = await Head.findByIdAndUpdate({ _id: betid }, { $set: { winner: { winnerId: opponentId, winAmount: amountToPay }, betStatus: { code: 1000, message: "Bet settled" } } })
            
            req.flash('success', 'Opponent Paid')
            res.redirect(`/dev/${event}/heads`)

        } catch (error) {
            console.log(error)
            req.flash('success', 'Bet Not Settled')
            res.redirect(`/dev/${event}/heads`)
            
        } 


    } else if ( hostPoints > oppPoints ) {

        try {
            
           const updatedWinner = await User.findOneAndUpdate({ teamId: hostId }, { $set: { totalBalance: hostNewBalance, totalEarned: newHostEarned } })
           const updatedBet = await Head.findByIdAndUpdate({ _id: betid }, { $set: { winner: { winnerId: hostId, winAmount: amountToPay }, betStatus: { code: 1000, message: "Bet settled" } } }) 

           req.flash('success', 'Host Paid')
           res.redirect(`/dev/${event}/heads`)


        } catch (error) {
            console.log(error)
            req.flash('success', 'Bet Not Settled')
            res.redirect(`/dev/${event}/heads`)
        }

    } else {

        try {
            
            const compensated = Math.floor(entryAmount * 0.9)
            const hostCompensation =  compensated + hostBalance
            const oppCompensation = compensated + oppBalance

            const newHost = await User.findOneAndUpdate({ teamId: hostId }, { $set: { totalBalance: hostCompensation  } })
            const newOpp = await User.findOneAndUpdate({ teamId: opponentId }, { $set: { totalBalance: oppCompensation  } })
            const updatedBet = await Head.findByIdAndUpdate({ _id: betid }, { $set: { winner: { winnerId: 'Draw', winAmount: entryAmount }, betStatus: { code: 1000, message: "Bet settled" } } })

            req.flash('success', 'Both users Compensated')            
            res.redirect(`/dev/${event}/heads`)


        } catch (error) {
           console.log(error)
           req.flash('success', 'Bet Not Settled')
           res.redirect(`/dev/${event}/heads`)
            
        }


    }
        
    } catch (error) {
    
        req.flash('success', 'MongoDB Access Errors')
        res.redirect(`/dev/${event}/heads`)
        console.log('MongoDB Access Errors')
        
    }
   

}

const getDevParties = async (req, res) => {
    const event = req.params.id
    try {

        const currentParties = await Party.find({ event: event })
    
        res.render('devparties', { parties: currentParties, event: event, messages: req.flash('error')})
    
        
    } catch (error) {

        req.flash('error', 'Error Accessing Parties')
        res.redirect(`/dev/${event}`)
        console.log('MongoDB Access Errors')
        
    }
   
}

const getDevParty = async (req, res) => {

    const gameweek = req.params.id
    const partyId = req.params.party
    
    try {

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

     const firstWinner = detailsArray[0]
     const secondWinner = detailsArray[1] 
     const thirdWinner = detailsArray[2]  || { teamId: 'none', teamName: 'none', points: 0 } 

    // WINNERS CALCULATIONS
    const totalPlayers = playerArray.length

    const calculateWinner = (partyDetails, totalPlayers, firstWinner, secondWinner, thirdWinner) => {
        const entryAmount = partyDetails.amount
        let first = 0
        let second = 0
        let third = 0
        const No1 = firstWinner.points
        const No2 = secondWinner.points
        const No3 = thirdWinner.points

        if ( totalPlayers <= 3 ) {
                
            //    TODO: ONLY NUMBER ONE WINS

                first = Math.floor((entryAmount * totalPlayers) * 0.85 )
                second = 0
                third = 0 
               return [first, second, third]
            

        } else if ( 4 <= totalPlayers <= 10 )  {

            // Todo: ONLY TOP 2 PLAYERS EARN

             const amountToSpread = Math.floor( (entryAmount * totalPlayers) * 0.8 )

            if ( No1 == No2 && No2 == No3 ) {

                const equalShare = Math.floor( amountToSpread / 3 )
                
                first = equalShare
                second = equalShare
                third = equalShare
               
                return [ first, second, third ]

            } else if ( No1 == No2 ) {

                const topTwoAmount = Math.floor( ( amountToSpread / 2 ) )

                first = topTwoAmount
                second = topTwoAmount
                third = 0

                return [ first, second, third ]

            } else if ( No2 == No3 ) {

                const topOneAmount = Math.floor( amountToSpread * 0.5 )
                const topTwoTie = Math.floor( amountToSpread * 0.25  )

                first =  topOneAmount
                second = topTwoTie
                third = topTwoTie

                return [ first, second, third ]

            } else {

                first = Math.floor(amountToSpread * 0.6)
                second = Math.floor(amountToSpread * 0.4)
                third = 0

               return [first, second, third]

            }  



        } else if ( totalPlayers > 10 ) {

            //  TODO: TOP 3 PLAYERS TO EARN

            const amountToSpread = Math.floor( (entryAmount * totalPlayers) * 0.8 )

           if ( No1 == No2 && No2 == No3 ) {

              const equal = Math.floor( amountToSpread / 3 )

              first = equal
              second = equal
              third = equal

              return [ first, second, third ]

           } else if ( No1 == No2 ) {

               const topOneGet = Math.floor( ( amountToSpread * 0.85 ) / 2 )
               
               first = topOneGet
               second = topOneGet
               third = Math.floor( amountToSpread * 0.15 )

               return [ first, second, third ]

           } else if ( No2 == No3 ) {

              first = Math.floor( amountToSpread * 0.5 )
              second = Math.floor( amountToSpread * 0.25 )
              third = Math.floor( amountToSpread * 0.25 )

              return [ first. second, third ]

           } else {

             first = Math.floor(amountToSpread * 0.6)
             second = Math.floor(amountToSpread * 0.25)
             third = Math.floor(amountToSpread * 0.15)

            return [first, second, third] 

           }


            
        }
     }
     const winner = await calculateWinner(party, totalPlayers, firstWinner, secondWinner, thirdWinner)



    res.render('devParty', {messages: req.flash('success'), event: gameweek, Party: party, winners: winner, firstObject: first, secondObject: second, thirdObject: third, host: hostDetails, players: detailsArray })

        
    } catch (error) {

        req.flash('error', 'Error Accessing Party Details')
        res.redirect(`/dev/${gameweek}/party`)
        console.log('MongoDB Access Errors')
        
    }

    
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
          
        const updatedParty = await Party.findByIdAndUpdate({ _id: partyId }, { $set: { winners: winnerObject  } })

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
        const firstEarned = first.totalEarned
        const secondEarned = second.totalEarned
        const newFirstTotalEarned = firstEarned + firstAmount
        const newSecondTotalEarned = secondEarned + secondAmount

        const firstNewBalance = firstBalance + firstAmount
        const secondNewBalance = secondBalance + secondAmount
        
          
        if ( thirdId == 'none' ) {
    
            // PARTY HAS ONLY TWO PLAYERS
     try {
              
                
                 const uptFirst = await User.findOneAndUpdate({ teamId: firstId }, { $set: { totalBalance: firstNewBalance, totalEarned: newFirstTotalEarned } })
                 const uptSecond = await User.findOneAndUpdate({ teamId: secondId }, { $set: { totalBalance: secondNewBalance, totalEarned: newSecondTotalEarned } })
                 const upParty = await Party.findByIdAndUpdate({ _id: partyid}, { $set: { betStatus: { code: 1000, message: "Bet settled" }  } })
                 
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
            const thirdEarned = third.totalEarned
            const newThirdEarned = thirdEarned + thirdAmount
            const thirdNewBalance = thirdBalance + thirdAmount
    
            try {
                
                const uptFirst = await User.findOneAndUpdate({ teamId: firstId }, { $set: { totalBalance: firstNewBalance, totalEarned: newFirstTotalEarned } })
                const uptSecond = await User.findOneAndUpdate({ teamId: secondId }, { $set: { totalBalance: secondNewBalance, totalEarned: newSecondTotalEarned  } })
                const uptThird = await User.findOneAndUpdate({ teamId: thirdId }, { $set: { totalBalance: thirdNewBalance, totalEarned: newThirdEarned } })
                const upParty = await Party.findByIdAndUpdate({ _id: partyid}, { $set: { betStatus: { code: 1000, message: "Bet settled" } } })
    
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

    const deleteMpesaDeps = async (req, res) => {
    
        const { event } = req.body

        try {
            const deleteDeprDeposits = await Transactions.deleteMany({ userId: 'failed' })
    
            res.redirect(`/dev/${event}`)
            
        } catch (error) {

            req.flash('error', 'MongoDB error')
            res.redirect(`/dev/${event}`)
            
        }
       
    
        
    
    }

    const deleteWithdrawDeps = async (req, res) => {
        const { event } = req.body

        try {
            
            const deleteDeprWithdraws = await Transactions.deleteMany({ status: 'waiting' })

            res.redirect(`/dev/${event}`)

        } catch (error) {

            req.flash('error', 'MongoDB error')
            res.redirect(`/dev/${event}`)
        }
    }

  
    const getDevdeposits = async (req, res) => {
        const event = req.params.id
        try {
             
            const deposits = await Transactions.find({ tranx_type: 'Deposit' })

            res.render('devdeposits', { gameweek: event, Transactions: deposits, messages: req.flash('error') })

        } catch (error) {
            
            req.flash('error', 'MongoDB Access Errors')
            res.redirect(`/dev/${event}`)
            console.log(error)
        }
    }


    const updateDeposit = async (req, res) => {
        const event = req.params.id
        const { tranxid } = req.body

        try {
            
             const transaction = await Transactions.findOne({ _id: tranxid })
             const tranxAmount = transaction.amount
             const userId = transaction.userId
             const userToUpdate = await User.findOne({ _id: userId })
             const currentBalance = userToUpdate.totalBalance
             const newBalance = currentBalance + tranxAmount
             
             const updatedUser = await User.findByIdAndUpdate({ _id: userId }, { $set: { totalBalance: newBalance  } })

             const updatedTranx = await Transactions.findByIdAndUpdate({ _id: tranxid }, { $set: { status: 'complete' } })

             req.flash('error', 'User Account Credited')
             res.redirect(`/dev/${event}/deposits`)

        } catch (error) {

            req.flash('error', 'Error Updating User')
            res.redirect(`/dev/${event}/deposits`)
        }

    }

    const getDevWithdraws = async (req, res) => {
        const event = req.params.id
        try {

            const withdraws = await Transactions.find({ tranx_type: 'Withdraw' })

            res.render('devwithdraws', { gameweek: event, Transactions: withdraws, messages: req.flash('error') })
        
            
        } catch (error) {
             req.flash('error', 'MongoDB Access Errors')
             res.redirect(`/dev/${event}`)
             console.log(error)
        }
       
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
            console.log('mongoDB Access Errors')
            
        }
    }

    


module.exports = {
    getDev,
    getDevConsole,
    getDevUsers,
    patchDevUsers,
    getDevUser,
    getDevHeads,
    updateDevHeads,
    settleDevHeads,
    getDevParties,
    getDevParty,
    updateDevParty,
    settleDevParty,
    deleteDepHeads,
    deleteDepParties,
    deleteMpesaDeps,
    deleteWithdrawDeps,
    getDevdeposits,
    updateDeposit,
    getDevWithdraws,
    patchDevWithdraws
}
