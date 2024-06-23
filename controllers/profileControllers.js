const User = require('../models/xtreamUsers')
const Head = require('../models/head2head')
const Party = require('../models/party')
const Transactions = require('../models/transactions')
const { HttpsProxyAgent } = require('https-proxy-agent')
const fetch = require('node-fetch')
const { proxyInstance } = require('../controllers/test')

const getTransactions = async (req, res) => {
    const reqUserId = req.user._id
    const transactions = await Transactions.find({ userId: reqUserId })  
   
   res.render('transactions', { transaction: transactions  })
}

const getSearch = (req, res) => {
    res.render('search', { messages: req.flash('error') })
}

const patchUserId = async (req, res) => {
    const id = req.user._id
    const { teamid } = req.body
    const options = {
        method: 'GET',
        agent: new HttpsProxyAgent(proxyInstance),
        accept: 'application/json'
    }
    const baseUrl = `https://fantasy.premierleague.com/api/entry/${teamid}/`
    const response = await fetch(baseUrl, options)
    const data = await response.json()
    const favPlTeam = data.favourite_team
    const manager = `${data.player_first_name} ${data.player_last_name}`
    const team = data.name
    
    // CHECK IF TEAM WAS ALREADY SELECTED
    const teamExists = await User.findOne({ teamId: teamid })

    if ( teamExists ) {

        req.flash('error', 'That FPL Team was Already Selected!!')
        res.redirect('/main')
    } else {

       try {

        const updatedUser = await User.findByIdAndUpdate( { _id: id }, { $set: { teamId: teamid, managerName: manager, teamName: team, favTeam: favPlTeam } })
        req.flash('error', 'Team Updated')
        res.redirect('/main')
        
       } catch (error) {
        console.log(error)
        req.flash('error', 'Server Error!! Try again Later')
        res.redirect('/main')
        
       }

    }
   

}

const postRegister = async (req, res) => {
    const id = req.body.id
    
    if (!id) {
        req.flash('error', 'Please Enter a League ID' )
        res.redirect('/search')
    } else {
    
    try {

    const baseUrl = `https://fantasy.premierleague.com/api/leagues-classic/${id}/standings/`
    const options = {
        method: 'GET',
         agent: new HttpsProxyAgent(proxyInstance),
        accept: 'application/json'
    }    
    const results = await fetch(baseUrl, options)
    const data = await results.json()
    const teams = data.standings.results 
    res.render('register', { managers: teams }) 
        
    } catch (error) {
        req.flash('error', 'Bad Request!!..That League ID is Invalid')
        res.redirect('/search')

    }    

     
}
}

const getMain = async (req, res) => {
    
    const xUser = req.user
    const userTeamId = xUser.teamId
    const partiesHosting = await Party.find({ hostId: userTeamId })
    const allParties = await Party.find()
    const invitedParties = allParties.filter((party) => {

           return party.players.some( player => player == userTeamId ) && party.hostId !== userTeamId
    })
    const headHost = await Head.find({ hostId: userTeamId })
    const invitedHost = await Head.find({ opponentId: userTeamId })

    const filHeadHost = headHost.filter((bet) => { return bet.betStatus.code == 100 || bet.betStatus.code == 200  })
    const filHeadInvited = invitedHost.filter((bet) => { return bet.betStatus.code == 100 || bet.betStatus.code == 200 })
    const filPartyInvited = invitedParties.filter((party) => { return party.betStatus.code == 100 || party.betStatus.code == 200 }) 
    const filPartyHost = partiesHosting.filter((party) => { return party.betStatus.code == 100 || party.betStatus.code == 200  })

    const headCounts =  filHeadHost.length + filHeadInvited.length
    
    const partyCount =  filPartyInvited.length + filPartyHost.length
 

    res.render('main', { user: xUser, head: headCounts, party: partyCount, messages: req.flash('error') })
}

const getTopDollar = async (req, res) => {

    const users = await User.find({ totalEarned: { $gt: 15 } })
    const Sorted = users.sort((a, b) => b.totalEarned - a.totalEarned)
    const limitedSort = Sorted.slice(0, 20)

    res.render('topearners', { Earners: limitedSort })
}

const getBootstrap = async (req, res) => {
    const baseUrl = "https://fantasy.premierleague.com/api/bootstrap-static"
    const options = {
        method: 'GET',
        agent: new HttpsProxyAgent(proxyInstance),
        accept: 'application/json'
    }
    
    const events = await fetch(baseUrl, options)
    const data = await events.json()
    const phases = data.phases

    res.send(phases)

}

module.exports = {
    getTransactions,
    getSearch,
    patchUserId,
    postRegister,
    getMain,
    getTopDollar,
    getBootstrap
}