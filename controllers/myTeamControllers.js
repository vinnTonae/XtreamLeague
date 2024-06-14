const { HttpsProxyAgent } = require('https-proxy-agent')
const fetch = require('node-fetch')


const getOpponentId = async (req, res) => {
    const eventId = req.query.id
    const opponentId = req.query.opponent
    const baseUrl = `https://fantasy.premierleague.com/api/entry/${opponentId}/event/${eventId}/picks/`
    const options = {
        method: 'GET',
        agent: new HttpsProxyAgent({ host: '45.141.179.179', port: '8000', auth: '4adwq0:6DBTA2' }), 
        accept: 'application/json',
    }
    const results = await fetch(baseUrl, options)
    const data = await results.json()
    const players = await data.picks
    const array = []
    for (let i = 0; i < players.length; i++) {
        array.push(players[i].element)
    }
    const baseUrl2 = 'https://fantasy.premierleague.com/api/bootstrap-static/'
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

    res.render('myteam', { array: dataArray, data: opponentId , goalie: keeper, defs: defenders, mids: midfielders, talismen: strikers, subs: substitutes, GW: gameweek })
}

const getMyTeamId = async (req, res) => {
    
    const userData = req.user
    const userTeamId = req.user.teamId
    const eventNumber = req.params.id
    const baseUrl = `https://fantasy.premierleague.com/api/entry/${userTeamId}/event/${eventNumber}/picks/`
    const options = {
        method: 'GET', 
        agent: new HttpsProxyAgent({ host: '45.141.179.179', port: '8000', auth: '4adwq0:6DBTA2' }),
        accept: 'application/json',
    }
    const results = await fetch(baseUrl, options)
    const data = await results.json()
    const players = await data.picks
    const array = []
    for (let i = 0; i < players.length; i++) {
        array.push(players[i].element)
    }
    const baseUrl2 = 'https://fantasy.premierleague.com/api/bootstrap-static/'
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
}  

const getMyTeam = async (req, res) => {
    
    const userData = req.user
    const userTeamId = req.user.teamId
    const baseUrl = `https://fantasy.premierleague.com/api/entry/${userTeamId}/event/1/picks/`
    const options = {
        method: 'GET', 
        agent: new HttpsProxyAgent({ host: '45.141.179.179', port: '8000', auth: '4adwq0:6DBTA2' }),
        accept: 'application/json',
    }
    const results = await fetch(baseUrl, options)
    const data = await results.json()
    const players = await data.picks
    const array = []
    for (let i = 0; i < players.length; i++) {
        array.push(players[i].element)
    }
    const baseUrl2 = 'https://fantasy.premierleague.com/api/bootstrap-static/'
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
}








module.exports = {
    getOpponentId,
    getMyTeamId,
    getMyTeam
}






