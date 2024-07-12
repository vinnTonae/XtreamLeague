const closeBtn = document.getElementById('close')
const paypalBox = document.querySelector('.paypal-section')
const mainBox = document.querySelector('main')
const inputAmount = document.getElementById('amount')
const mpesaContainer = document.querySelector('.mpesa-wrapper')
const lipaBtn = document.getElementById('lipa-mpesa')
const mpesaCloseBtn = document.querySelector('.close-mpesa')
const mpesaInputAmount = document.getElementById('mpesa-amount')
const displayAmount = document.getElementById('displayAmount')

 

function display() {
    paypalBox.style.display = 'block'
    mainBox.style.display = 'none'

  }

  
closeBtn.addEventListener('click', () => {
    paypalBox.style.display = 'none'
    mainBox.style.display = 'block' 

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
        inputAmount.setAttribute('value', 1.08)
        mpesaInputAmount.setAttribute('value', 100)
        displayAmount.textContent = '100'
        console.log(mpesaInputAmount.value)
        display()
    } else if (token == 200 ) {
        inputAmount.setAttribute('value', 1.85)
        mpesaInputAmount.setAttribute('value', 200)
        displayAmount.textContent = '200'
        console.log(mpesaInputAmount.value)
        display()
    } else if (token == 500 ) {
        inputAmount.setAttribute('value', 4.25)
        mpesaInputAmount.setAttribute('value', 500)
        displayAmount.textContent = '500'
        console.log(mpesaInputAmount.value)
        display()
    } else if (token == 1000 ) {
        inputAmount.setAttribute('value', 8.15)
        mpesaInputAmount.setAttribute('value', 1000)
        displayAmount.textContent = '1000'
        console.log(mpesaInputAmount.value)
        display()
    } else if (token == 2000 ) {
        inputAmount.setAttribute('value', 16.45)
        mpesaInputAmount.setAttribute('value', 2000)
        displayAmount.textContent = '2000'
        console.log(mpesaInputAmount.value)
        display()
    } else if (token == 5000 ) {
        inputAmount.setAttribute('value', 39.45)
        mpesaInputAmount.setAttribute('value', 5000)
        displayAmount.textContent = '5000'
        console.log(mpesaInputAmount.value)
        display()
    }
   
}


