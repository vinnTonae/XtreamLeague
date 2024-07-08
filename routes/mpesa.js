const router = require('express').Router()

router.get('/', (req, res) => {
    const reqid = req.query.reqID
    res.render('mpesaconfirm', { messages: req.flash('error'), reqID: reqid })
})

router.patch('/confirm', async (req, res) =>{
    const reqid = req.body.reqID
})

router.post('/stk', (req, res) => {
    const { phone } = req.body
    const requiredlength = phone.toString().length
    const startingNum = phone.toString().charAt(0)

    if ( requiredlength !== 10 && startingNum !== 0 ) {

         req.flash('error', 'Incorrect Mpesa Number')
         res.redirect('/deposit')
    } else {
        const inputPhone = phone.substring(1)
        const correctPhone = `254${inputPhone}`
        req.flash('error', `Converted No: ${correctPhone}`)
        res.redirect('/mpesa')
    }
})





module.exports = router