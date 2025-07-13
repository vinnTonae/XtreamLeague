// require('dotenv').config()

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
        case 5:
            answer = 'June'
            break;
        case 6:
            answer = 'July'
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

const proxyInstance = {
    host: process.env.HOST,
    port: process.env.PROXY_PPT,
    auth: `${process.env.PROXY_AUTH_USER}:${process.env.PROXY_AUTH_PASS}`
}

module.exports = {
    caseInSwitch,
    proxyInstance
}