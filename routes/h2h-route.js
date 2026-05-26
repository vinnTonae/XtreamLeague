const router = require('express').Router()

const { authCheck, registerCheck } = require('../controllers/authControllers')
const { h2hId } = require('../controllers/headControllers')

router.get('/:id', authCheck, registerCheck, h2hId)



module.exports = router