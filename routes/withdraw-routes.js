const { postWithdraw, getWithdraw, postWithdrawMpesa } = require('../controllers/withdrawControllers')
const  { authCheck, registerCheck } = require('../controllers/authControllers')
const router = require('express').Router()



router.get('/', authCheck, registerCheck, getWithdraw)

router.post('/', postWithdraw)

router.post('/mpesa', postWithdrawMpesa)








module.exports = router