import {html, render} from './lib/lit-html/lit-html.js'
import * as api from './apiclient.js'
console.log('doing it')

render_after(api.init())

let current_modal = null

let current_toast_message = null

function set_toast(toast_message) {
    console.log('setting toast')
    current_toast_message = toast_message
    setTimeout(render_after(function () {
        current_toast_message = null
        console.log('unset toast')
    }), 3000)
}

function approx_into_future(date) {
    if (typeof date === 'string') {
        date = new Date(date)
    }
    let today = new Date()
    let rel_date = date.getUTCDate() - today.getUTCDate()
    let rel_month = (date.getUTCMonth() - today.getUTCMonth()) * 30
    let rel_year = (date.getUTCFullYear() - today.getUTCFullYear()) * 365
    return rel_date + rel_month + rel_year
}

let weekdays = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
]

let months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
]

// let formatdate = (timestamp) => new Date(timestamp * 1000).toLocaleDateString()
function formatdate(timestamp) {
    let thisdate = new Date(timestamp * 1000)
    return `${weekdays[thisdate.getDay()]} ${months[thisdate.getMonth()]} ${thisdate.getDate()}, ${thisdate.getFullYear()}`
}

function formatdateandtime(timestamp) {
    let datestring = formatdate(timestamp)
    let thisdate = new Date(timestamp * 1000)
    return `${datestring}, ${thisdate.toLocaleTimeString()}`
}


function andthen(...fns) {
    return async function() {
        for (let fn of fns) {
            await fn()
        }
        return true
    }
}

function render_after(...fns) {
    return andthen(...fns, render_file)
} 

function render_after_toast(toast_message, ...fns) {
    return andthen(...fns, render_file, ()=>set_toast(toast_message))
} 

let kind_options = (name="kind") => html`
    <select name=${name}>
            ${Object.entries(api.task_kinds).map(([k,v])=>html`
                <option value=${v}>${cap_word(k)}</option>
            `)}
    </select>
`

let newtask = () => html`
    <form id="newtask" onsubmit="return false">
        <h3>New Task</h3>
        <!-- ${kind_options()} -->
        <fieldset>
            <label for="newtext">Text</label>
            <textarea id="newtext" name="text"></textarea>
        </fieldset>
        <fieldset>
            <label for="newdue">Due At</label>
            <input id="newdue" name="duedate" type="datetime-local">
        </fieldset>
        <fieldset id="newbar">
            <button @click=${render_after_toast('Making new task', api.make_new_task, clear_new_task)}>New Task</button>
            <button @click=${render_after_toast('Making new note', api.make_new_note, clear_new_task)}>New Note</button>
        </fieldset>
    </form>
`

function clear_new_task() {
    document.getElementById('newtext').value = ''
    document.getElementById('newdue').value = ''
}

function make_action_modal(task, action, fieldtype, title, fieldname) {
    return function modalfn () {
        let display_value = task[fieldname]
        console.log('field value is ', display_value)
        let isdate = false
        if (fieldtype === "date" || fieldtype === "datetime-local") {
            isdate = true
            if (fieldname && typeof task[fieldname] === 'number') {
                display_value = new Date(task[fieldname]*1000).toISOString().substring(0, 23)
            }
        }
        let actiondo = async function() {
            let newform = new FormData(document.getElementById('modalform'))
            let value = newform.get('modalfield')
            if (isdate) {
                console.log('newdate is ', value)
                let datestring = fieldtype === "datetime-local" ? value+":00" : value+"T06:00:00"
                let newdate = new Date(datestring)
                console.log('newdate transitions ', newdate)
                value = newdate.getTime() / 1000
                console.log('newdate becomes ', value)
            }
            console.log('value is ', value)
            await api.do_action(task.id, action, value)
            current_modal = null
        }
    let input = fieldtype === 'textarea' ? 
          html`<textarea id='modalfield', name='modalfield'>${fieldname ? display_value : ''}</textarea>`
        : html` <input id="modalfield" name="modalfield" value=${fieldname ? display_value : ''} type=${fieldtype}> `
    let labeling = task.kind === api.task_kinds.note ? null :
        html`
            <div>${task.text.substring(0,15) + '...'}</div>
            <label for="modalfield">To:</label>
        `
    current_modal = html`
        <form id="modalform" class="modal ${task.kind}" onsubmit="return false">
            <h4>${title}</h4>
            ${labeling}
            ${input}
            <button @click=${render_after(actiondo)}>Do</button>
        </form>
`
    }
}

// delegate_modal_maker(api.tasklist[3])()

function dothing(task, action) {
    return async function() {
        current_modal = null
        return api.do_action(task.id, action)
    }
}

let actionbuttons = {
    'complete': (task)=>html` <button class="complete" @click=${render_after(dothing(task, 'complete'))}>✅ Complete</button> `,
    'defer': (task)=>html` <button class="defer" @click=${render_after(dothing(task, 'defer'))}>🔼 Defer</button> `,
    'delegate': (task)=>html` <button class="delegate" @click=${render_after(make_action_modal(task,'delegate', 'text', 'Delegate Task'))}>💁‍♀️ Delegate</button> `,
    'reschedule': (task)=>html` <button class="reschedule" @click=${render_after(make_action_modal(task,'reschedule', 'date', 'Reschedule Task'))}>📅 Reschedule</button> `,
    'cancel': (task)=>html` <button class="cancel" @click=${render_after(dothing(task, 'cancel'))}>❌ Cancel</button> `,
    'strike': (task)=>html` <button class="strike" @click=${render_after(dothing(task, 'strike'))}>🗑 Strike</button> `,
    'changedue': (task)=>html` <button class="changedue" @click=${render_after(make_action_modal(task,'changedue', 'datetime-local', 'Change Due Date', 'due'))}>⏰ Change Due Date</button> `,
    'removedue': (task)=>html` <button class="removedue" @click=${render_after(dothing(task, 'removedue'))}>🕐 Remove Due Date</button> `,
    'editnote': (task)=>html` <button class="editnote" @click=${render_after(make_action_modal(task,'editnote', 'textarea', 'Edit Note', 'text'))}>📝 Edit Note</button> `,
    'action': (task)=>html` <button @click=${render_after(() => make_menu_modal(task))}>➡️ Act</button> `,
    'reactivate': (task)=>html` <button class="reactivate" @click=${render_after(dothing(task, 'reactivate'))}>🔄 Reactivate</button> `,
}

let buttons_for_status = {
    'active': [
        actionbuttons.complete,
        actionbuttons.defer,
        actionbuttons.delegate,
        actionbuttons.reschedule,
        actionbuttons.cancel,
        actionbuttons.strike,
        actionbuttons.changedue,
        actionbuttons.removedue
    ],
    'note': [
        actionbuttons.editnote
    ],
}

let initem_buttons_for_status = {
    'active': [
        actionbuttons.complete,
        actionbuttons.defer,
        actionbuttons.action
    ],
    'note': [
        actionbuttons.editnote
    ],
    'struck': [
        actionbuttons.reactivate
    ],
    'canceled': [
        actionbuttons.reactivate
    ]
}

console.log(initem_buttons_for_status)

let actionbuttons_list = (task) => html`
    <ul class='actionbuttons'>
        ${(buttons_for_status[task.kind] || []).map(btn=>html`<li>${btn(task)}</li>`)}
    </ul>
`

let make_menu_modal = (task) => current_modal = html`
    <div class="modal task ${task.kind}">
        <span class="taskkind">${cap_word(task.kind)}</span>
        <span class="tasktext">${tasktext_templated(task).substring(0,25)+'...'}</span>
        <span class="taskdue">${task.due ? `Due: ${formatdate(task.due)}` : null}</span>
            <div class="taskclear"></div>
        ${actionbuttons_list(task)}
    </div>
`

function in_task_buttons(task) {
    let listo = []
    for (let btn of initem_buttons_for_status[task.kind] || []) {
        if (typeof btn === 'function') {
            listo.push(btn(task))
        } else {
            console.log(btn)
        }
    }
    return html`
        <div class="intaskbuttons">
            ${listo}
        </div>
    
    `

}

// let in_task_buttons = (task) => html`
// <div class="intaskbuttons">
//     ${(initem_buttons_for_status[task.kind] || []).map(fn=>fn(task))}
// </div>
// `

function tasktext_templated(task) {
    return task.text
        .replace('{{date}}', formatdate(task.date))
        .replace('{{due}}', task.due ? formatdateandtime(task.due) : '<Not Due>')
}

let task_template = (task, displayastoday) =>  {
    let istoday = is_task_today(task)
    let ispast = is_task_past(task)
    let isfuture = is_task_future(task)
    let ispast_due = is_task_past_due(task)
    let isactive = task.kind === api.task_kinds.active
    let li_class = html``
    if (displayastoday) {
        li_class = `${ispast ? 'past': 'today'} task ${task.kind} ${ispast_due ? 'pastdue' : 'ok'}`
    } else {
        li_class = `task ${task.kind}`
    }
    return html`
        <li class=${li_class}>
            <span class="taskkind">${cap_word(task.kind)}</span>
            ${!istoday ? html` <span class="taskdate">${formatdate(task.date)}</span> ` : null}
            <span class="tasktext">${tasktext_templated(task)}</span>
            <span class="taskdue">${task.due ? `Due: ${formatdateandtime(task.due)}` : null}</span>
            <span class="taskmeta">${task.meta ? task.meta : null}</span>
            ${task.kind === "delegated" ? html`<span class='taskdelegate'>Delegated To: ${task.delegatedto}</span>` : null}
            <div class="taskclear"></div>
            ${in_task_buttons(task)}
            <!-- ${task.kind === "active" ? in_task_buttons(task) : null} -->
        </li>`

}

function is_task_today(task) {
    if (!task) {return false}
    let today = new Date()
    let tasktime = new Date(task.date*1000)
    console.log(task.text, tasktime.toDateString())
    // console.log('dates are', today.toDateString(), tasktime.toDateString())
    return formatdate(Date.now()/1000) === formatdate(task.date)
}

function is_task_future(task) {
    let is_today = is_task_today(task)
    if (!is_today) {
        let now = Math.ceil(Date.now()/1000)
        return task.date > now
    }
    return false
}

function is_task_past(task) {
    let is_today = is_task_today(task)
    // console.log(new Date(task.date*1000), is_today, task)
    if (!is_today) {
        let now = Math.ceil(Date.now()/1000)
        return task.date < now
    } else {
        // console.log(task)
    }
    return false
}

function is_task_past_due(task) {
    let now = Math.ceil(Date.now()/1000)
    if (task.due) {
        return task.due < now
    }
    return false
}

function is_task_viewable_today(task) {
    let istoday = is_task_today(task)
    let isactive = task.kind === api.task_kinds.active
    let ispast = is_task_past(task)
    return istoday || (isactive && ispast)
}

let task_sublist = (title, id, filterfn, displayfn, visible, togglefn) =>  
    html`
    <div class="sublist">
        <h4 id="${id}">${title} <button class="viewlist" @click=${togglefn}>${visible ? '-' : "+"}</button></h4>
        <ul>
        ${ visible ? html`
            ${Object.values(api.tasklist).filter(filterfn).sort((x,y)=>x.date-y.date).map(displayfn)}
        ` : null }
        </ul>
        </div>
` 

function dated_task_sublist(title, id, filterfn, displayfn, visible, togglefn) {
    let listo = []
    let datelists = {}
    let currentdate = ''
    let dateid = 0
    for (let task of Object.values(api.tasklist).filter(filterfn).sort((x,y)=>x.date-y.date)) {
        let datestring = formatdate(task.date)
        if (currentdate != datestring) {
            dateid = task.date
            currentdate = datestring
            datelists[dateid] = []
        }
        datelists[dateid].push(displayfn(task))
    }
    // console.log('datelists', datelists)
    for (let [k,v] of Object.entries(datelists).sort(([k1,v1], [k2,v2])=>k2-k1)) {
            listo.push(html`<h3>${formatdate(k)}</h3>`)
            for (let taskview of v) {
                listo.push(taskview)
            }

    }
    return html`
    <div class="sublist">
        <h4 id="${id}">${title} <button class="viewlist" @click=${togglefn}>${visible ? '-' : "+"}</button></h4>
        <ul>
        ${ visible ? listo
         : null }
        </ul>
        </div>
    
    `
}

let visiblelists = {'attention': true, 'today':true, 'future':false, 'past': false}
let togglevisible = (kind) => visiblelists[kind] = !visiblelists[kind]

let tasklist = () => html`
    <div id="tasklist">
        ${task_sublist('Future', 'futuretasks', is_task_future, task_template, visiblelists['future'], render_after(() => togglevisible('future')))}
        ${task_sublist('Today', 'todaytasks', is_task_viewable_today, task_template, visiblelists['today'], render_after(() => togglevisible('today')))}
        ${dated_task_sublist('Past', 'pasttasks', is_task_past, task_template, visiblelists['past'], render_after(() => togglevisible('past')))}
    </div>
`

// tasklist = () => html`
//     <div id="tasklist">
//         <ul>
//             ${Object.values(api.tasklist)
//                 .sort((a,b)=>a.date-b.date)
//                 .map(dated_ttask)}
//         </ul> 
//     </div>
// `

let errorbanner = () => html`
    <div id="errorbanner">Error: ${api.error} <button @click=${render_after(api.reset_error)}>X</button></div>
`

let tlogin = () => html`
    <div id="userdata">
        <form id="loginform" onsubmit="return false">
            <input name="username">
            <input name="password" type="password">
        </form>
        <button @click=${render_after(api.login, api.fetch_todays_tasks)}>Login</button>
    </div>`

let tuserdata = () => html`
    <div id="userdata">
        <h3>${api.current_user_data.username}</h3>
        <button @click=${render_after(api.logout)}>🚫</button>
    </div>
`

let refresh_bar = () => html`
    <div id='refreshbar'>
        <button @click=${render_after(api.fetch_todays_tasks)}>Refresh Today</button>
        <button @click=${render_after(api.fetch_all_tasks)}>Refresh All</button>
    </div>
    `

function main_template() {
    return html`
    <div>
    <header>
        <h1>BlakBullet</h1>
        ${api.current_user_data.username ? tuserdata() : null}
    </header>
    ${api.current_user_data.username ? newtask() : null}
    ${api.current_user_data.username ? refresh_bar() : null}
    ${api.error ? errorbanner() : null}
    ${api.current_user_data.username ? tasklist() : null}
    ${api.current_user_data.username ? null : tlogin()}
    ${current_toast_message ? html`
        <div id='toast'>${current_toast_message}</div> 
    ` : null}
    ${current_modal ? html`
        <div id="modalblur" @click=${render_after(()=>{current_modal = null})}></div>
        <div id="modal">${current_modal}</div> 
        <button id="modalcancel" @click=${render_after(()=>{current_modal = null})}>X</button>
    ` : null}
    </div>
    `
}


function render_file() {
    render(main_template(), document.body)
}
render_file()

function cap_word(word) {
    if (word) {
        return word.charAt(0).toUpperCase() + word.slice(1)
    }
}