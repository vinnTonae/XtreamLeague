const { postJoinBet } = require('../controllers/headControllers')

const router = require('express').Router()





router.post('/', postJoinBet)















module.exports = router