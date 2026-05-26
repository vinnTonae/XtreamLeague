const { authCheck, registerCheck } = require('../controllers/authControllers')
const { getBetHead, postBetHead } = require('../controllers/headControllers')

const router = require('express').Router()

router.post('/', postBetHead)




router.get('/', authCheck, registerCheck, getBetHead)






module.exports = router