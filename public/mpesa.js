const formBox = document.querySelector('.confirm-box')
const targetInput = document.getElementById('merchant')
const submitBtn = document.getElementById('confirm-btn')
const tranxMessage = document.getElementById('tranx-message')
const tranxSpan = document.querySelector('.tranx-status')
const animatedSpin = document.querySelector('.small-spin')
const input = document.getElementById('merchant')
const flashSpan = document.getElementById('flash')



// TODO: SETTIMEOUT 20 SECONDS FOR SPINNING LOADINBOX



submitBtn.addEventListener('click', (e) => {
    e.preventDefault()
    tranxSpan.textContent = 'Please wait...!!'
    tranxMessage.textContent = 'Waiting Confirmation from safaricom..'
    submitBtn.disabled = true
    submitBtn.textContent = 'Checking...'
    submitBtn.style.backgroundColor = 'transparent'
    submitBtn.style.color = 'red'
    animatedSpin.style.display = 'block'

    fetch('/mpesa', {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            reqid: input.value
        })
    }).then((resp) => {
        const result = resp.json()
        return result
    }).then((result) => {

        // * STKCALLBACK FAILURE

        if (result.statusCode == 501) {
            
            flashSpan.textContent = result.data
            animatedSpin.style.display = 'none'
            tranxMessage.textContent = 'STK flow Terminated by Safaricom....!'
            tranxSpan.textContent = 'You will be redirected shortly..'
            submitBtn.textContent = 'STK Failed!!'
            submitBtn.style.backgroundColor = 'red'
            submitBtn.style.color = 'white'
            
            setTimeout(() => {
                window.location.href = '/deposit'
            }, 2000)

        } else if ( result.statusCode == 420 ) {
            
            // * PROMPT INTERACTION SUCCESS BUT FAILURE PAYMENT
            
            flashSpan.textContent = result.data
            animatedSpin.style.display = 'none'
            tranxMessage.textContent = 'STK flow Terminated by Safaricom...!'
            tranxSpan.textContent = 'You will be redirected shortly..'
            submitBtn.textContent = 'STK Failed!!'
            submitBtn.style.backgroundColor = 'red'
            submitBtn.style.color = 'white'
            
            setTimeout(() => {
                window.location.href = '/deposit'
            }, 2000)
            
        } else if ( result.statusCode == 1000 ) {
            
            // * SUCCESS TRANX + COMPLETE PAYMENT
            
            flashSpan.textContent = result.data
            animatedSpin.style.display = 'none'
            tranxMessage.textContent = 'STK flow Terminated by Safaricom...!'
            tranxSpan.textContent = 'You will be redirected shortly..'
            submitBtn.textContent = 'Success!!'
            submitBtn.style.backgroundColor = 'limegreen'
            submitBtn.style.color = 'white'

            setTimeout(() => {
                window.location.href = '/main'
            }, 2000)

        } else if (result.statusCode == 1002) {

            // * STK COMPLETE BUT UPDATE FAILURE

            flashSpan.textContent = result.data
            animatedSpin.style.display = 'none'
            tranxMessage.textContent = 'STK flow Terminated by Safaricom...!'
            tranxSpan.textContent = 'You will be redirected shortly..'
            submitBtn.textContent = 'Update Failed!!'
            submitBtn.style.backgroundColor = 'red'
            submitBtn.style.color = 'white'

            setTimeout(() => {
                window.location.href = '/main'
            }, 2000)

        } else if (result.statusCode == 505) {

            // * SERVER ERROR/ MONGODB ERROR

            flashSpan.textContent = result.data
            animatedSpin.style.display = 'none'
            tranxMessage.textContent = 'STK flow Terminated by Safaricom...!'
            tranxSpan.textContent = 'You will be redirected shortly..'
            submitBtn.textContent = 'Update Failed.!!'
            submitBtn.style.backgroundColor = 'red'
            submitBtn.style.color = 'white'

            setTimeout(() => {
                window.location.href = '/main'
            }, 2000)
        }


    }).catch((err) => {
        console.log(err)
        window.location.href = '/deposit'
    })
})




