const { authCheck, registerCheck } = require('../controllers/authControllers')
const { getDeposit } = require('../controllers/depositControllers')
const router = require('express').Router()

router.get('/', authCheck, registerCheck, getDeposit)







module.exports = router