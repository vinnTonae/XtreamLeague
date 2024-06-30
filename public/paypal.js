const closeBtn = document.getElementById('close')
const paypalBox = document.querySelector('.paypal-section')
const mainBox = document.querySelector('main')
const inputAmount = document.getElementById('amount')
const footerElem = document.querySelector('footer')
const mpesaContainer = document.querySelector('.mpesa-wrapper')
const lipaBtn = document.getElementById('lipa-mpesa')
const mpesaCloseBtn = document.querySelector('.close-mpesa')
const mpesaAmount = document.getElementById('mpesa-amount')




   



function display() {
    paypalBox.style.display = 'block'
    mainBox.style.display = 'none'
    footerElem.style.display = 'none'
  }

  
closeBtn.addEventListener('click', () => {
    paypalBox.style.display = 'none'
    mainBox.style.display = 'block'
    footerElem.style.display = 'flex' 

})

lipaBtn.addEventListener('click', () => {
    mpesaContainer.style.display = 'flex'
    paypalBox.style.display = 'none'
})

mpesaCloseBtn.addEventListener('click', () => {
    mpesaContainer.style.display = 'none'
    paypalBox.style.display = 'block'
})



function purchase(token) {
    if (token == 100 ) {
        inputAmount.setAttribute('value', 1.05)
        mpesaAmount.setAttribute('value', 100)
        display()
    } else if (token == 200 ) {
        inputAmount.setAttribute('value', 1.75)
        mpesaAmount.setAttribute('value', 200)
        display()
    } else if (token == 500 ) {
        inputAmount.setAttribute('value', 4.25)
        mpesaAmount.setAttribute('value', 500)
        display()
    } else if (token == 1000 ) {
        inputAmount.setAttribute('value', 8.15)
        mpesaAmount.setAttribute('value', 1000)
        display()
    } else if (token == 2000 ) {
        inputAmount.setAttribute('value', 16.45)
        mpesaAmount.setAttribute('value', 2000)
        display()
    } else if (token == 5000 ) {
        inputAmount.setAttribute('value', 39.25)
        mpesaAmount.setAttribute('value', 5000)
        display()
    }
   
}


