const { authCheck } = require('../controllers/authControllers')
const { getDeposit } = require('../controllers/depositControllers')
const router = require('express').Router()

router.get('/', authCheck, getDeposit)







module.exports = router