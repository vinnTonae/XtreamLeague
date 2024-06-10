const { postRegister } = require('../controllers/profileControllers')

const router = require('express').Router()

router.post('/', postRegister)






module.exports = router