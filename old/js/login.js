import * as api from './apiclient.js'

api.init()

function loginredirect () {
    if (api.current_user_data.user_id) {
        let loc = window.location
        console.log(loc)
        loc.pathname = '/alt.html'
    }
}

loginredirect()

async function loginfunc() {
    let res = await api.login()
    loginredirect()

}

function setuplogin() {
    let loginbutton = document.querySelector('form button')
    console.log(loginbutton)
    loginbutton.onclick = loginfunc
}

setuplogin()