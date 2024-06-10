const caseInSwitch = (month)  => {
    let answer = ''
    switch (month) {
        case 0:
            answer = 'January'
            break;
        case 1: 
            answer = 'February'
            break;
        case 2: 
            answer = 'March'
            break;
        case 3: 
            answer = 'April'
            break;
        case 4: 
            answer = 'May'
            break;
        case 7:
            answer = 'August'
            break;
        case 8:
            answer = 'September'
            break;
        case 9:
            answer = 'October'
            break;
        case 10: 
            answer = 'November'
            break;
        case 11: 
            answer = 'December'
            break;           
    }
    return answer
}

// const array = []
// const chunk = 38
// for (i = 0; i < chunk; i++) {
//     array.push(i + 1)
// }
// const start = gameweek.start_event
// const end = gameweek.stop_event
// console.log(array)
// const august = array.slice(start - 1, end)
// console.log(august)

module.exports = {
    caseInSwitch
}




// const teamId = req.user.teamId
// const options = {
//     method: 'GET',
//     Accept: 'application/json'
// }
// const baseUrl = `https://fantasy.premierleague.com/api/entry/${teamId}/history`
// const response = await fetch(baseUrl, options)
// const data = await response.json()
// const events = data.current
// const pointsToDisplay = events[events.length - 1].points







// const amount = tranx.amount
// const id = tranx._id
// res.redirect(`/confirm-deposit?ajaxamntvv2ppl=${amount}&tranxId=${id}&email=${paypalEmail}&code=${tranxCode}`)