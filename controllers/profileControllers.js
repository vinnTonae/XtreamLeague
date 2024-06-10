const User = require('../models/xtreamUsers')
const Head = require('../models/head2head')
const Party = require('../models/party')
const Transactions = require('../models/transactions')
const axios = require('axios')


const getTransactions = async (req, res) => {
    const reqUserId = req.user._id
    const transactions = await Transactions.find({ userId: reqUserId })  
   
   res.render('transactions', { transaction: transactions  })
}

const getSearch = (req, res) => {
    res.render('search')
}

const patchUserId = async(req, res) => {
    const id = req.user._id
    const { teamid } = req.body
    const axiosOptions = {
        "Content-Type": 'application/json',
        "Accept": 'application/json'
    }
    const baseUrl = `https://fantasy.premierleague.com/api/entry/${teamid}/`
    const response = await axios.get(baseUrl, axiosOptions)
    const data = await response.json()
    const favPlTeam = data.favourite_team
    const manager = `${data.player_first_name} ${data.player_last_name}`
    const team = data.name
    
   
    
    const updatedUser = User.findByIdAndUpdate( { _id: id }, { teamId: teamid, managerName: manager, teamName: team, favTeam: favPlTeam } )
    .then(() => {
       req.flash('error', 'User Updated')
       res.redirect('/main')
    })
    .catch((error) => {
         console.log(error)
         res.redirect('/main')
         })

}

const postRegister = async (req, res) => {
    const id = req.body.id
    const baseUrl = `https://fantasy.premierleague.com/api/leagues-classic/${id}/standings/`
    const axiosOptions = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    const results = await axios.get(baseUrl, axiosOptions)
    console.log(`results: ${results} `)
    const data = await results.json()
    const teams = data.standings.results 
    res.render('register', { managers: teams })    
}

const getMain = async (req, res) => {
    
    const xUser = req.user
    const userTeamId = xUser.teamId
    const partiesHosting = await Party.find({ hostId: userTeamId })
    const allParties = await Party.find()
    const invitedParties = allParties.filter((party) => {

           return party.players.some( player => player == userTeamId ) === true
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

const getTopDollar = (req, res) => {
    res.render('topearners')
}


module.exports = {
    getTransactions,
    getSearch,
    patchUserId,
    postRegister,
    getMain,
    getTopDollar
}