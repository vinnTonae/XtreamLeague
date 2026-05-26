const { getParties, getPartiesEvents } = require('../controllers/partyControllers')
const { authCheck, registerCheck } = require('../controllers/authControllers')

const router = require('express').Router()


router.get('/:event', authCheck, getPartiesEvents)

router.get('/', authCheck, registerCheck, getParties)








module.exports = router