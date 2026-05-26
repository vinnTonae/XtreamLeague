const { getTopDollar } = require('../controllers/profileControllers')
const { authCheck, registerCheck } = require('../controllers/authControllers')

const router = require('express').Router()


router.get('/', authCheck, registerCheck, getTopDollar)





module.exports = router