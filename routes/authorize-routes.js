const { patchAuthorize, getAuthorize } = require('../controllers/withdrawControllers')

const router = require('express').Router()


router.get('/', getAuthorize)

router.patch('/', patchAuthorize)









module.exports = router