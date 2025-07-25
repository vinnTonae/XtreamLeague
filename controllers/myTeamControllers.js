const { HttpsProxyAgent } = require('https-proxy-agent')
const fetch = require('node-fetch')
const { proxyInstance } = require('../controllers/test')
const User = require('../models/xtreamUsers')

const getOpponentId = async (req, res) => {
    const eventId = req.params.id
    const opponentId = req.params.opponent
    const fplBaseUrl = process.env.FPLBASE

    try {

        
    const baseUrl = `${fplBaseUrl}/entry/${opponentId}/event/${eventId}/picks/`
    const options = {
        method: 'GET',
        agent: new HttpsProxyAgent(proxyInstance), 
        accept: 'application/json'
    }
    const results = await fetch(baseUrl, options)
    console.log(results)
    const data = await results.json()
    const players = await data.picks
    const array = []
    for (let i = 0; i < players.length; i++) {
        array.push(players[i].element)
    }
    const baseUrl2 = `${fplBaseUrl}/bootstrap-static/`
    const bootstrap = await fetch(baseUrl2, options)
    const bootstrapAll  = await bootstrap.json()
    const playersAll = await bootstrapAll.elements
    const player = playersAll.find((element) => {
        return element.id === array[0]   
    })
    const teamPicked = []
    for (let i = 0; i < array.length; i++) {
        teamPicked.push(playersAll.find((element) => {
             return element.id === array[i]
        }))
    }

    // SLICE METHOD
    const firstEleven = teamPicked.slice(0, 11)
    const substitutes = teamPicked.slice(11, 15)

 
     const keeper = firstEleven.find((player) => {
         return player.element_type === 1 
     })
     const defenders = firstEleven.filter((player) => {
        return player.element_type === 2
     })
     const midfielders = firstEleven.filter((player) => {
        return player.element_type === 3
     })
     const strikers = firstEleven.filter((player) => {
        return player.element_type === 4
     })
     
     const dataArray = []
     const chunk = 38
     for ( let i = 0; i < chunk; i++ ) {
        dataArray.push(i + 1)
     }
    
     const gameweek = eventId
     const opponentDetails = await User.findOne({ teamId: opponentId })
     

    res.render('myteam', { array: dataArray, user: opponentDetails, data: opponentId , goalie: keeper, defs: defenders, mids: midfielders, talismen: strikers, subs: substitutes, GW: gameweek })

        
    } catch (error) {

        req.flash('success', `Server Error!! Cant Access Teams in GW${eventId}`)
        res.redirect('/parties')
        console.log('PROXY DEPRICATION ERRORS')
        
    }

}

const getMyTeamId = async (req, res) => {
    
    const userData = req.user
    const userTeamId = req.user.teamId
    const eventNumber = req.params.id
    const fplBaseUrl = process.env.FPLBASE
     
    try {

        const baseUrl = `${fplBaseUrl}/entry/${userTeamId}/event/${eventNumber}/picks/`
        const options = {
            method: 'GET', 
            agent: new HttpsProxyAgent(proxyInstance),
            accept: 'application/json'
        }
        const results = await fetch(baseUrl, options)
        const data = await results.json()
        const players = await data.picks
        const array = []
        for (let i = 0; i < players.length; i++) {
            array.push(players[i].element)
        }
        const baseUrl2 = `${fplBaseUrl}/bootstrap-static/`
        const bootstrap = await fetch(baseUrl2, options)
        const bootstrapAll  = await bootstrap.json()
        const playersAll = await bootstrapAll.elements
        const player = playersAll.find((element) => {
            return element.id === array[0]   
        })
        const teamPicked = []
        for (let i = 0; i < array.length; i++) {
            teamPicked.push(playersAll.find((element) => {
                 return element.id === array[i]
            }))
        }
    
        // SLICE METHOD
        const firstEleven = teamPicked.slice(0, 11)
        const substitutes = teamPicked.slice(11, 15)
    
    
         const keeper = firstEleven.find((player) => {
             return player.element_type === 1 
         })
         const defenders = firstEleven.filter((player) => {
            return player.element_type === 2
         })
         const midfielders = firstEleven.filter((player) => {
            return player.element_type === 3
         })
         const strikers = firstEleven.filter((player) => {
            return player.element_type === 4
         })
    
         const dataArray = []
         const chunk = 38
         for ( let i = 0; i < chunk; i++ ) {
            dataArray.push(i + 1)
         }
        
    
        res.render('myteam', { array: dataArray, user: userData, goalie: keeper, defs: defenders, mids: midfielders, talismen: strikers, subs: substitutes, GW: eventNumber   })
    
        
    } catch (error) {

        req.flash('error', 'Server Error!! Try again Later')
        res.redirect('/main')
        console.log('PROXY DEPRICATION ERRORS')

    }

}  

const getMyTeam = async (req, res) => {
    
    const userData = req.user
    const userTeamId = req.user.teamId
    const fplBaseUrl = process.env.FPLBASE

    try {

        const baseUrl = `${fplBaseUrl}/entry/${userTeamId}/event/1/picks/`
        const options = {
            method: 'GET', 
            agent: new HttpsProxyAgent(proxyInstance),
            accept: 'application/json'
        }
        const results = await fetch(baseUrl, options)
        const data = await results.json()
        const players = await data.picks
        const array = []
        for (let i = 0; i < players.length; i++) {
            array.push(players[i].element)
        }
        const baseUrl2 = `${fplBaseUrl}/bootstrap-static/`
        const bootstrap = await fetch(baseUrl2, options)
        const bootstrapAll  = await bootstrap.json()
        const playersAll = await bootstrapAll.elements
        const player = playersAll.find((element) => {
            return element.id === array[0]   
        })
        const teamPicked = []
        for (let i = 0; i < array.length; i++) {
            teamPicked.push(playersAll.find((element) => {
                 return element.id === array[i]
            }))
        }
    
        // SLICE METHOD
        const firstEleven = teamPicked.slice(0, 11)
        const substitutes = teamPicked.slice(11, 15)
    
     
         const keeper = firstEleven.find((player) => {
             return player.element_type === 1 
         })
         const defenders = firstEleven.filter((player) => {
            return player.element_type === 2
         })
         const midfielders = firstEleven.filter((player) => {
            return player.element_type === 3
         })
         const strikers = firstEleven.filter((player) => {
            return player.element_type === 4
         })
    
        
         
         const dataArray = []
         const chunk = 38
         for ( let i = 0; i < chunk; i++ ) {
            dataArray.push(i + 1)
         }
        
         const eventNumber = 1
    
        res.render('myteam', { array: dataArray, user: userData, goalie: keeper, defs: defenders, mids: midfielders, talismen: strikers, subs: substitutes, GW: eventNumber })
    
        
    } catch (error) {

        req.flash('error', 'Server Error!! Try again Later')
        res.redirect('/main')
        console.log('PROXY DEPRICATION ERRORS')
        
    }
   
}








module.exports = {
    getOpponentId,
    getMyTeamId,
    getMyTeam
}






