
// export let api_root = "https://api.bullet.blakwurm.com/"
export let api_root = "https://bulletapi.blakwurm.com/"
// export let api_root = "http://localhost:4242/"
// export let api_root = "http://192.168.0.69:4242/"

export let error = null
export function reset_error() {
    error = null
}

export const task_kinds = {
    active: "active",
    note: "note",
    delegated: "delegated",
    deferred: "deferred",
    canceled: "canceled",
    rescheduled: "rescheduled",
    struck: "struck",
    completed: "completed"
}

let null_user_data =  {
    token: null,
    token_type: null,
    refresh_token: null,
    username: null,
    user_id: null,
}

export let current_user_data = Object.assign({}, null_user_data)

export let tasklist = {}
// console.log(tasklist)

export async function init() {
    current_user_data = JSON.parse(localStorage.getItem('current_user_data')) || current_user_data
    tasklist = JSON.parse(localStorage.getItem('tasklist')) || tasklist
    if (current_user_data.username) {
        await fetch_all_tasks()
    }
}

export function logout() {
    current_user_data = null_user_data
    tasklist = {}
}

export async function login() {
    // Sometimes the first login attempt doesn't work.
    // If it doesn't work three times, then it probably won't
    for (let tries = 3; tries > 0; tries--) {
        try {
            let res = await _login_logic()
            return
        } catch (error) {
            console.error(error)
        }
    }
    error = "Login Failed"
}

async function _login_logic() {
    let formData = new FormData(document.getElementById('loginform'))
    let res = await fetch(api_root+'token/', {
        method: 'POST',
        body: formData
    })
    res = await res.json()
    // console.log(res)
        console.log(current_user_data)
    if (res.token) {
        current_user_data.token = res.token        
        current_user_data.refresh_token = res.refresh_token
        current_user_data.token_type = res.token_type
        res = await makerequest('me')
        // console.log(res)
        if (res.username) {
            current_user_data.username = res.username
            current_user_data.user_id = res.id
            localStorage.setItem('current_user_data', JSON.stringify(current_user_data))
            return true
        }
    }
    // throw new Error('Login Failed')
}

export const seconds_in_a_day = 86400
function make_today_range() {
    let today = Math.ceil(Date.now() / 1000)
    let tomorrow = today + seconds_in_a_day
    let yesterday = today - seconds_in_a_day
    return {tomorrow, today, yesterday}
}

function import_task_list(tlist) {
    if (tlist && Array.isArray(tlist)) {
        tlist.forEach(t=>tasklist[t.id] = t)
    } else if (tlist.id) {
        tasklist[tlist.id] = tlist
    }
}

export async function fetch_todays_tasks() {
    let {today, tomorrow, yesterday} = make_today_range()
    let serverlist = await makerequest('tasks', 'GET', {after:yesterday,before:tomorrow})
    if (!serverlist) {
        return
    }
    import_task_list(serverlist)
    localStorage.setItem('tasklist', JSON.stringify(tasklist))
}


export async function fetch_all_tasks() {
    let serverlist = await (makerequest('tasks'))
    // console.log(serverlist)
    if (!serverlist) {
        return undefined
    }
    import_task_list(serverlist)
    localStorage.setItem('tasklist', JSON.stringify(tasklist))
}

export async function make_new_note(){
    return await make_task_item(true)
}

export async function make_new_task() {
    return await make_task_item(false)
}

async function make_task_item(isnote) {
    let newform = new FormData(document.getElementById('newtask'))
    let newtask = {
        isnote: isnote,
        text: newform.get("text"),
        date: Math.ceil(Date.now() / 1000)
    }
    if (newform.get('duedate')) {
        newtask.due = Math.ceil(new Date(newform.get('duedate')).getTime() / 1000)
    }
    // console.log(JSON.stringify(newtask))
    let res = await makerequest('task', 'POST', newtask)
    // console.log(res)
    tasklist[res.id] = res
}

export async function task_finish(taskID) {
    let res = await makerequest('tasks/', 'PUT', {id:taskID, kind:kind_string_to_number.completed})
    tasklist[res.id] = res
}

function confirm_action_front_text(action) {
    let ret = cap_word(action)
    switch (action) {
        case "changedue":
            ret = "Change Due Date of"
            break
        case "removedue":
            ret = "Remove Due Date from"
            break
    }
    return ret
}

function confirm_action(task_id, action, extra) {
    let task = tasklist[task_id]
    let carryontext = `${confirm_action_front_text(action)} "${task.text}"`
    if (extra) {
        if (typeof extra === "number") {
            let d = new Date(extra*1000)
            if (action === 'changedue') {
                extra = d.toLocaleDateString() + " at " + d.toLocaleTimeString()
            } else {
                extra = d.toLocaleDateString()
            }
        }
        carryontext += ` to ${extra}`
    }
    carryontext += "?"
    let carryon = confirm(carryontext)
    return carryon
}

export async function do_action(task_id, action, extra) {
    let p = `task/${task_id}/action/${action}`
    if (extra) {
        p=`${p}/${encodeURIComponent(extra)}`
    }
    let carryon = confirm_action(task_id, action, extra)
    if (carryon) {
        let serverlist = await makerequest(p, 'PUT')
        import_task_list(serverlist)
    }
}

function encode_query_string(queryopts, base) {
    let query = "?"
    for (let [k,v] of Object.entries(queryopts)) {
        query = `${query}${k}=${encodeURIComponent(v)}&`
    }
    if (query === "?") {
        return base
    } else {
        return base+query
    }
}

async function makerequest(path, method="GET", query={}) {
    let params = {
        method: method,
        headers: {
                'Authorization': `${current_user_data.token_type} ${current_user_data.token}`
        }
    }
    path = encode_query_string(query, path)
    // console.log(path)
    // console.log('making request')
    let res = null
    try {
        res = await fetch(`${api_root}${path}`, params)
    } catch (thrown) {
        error = thrown.message
        throw thrown
    }
    if (res.status === 401) {
        let success = await refresh_token()
        if (success) {
            return await makerequest(path, method, query)
        }
    }
    let responsebody = await res.json()
    console.log(responsebody)
    if (responsebody.status === 1) {
        return responsebody.user || responsebody.task_list || responsebody.task
    } else {
        error = responsebody.message
        return null
    }
} 

async function refresh_token() {
    let params = {
        method: 'POST',
        body: JSON.stringify(current_user_data)
    }
    let res = await fetch(`${api_root}token/refresh/`, params)
    if (res.status === 200) {
        let b = await res.json()
        // console.log(b)
        Object.assign(current_user_data, b)
        localStorage.setItem('current_user_data', JSON.stringify(current_user_data))
        return true
    } else {
        error = "Please re-login"
        logout()
    }
    // console.log(res)
}

function cap_word(word) {
    if (word) {
        return word.charAt(0).toUpperCase() + word.slice(1)
    }
}
