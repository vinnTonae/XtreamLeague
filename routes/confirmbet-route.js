const router = require('express').Router()

const { patchConfirmBet } = require('../controllers/headControllers')




router.patch('/', patchConfirmBet)


module.exports = router