const { getConfirmDeposit, postConfirmDeposit, patchConfirmDeposit } = require('../controllers/depositControllers')

const router = require('express').Router()


router.patch('/', patchConfirmDeposit)


router.post('/', postConfirmDeposit)

router.get('/', getConfirmDeposit)











module.exports = router