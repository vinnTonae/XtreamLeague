const { getBets, getBetsEvents } = require('../controllers/headControllers')
const { authCheck, registerCheck } = require('../controllers/authControllers')

const router = require('express').Router()




router.get('/:event', authCheck, getBetsEvents)


router.get('/', authCheck, registerCheck, getBets)







module.exports = router