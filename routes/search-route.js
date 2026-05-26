const { getSearch } = require('../controllers/profileControllers')
const { authCheck, alreadyRegisterCheck } = require('../controllers/authControllers')

const router = require('express').Router()

router.get('/', authCheck, alreadyRegisterCheck, getSearch)






module.exports = router