const navBar = document.querySelector('.navbar')
const button = document.querySelector('#menu-btn')
const icon = document.querySelector('.hambugger')

button.addEventListener('click', () => {
    navBar.classList.toggle('display')
    icon.classList.toggle('open')
})

const closeHeadBtn = document.getElementById('close-head')
const closePartyBtn = document.getElementById('close-party')
const joinHeadBtn = document.querySelector('.join-head')
const joinPartyBtn = document.querySelector('.join-party')
const head = document.querySelector('.head')
const party = document.querySelector('.party')
const inviteHead = document.querySelector('.register')
const inviteParty = document.getElementById('party')


    joinHeadBtn.addEventListener('click', () => {
        head.style.display = 'none'
        party.style.display = 'none'
        inviteHead.style.display = 'block'
    })

    joinPartyBtn.addEventListener('click', () => {
        head.style.display = 'none'
        party.style.display = 'none'
        inviteParty.style.display = 'block'
    })


closeHeadBtn.addEventListener('click', () => {
    head.style.display = 'block'
    party.style.display = 'block'
    inviteHead.style.display = 'none'
})

closePartyBtn.addEventListener('click', () => {
    head.style.display = 'block'
    party.style.display = 'block'
    inviteParty.style.display = 'none'
})