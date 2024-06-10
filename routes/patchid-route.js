const { patchUserId } = require('../controllers/profileControllers')

const router = require('express').Router()


router.patch('/', patchUserId)





module.exports = router