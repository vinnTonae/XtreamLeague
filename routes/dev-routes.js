const { getDev, getDevConsole, getDevUsers, patchDevUsers, getDevHeads, updateDevHeads, settleDevHeads, getDevParties, getDevParty, updateDevParty, deleteDepHeads, deleteDepParties, settleDevParty, getDevWithdraws, patchDevWithdraws } = require('../controllers/devControllers.js')
const { devCheck, authCheck } = require('../controllers/authControllers')


const router = require('express').Router()


router.get('/', authCheck, devCheck, getDev)

router.get('/:id', getDevConsole)

router.get('/:id/xUsers', getDevUsers)

router.patch('/:id/xUsers/', patchDevUsers)

router.get('/:id/heads', getDevHeads)

router.patch('/:id/heads/update', updateDevHeads)

router.patch('/:id/heads/settle', settleDevHeads)

router.get('/:id/party', getDevParties)

router.get('/:id/party/:party', getDevParty)

router.patch('/:id/party/:party/update', updateDevParty)

router.patch('/:id/party/settle', settleDevParty)


router.delete('/:id/headsdelete', deleteDepHeads)

router.delete('/:id/partydelete', deleteDepParties)

router.get('/:id/withdraws', getDevWithdraws)

router.patch('/:id/withdraws/settle', patchDevWithdraws)




module.exports = router