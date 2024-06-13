const router = require('express').Router()
const { authCheck, registerCheck } = require('../controllers/authControllers')
const { getTransactions } = require('../controllers/profileControllers')



router.get('/', authCheck, registerCheck, getTransactions )







module.exports = router