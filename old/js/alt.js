import * as api from './apiclient.js'
import * as dateutil from './date.js'
import {ListView} from './ListDisplay.js'

function timefilter(timeframe) {
    return function(task) {
        let actualframe = dateutil.when_is_date(task.date)
        let isgood = actualframe === timeframe 
        return isgood
    }
}


const tasklist = new ListView('itemlist', {
    sorters: { 'date': (a,b) => b.date - a.date },
    filters: {
        'today': timefilter('today'),
        'future': timefilter('future'),
        'past': timefilter('past'),
        'none': ()=>false,
        'search': (t)=>t.text.includes(this.current_search_term)
    }
})
window.tasklist = tasklist

function loginredirect () {
    if (!api.current_user_data.user_id) {
        let loc = window.location
        console.log(loc)
        loc.pathname = '/login/'
    }
}

document.querySelector('header h2 span').textContent = api.current_user_data.username

function prepare_modals() {
    let modals = document.querySelectorAll('.modal')
    modals.forEach(e => {
        e.addEventListener('transitionend', ev=>{
            e.classList.replace('visible-start', 'visible')
            e.classList.replace('hidden-start', 'hidden')
        })
    })
    let modalblur = document.querySelector('#modal-blur')
    modalblur.addEventListener('transitionend', ev=>{
        console.log('cooook')
        modalblur.classList.replace('visible-start', 'visible')
        modalblur.classList.replace('hidden-start', 'hidden')
    })
    modalblur.addEventListener('click', function() {
        console.log('clicky')
        hide_modal()
    })
    document.querySelectorAll('button.cancel').forEach(e=>
        e.addEventListener('click', function(ev) {
            hide_modal()
    }))
    prepare_add_modal()
}

// function clear_add_form() {
//     document.querySelector('#newtask input').value = ''
//     document.querySelector('#newtask textarea').value = ''
// }

// function prepare_add_modal() {
//     async function makenew(isnote) {
//         if (isnote) {
//             await api.make_new_note()
//         } else {
//             await api.make_new_task()
//         }
//         tasklist.view_refresh()
//         clear_add_form()
//         hide_modal()
//     }
//     document.querySelector('#new-task-button')
//         .addEventListener('click', ()=>makenew(false))
//     document.querySelector('#new-note-button')
//         .addEventListener('click', ()=>makenew(true))
// }

// function show_modal(modaltype) {
//     // Get the modal element
//     let elem = document.querySelector(`#${modaltype}-modal`)
//     // If the modal element is invalid, we don't continue
//     console.log(elem)
//     if (!elem) return
//     // Ensure that other modals are hidden
//     hide_modal()
//     // Kick-off the transition animation
//     elem.classList.replace('hidden', 'visible-start')
//     // Get the blur, and kick of its transition animation
//     let blur = document.querySelector('#modal-blur')
//     blur.classList.replace('hidden', 'visible-start')
//     // Set a 0-milli timeout that will move the
//     // transition animation to the next step
//     setTimeout(() => {
//         elem.classList.replace('visible-start', 'visible')
//         blur.classList.replace('visible-start', 'visible')
//     }, 0);
// }

// function hide_modal() {
//     let modals = document.querySelectorAll('.modal')
//     modals.forEach(e=>e.classList.replace('visible', 'hidden-start'))
//     let blur = document.querySelector('#modal-blur')
//     blur.classList.replace('visible', 'hidden-start')
//     // setTimeout(() => {
//     //     modals.forEach(elem=>elem.classList.replace('hidden-start', 'hidden'))
//     //     blur.classList.replace('hidden-start', 'hidden')
//     // }, 0);
// }

// function show_all_action_modal(taskcontroller) {
//     show_modal('all-actions')
//     taskcontroller.populate_all_action_buttons(document.querySelector('#all-actions-modal ul'), hide_modal)
// }

// async function create_task_view(task_id) {
//     let task = await api.tasklist[task_id]
//     let t_task = await template('taskitem', {
//         '.text': task.text,
//         '.kind': task.kind,
//         '.date': fmtdate.prettydate(task.date)
//     },
//     true)
//     t_task.children[0].dataset.id = task.id
//     return t_task
// }

// async function add_task_to_display(task_view) {
//     task_view = await task_view
//     document.querySelector('ul#itemlist').appendChild(task_view)
//     task_view.afterInsert()
// }

function setup_filterbar() {
    document.querySelector('#future-button').addEventListener('click', function() {
        tasklist.change_filtering('future')
        document.querySelector('#filterbar li button.active').classList.remove('active')
        this.classList.add('active')
    })
    document.querySelector('#past-button').addEventListener('click', function() {
        tasklist.change_filtering('past')
        document.querySelector('#filterbar li button.active').classList.remove('active')
        this.classList.add('active')
    })
    document.querySelector('#today-button').addEventListener('click', function() {
        tasklist.change_filtering('today')
        document.querySelector('#filterbar li button.active').classList.remove('active')
        this.classList.add('active')
    })
    document.querySelector('#search-button').addEventListener('click', function() {
        let search_term = prompt('Search Term')
        if (!search_term) return false
        tasklist.change_filtering('search', search_term)
        document.querySelector('#filterbar li button.active').classList.remove('active')
        this.classList.add('active')
    })
}

async function setup_page() {
    await api.init()
    loginredirect()
    document.querySelector('span.username').textContent = api.current_user_data.username
    // await api.fetch_all_tasks()
    await tasklist.view_refresh_server()
    document.querySelector('button#logoutbutton').addEventListener('click', function() {
        api.logout()
        loginredirect()
    })
    // Object.keys(api.tasklist).map(create_task_view).forEach(add_task_to_display)
    setup_filterbar()
    // prepare_modals()
    document.querySelector('#add-button').addEventListener('click', function() {
        tasklist.modalsystem.show('add-new')
    })
}

document.addEventListener('DOMContentLoaded', setup_page)