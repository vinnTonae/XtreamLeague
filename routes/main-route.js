const { getMain } = require('../controllers/profileControllers')
const { authCheck } = require('../controllers/authControllers')

const router = require('express').Router()




router.get('/', authCheck, getMain )





module.exports = router