const { authCheck, registerCheck } = require('../controllers/authControllers')
const { getLiveBet, postLiveBet, getAuthorizeLive, patchAuthorizeLive } = require('../controllers/liveControllers')

const router = require('express').Router()



router.get('/:id', getAuthorizeLive)

router.patch('/:id', patchAuthorizeLive)

router.get('/', authCheck, getLiveBet)

router.post('/', postLiveBet)

module.exports = router