const { getPartyId } = require('../controllers/partyControllers')
const { authCheck, registerCheck } = require('../controllers/authControllers')
const router = require('express').Router()



router.get('/:id', authCheck, registerCheck, getPartyId)





module.exports = router