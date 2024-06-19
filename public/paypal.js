const closeBtn = document.getElementById('close')
const paypalBox = document.querySelector('.paypal-section')
const mainBox = document.querySelector('main')
const inputAmount = document.getElementById('amount')
const footerElem = document.querySelector('footer')

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

function purchase( token ) {
    if (token == '100') {
        inputAmount.setAttribute('value', 1.05)
        display()
    } else if (token == '200' ) {
        inputAmount.setAttribute('value', 2.15)
        display()
    } else if (token == '500' ) {
        inputAmount.setAttribute('value', 5.195)
        display()
    } else if (token == '1000' ) {
        inputAmount.setAttribute('value', 10.725)
        display()
    } else if (token == '2000' ) {
        inputAmount.setAttribute('value', 20.595)
        display()
    } else if (token == '5000' ) {
        inputAmount.setAttribute('value', 50.35)
        display()
    }
   
}