const { patchAuthorize, getAuthorizePaypal, getAuthorizeMpesa, patchAuthorizeMpesa } = require('../controllers/withdrawControllers')

const router = require('express').Router()


router.get('/mpesa', getAuthorizeMpesa)

router.get('/paypal', getAuthorizePaypal)

router.patch('/paypal', patchAuthorize)

router.patch('/mpesa', patchAuthorizeMpesa)









module.exports = router