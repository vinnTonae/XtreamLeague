require('dotenv').config()

const { caseInSwitch } = require('../controllers/test')
const User = require('../models/xtreamUsers')
const Party = require('../models/party')
const Party26 = require('../models/party26')
const ObjectId = require('mongoose').Types.ObjectId
const fetch = require('node-fetch')
const { proxyInstance } = require('../controllers/test')

const postJoinParty = async (req, res) => {

    const { id } = req.body
    const newId = id.split(' ').join('')

    if (ObjectId.isValid(newId)) {

        const party = await Party26.findOne({ _id: newId })

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

    try {


        const partyDetails = await Party26.findOne({ _id: partyId })
        const event = partyDetails.event
        const host = partyDetails.hostId
        const hostDetails = await User.findOne({ teamId: host })
        const user = req.user

        const allPlayers = await User.find()
        const playerArray = partyDetails.players

        const detailsArray = []
        const playersInParty = []
        for (let i = 0; i < playerArray.length; i++) {
            playersInParty.push(allPlayers.find((player) => {
                return player.teamId == playerArray[i]
            }))
        }

        playersInParty.forEach((user) => {
            const teamid = user.teamId
            const team = user.teamName
            const pointsObject = user.points.find((oneObject) => {
                return oneObject.gameweek26 == event
            })

            if (!pointsObject) {

                detailsArray.push({ teamId: teamid, teamName: team, points: 0 })
            } else {

                const eventPoints = pointsObject.points

                detailsArray.push({ teamId: teamid, teamName: team, points: eventPoints })
            }
        })
        // Sort DETAILS ARRAY

        detailsArray.sort((a, b) => b.points - a.points)

        const firstWinner = detailsArray[0]
        const secondWinner = detailsArray[1] || { teamId: 'none', teamName: 'none', points: 0 }
        const thirdWinner = detailsArray[2] || { teamId: 'none', teamName: 'none', points: 0 }


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

            if (totalPlayers <= 5) {

                //    TODO: ONLY NUMBER ONE WINS

                first = Math.floor((entryAmount * totalPlayers) * 0.85)
                second = 0
                third = 0
                return [first, second, third]


            } else if (6 <= totalPlayers && totalPlayers <= 10) {

                // Todo: ONLY TOP 2 PLAYERS EARN

                const amountToSpread = Math.floor((entryAmount * totalPlayers) * 0.8)

                if (No1 == No2 && No2 == No3) {

                    const equalShare = Math.floor(amountToSpread / 3)

                    first = equalShare
                    second = equalShare
                    third = equalShare

                    return [first, second, third]

                } else if (No1 == No2) {

                    const topTwoAmount = Math.floor((amountToSpread / 2))

                    first = topTwoAmount
                    second = topTwoAmount
                    third = 0

                    return [first, second, third]

                } else if (No2 == No3) {

                    const topOneAmount = Math.floor(amountToSpread * 0.5)
                    const topTwoTie = Math.floor(amountToSpread * 0.25)

                    first = topOneAmount
                    second = topTwoTie
                    third = topTwoTie

                    return [first, second, third]

                } else {

                    first = Math.floor(amountToSpread * 0.6)
                    second = Math.floor(amountToSpread * 0.4)
                    third = 0

                    return [first, second, third]

                }



            } else if (totalPlayers > 10) {

                //  TODO: TOP 3 PLAYERS TO EARN

                const amountToSpread = Math.floor((entryAmount * totalPlayers) * 0.8)

                if (No1 == No2 && No2 == No3) {

                    const equal = Math.floor(amountToSpread / 3)

                    first = equal
                    second = equal
                    third = equal

                    return [first, second, third]

                } else if (No1 == No2) {

                    const topOneGet = Math.floor((amountToSpread * 0.85) / 2)

                    first = topOneGet
                    second = topOneGet
                    third = Math.floor(amountToSpread * 0.15)

                    return [first, second, third]

                } else if (No2 == No3) {

                    first = Math.floor(amountToSpread * 0.5)
                    second = Math.floor(amountToSpread * 0.25)
                    third = Math.floor(amountToSpread * 0.25)

                    return [first.second, third]

                } else if (No1 > No2 && No2 > No3) {

                    first = Math.floor(amountToSpread * 0.6)
                    second = Math.floor(amountToSpread * 0.25)
                    third = Math.floor(amountToSpread * 0.15)

                    return [first, second, third]

                }

            }
        }
        const winner = calculateWinner(partyDetails, totalPlayers, firstWinner, secondWinner, thirdWinner)

        const toWin = totalPlayers < 5 ? 'NO.1' : totalPlayers < 10 ? 'Top 2' : 'Top 3'


        res.render('party', { userData: user, winners: winner, firstObject: firstWinner, secondObject: secondWinner, thirdObject: thirdWinner, toWin: toWin, host: hostDetails, party: partyDetails, players: detailsArray })


    } catch (error) {

        req.flash('success', 'Server Error!! Try again Later')
        res.redirect('/parties')
        console.log('MongoDB Access Errors')
    }

}

const patchConfirmParty = async (req, res) => {
    const { betid } = req.body
    const player = req.user
    const playerTeamId = player.teamId
    const playerId = player._id

    try {


        const partyDetails = await Party26.findOne({ _id: betid })
        const partyEvent = partyDetails.event
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



        if (partyStatus.code == 100 && playerAlreadyExists() === false) {
            //updating both host and player totalBalances
            if (playerBalance < entryFee) {

                req.flash('error', 'You have Insufficient Funds to join Party')
                res.redirect('/deposit')

            } else if (hostBalance < entryFee) {

                req.flash('error', 'The Host has Insufficient Funds')
                res.redirect('/main')

            } else {

                try {
                    const newHostBalance = hostBalance - entryFee
                    const newPlayerBalance = playerBalance - entryFee
                    const updatedHost = await User.findByIdAndUpdate({ _id: hostDetails._id }, { $set: { totalBalance: newHostBalance } })
                    const updatedPlayer = await User.findByIdAndUpdate({ _id: playerId }, { $set: { totalBalance: newPlayerBalance } })
                    const updatedParty = await Party26.findByIdAndUpdate({ _id: betid }, { $set: { betStatus: { code: 200, message: 'Party is now Active' } } })
                    const newUpdatedParty = await Party26.findByIdAndUpdate({ _id: betid }, { $addToSet: { players: playerTeamId } })

                    req.flash('success', `Successfully Joined Party in GW${partyEvent}`)
                    res.redirect(`/parties/${partyEvent}`)

                } catch (error) {
                    console.log(error)
                    req.flash('error', 'Server Error!! Try again ')
                    res.redirect('/main')
                }
            }


        } else if (partyStatus.code == 200 && playerAlreadyExists() === false) {
            //  update only the player joining
            if (playerBalance < entryFee) {

                req.flash('error', 'You have Insufficient Funds')
                res.redirect('/main')
            } else {

                try {

                    const newPlayerBalance = playerBalance - entryFee
                    const updatedPlayer = await User.findByIdAndUpdate({ _id: playerId }, { $set: { totalBalance: newPlayerBalance } })
                    const updatedParty = await Party26.findByIdAndUpdate({ _id: betid }, { $addToSet: { players: playerTeamId } })

                    req.flash('success', `You have successfully joined Party in GW${partyEvent}`)
                    res.redirect(`/parties/${partyEvent}`)

                } catch (error) {

                    req.flash('error', 'Server Error!! Try Again')
                    res.redirect('/main')
                }

            }


        } else if (partyStatus.code == 400) {


            req.flash('error', `Gameweek ${partyEvent} joining Time has Expired`)
            res.redirect('/main')

        } else if (playerAlreadyExists() === true) {

            req.flash('error', 'You have already Joined this party')
            res.redirect('/main')
        }

    } catch (error) {

        req.flash('error', 'Server Error!! Try Again later')
        res.redirect('/main')
        console.log('MongoDB Access Errors')

    }


}

const postBetParty = (req, res) => {

    const { betType, event, amount } = req.body
    const hostId = req.user.teamId


    const newParty = new Party26({
        betType,
        hostId,
        event,
        amount,
        players: [hostId]

    }).save().then((party) => {

        const id = party._id
        res.redirect(`/party/${id}`)

    })
        .catch((error) => {

            req.flash('error', 'Server Error!! Party not created')
            res.redirect('/main')
            console.log('MongoDB Access Errors')
        })

}

const getBetParty = async (req, res) => {

    const userData = req.user
    const fplBaseUrl = process.env.FPLBASE

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
        const currentPhase = caseInSwitch(month + 1)
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

            // TODO: REMEMBER TO RETURN BACK TO (bootstrapDeadline - datenow) after FPL UPDATES CALENDER YEAR 

                const customDiffMs = ( dateNow - bootstrapDeadline ) + 86400000

                dataArray.push([gameweek, event.deadline_time, customDiffMs])

            })

            const latestGameweek = dataArray.find((event) => {
                return event[2] > 0
            })
            const msToDeadline = latestGameweek[2]
            const daysLeft = Math.floor((msToDeadline / 86400000))
            const eventObject = [latestGameweek[0], daysLeft]


            const alert = 'Choose Gameweek'
            res.render('bet-party', { user: userData, gameweeks: dataArray, countdown: eventObject, message: alert, phase: currentPhase })
        } else {
            const alert = 'PL is currently in Pre-Season'
            const dataArray = 'null'
            const eventObject = 'null'
            res.render('bet-party', { user: userData, gameweeks: dataArray, countdown: eventObject, message: alert, phase: currentPhase })
        }


    } catch (error) {
        req.flash('error', 'Server Error!! Try again Later')
        res.redirect('/main')
        console.log('PROXY DEPRICATION ERRORS')

    }


}

const getParties = async (req, res) => {

    const userDetails = req.user
    const userTeamId = req.user.teamId

    try {

        const partyBetsHost = await Party26.find({ hostId: userTeamId })   // All parties this User has hosted
        const allParties = await Party26.find()

        const partyOppArray = allParties.filter((party) => {         // All parties this User was invited

            return party.players.some(playerId => playerId == userTeamId) && party.hostId !== userTeamId
        })
        // filter for gameweek 1 for parent route

        const partyHost = partyBetsHost.filter(bet => bet.event == 1)
        const partyOpp = partyOppArray.filter(bet => bet.event == 1)
        const currentPartiesArray = partyHost.concat(partyOpp)
        const events = []
        const chunk = 38
        for (let i = 0; i < chunk; i++) {
            events.push(i + 1)
        }
        const currentGameweek = 1
        res.render('parties', { user: userDetails, Parties: currentPartiesArray, gameweeks: events, GW: currentGameweek, messages: req.flash('success') })


    } catch (error) {

        req.flash('error', 'Server Error!! Try again Later')
        res.redirect('/main')
        console.log('MongoDB Access Error')

    }

}

const getPartiesEvents = async (req, res) => {

    const eventParam = req.params.event
    const userDetails = req.user
    const userTeamId = req.user.teamId

    try {

        const partyBetsHost = await Party26.find({ hostId: userTeamId })   // All parties this User has hosted
        const allParties = await Party26.find()

        const partyOppArray = allParties.filter((party) => {         // All parties this User was invited

            return party.players.some(playerId => playerId == userTeamId) && party.hostId !== userTeamId
        })
        //    Filter bets for each gameweek
        const partyHost = partyBetsHost.filter(bet => bet.event == eventParam)
        const partyOpp = partyOppArray.filter(bet => bet.event == eventParam)
        const currentPartiesArray = partyHost.concat(partyOpp)
        const events = []
        const chunk = 38
        for (let i = 0; i < chunk; i++) {
            events.push(i + 1)
        }
        const currentGameweek = eventParam

        res.render('parties', { user: userDetails, Parties: currentPartiesArray, gameweeks: events, GW: currentGameweek, messages: req.flash("success") })


    } catch (error) {

        req.flash('success', `Server Error!!. Cant Access GW${eventParam} Parties`)
        res.redirect('/parties')
        console.log('MongoDB Access Errors')
    }

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
