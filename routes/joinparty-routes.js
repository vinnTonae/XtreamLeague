const { postJoinParty } = require('../controllers/partyControllers')

const router = require('express').Router()



router.post('/', postJoinParty) 

module.exports = router