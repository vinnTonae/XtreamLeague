const { authCheck, registerCheck } = require('../controllers/authControllers')
const { getBetParty, postBetParty } = require('../controllers/partyControllers')
const router = require('express').Router()

router.post('/', postBetParty)


router.get('/', authCheck, registerCheck, getBetParty)








module.exports = router