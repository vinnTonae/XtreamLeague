const authCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/')
    } else {
        next()
    }
}

const notAuthCheck = (req, res, next) => {
    if (req.user) {
        res.redirect('/main')
    } else {
        next()
    }
}

const registerCheck = (req, res, next) => {
    if (req.user.teamId == 'none') {
        req.flash('error', 'You Need to Register an FPL team')
        res.redirect('/main')
    } else {
        next()
    }
}

module.exports = {
    authCheck,
    notAuthCheck,
    registerCheck
}