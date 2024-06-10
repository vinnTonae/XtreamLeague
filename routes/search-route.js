const { getSearch } = require('../controllers/profileControllers')
const { authCheck } = require('../controllers/authControllers')

const router = require('express').Router()

router.get('/', authCheck, getSearch)






module.exports = router