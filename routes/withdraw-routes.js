const { postWithdraw, getWithdraw } = require('../controllers/withdrawControllers')
const  { authCheck, registerCheck } = require('../controllers/authControllers')
const router = require('express').Router()



router.get('/', authCheck, registerCheck, getWithdraw)

router.post('/', postWithdraw)








module.exports = router