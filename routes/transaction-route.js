const router = require('express').Router()
const { authCheck, registerCheck } = require('../controllers/authControllers')



router.get('/', authCheck, registerCheck, )







module.exports = router