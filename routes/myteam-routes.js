const router = require('express').Router()
const { getOpponentId, getMyTeamId, getMyTeam } = require('../controllers/myTeamControllers')
const { authCheck } = require('../controllers/authControllers')

 


router.get('/:opponent/:id', authCheck, getOpponentId)


router.get('/:id', authCheck, getMyTeamId)


router.get('/', authCheck, getMyTeam)




module.exports = router







