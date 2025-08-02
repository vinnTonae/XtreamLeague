const { getDev, getDevConsole, getDevUsers, patchDevUsers, getDevUser, getDevHeads, updateDevHeads, settleDevHeads, getDevParties, getDevParty, updateDevParty, deleteDepHeads, deleteDepParties, settleDevParty, getDevdeposits, updateDeposit, getDevWithdraws, patchDevWithdraws, deleteMpesaDeps, deleteWithdrawDeps, deleteDepLiveBets } = require('../controllers/devControllers.js')
const { devCheck, authCheck } = require('../controllers/authControllers')


const router = require('express').Router()


router.get('/', authCheck, devCheck, getDev)

router.get('/:id', authCheck, devCheck, getDevConsole)

router.get('/:id/xUsers', authCheck, devCheck, getDevUsers)

router.patch('/:id/xUsers/', patchDevUsers)

router.get('/:id/user/:userId', authCheck, devCheck, getDevUser)

router.get('/:id/heads', authCheck, devCheck, getDevHeads)

router.patch('/:id/heads/update', updateDevHeads)

router.patch('/:id/heads/settle', settleDevHeads)

router.get('/:id/party', authCheck, devCheck, getDevParties)

router.get('/:id/party/:party', authCheck, devCheck, getDevParty)

router.patch('/:id/party/:party/update', updateDevParty)

router.patch('/:id/party/settle', settleDevParty)


router.delete('/:id/headsdelete', deleteDepHeads)

router.delete('/:id/partydelete', deleteDepParties)

router.delete('/:id/live-delete', deleteDepLiveBets)

router.delete('/:id/mpesa-delete', deleteMpesaDeps )

router.delete('/:id/withdraw-delete', deleteWithdrawDeps )

router.get('/:id/deposits', authCheck, devCheck, getDevdeposits)

router.patch('/:id/deposits/settle', updateDeposit )

router.get('/:id/withdraws', authCheck, devCheck, getDevWithdraws)

router.patch('/:id/withdraws/settle', patchDevWithdraws)




module.exports = router