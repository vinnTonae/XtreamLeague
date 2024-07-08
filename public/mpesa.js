const loadingBox = document.querySelector('.loading-box')
const formBox = document.querySelector('.confirm-box')


// ! SETTIMEOUT 5 SECONDS FOR SPINNING LOADINBOX

window.addEventListener('load', () => {
    setTimeout(() => {
        loadingBox.style.display = 'none'
        formBox.style.display = 'flex'
    }, 15000)
})

    
