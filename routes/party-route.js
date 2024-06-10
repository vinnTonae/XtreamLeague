const { getPartyId } = require('../controllers/partyControllers')
const { authCheck } = require('../controllers/authControllers')
const router = require('express').Router()



router.get('/:id', authCheck, getPartyId)





module.exports = router