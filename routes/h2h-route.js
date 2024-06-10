const router = require('express').Router()

const { authCheck } = require('../controllers/authControllers')
const { h2hId } = require('../controllers/headControllers')

router.get('/:id', authCheck, h2hId)



module.exports = router