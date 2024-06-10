const { patchConfirmParty } = require('../controllers/partyControllers')

const router = require('express').Router()




router.patch('/', patchConfirmParty )









module.exports = router