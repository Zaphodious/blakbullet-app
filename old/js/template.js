import * as api from './apiclient.js'
import * as dateutil from './date.js'
import {transition_stop} from './transitionutil.js'

function timefilter(timeframe) {
    return function(task) {
        let actualframe = dateutil.when_is_date(task.date)
        let isgood = actualframe === timeframe 
        return isgood
    }
}

const sorters = {
    'date': (a,b) => b.date - a.date
}

export class TaskList {
    constructor(rootnode) {
        this.modalsystem = new ModalSystem(this)
        console.log(this.modalsystem)
        this.rootnode = rootnode
        this.__arr = {}
        this.display_tasks = []
        this.all_tasks = []
        this.filtering = 'today'
        this.sorting = 'date'
        this.api = api
        this.firsttime = true
        this.search_term = ''
        this.filters = {
            'today': timefilter('today'),
            'future': timefilter('future'),
            'past': timefilter('past'),
            'none': ()=>false,
            'search': (t)=>t.text.includes(this.search_term)
        }
    }

    get_last_visible_element() {
        let l = this.display_tasks[this.display_tasksVj.length - 1]
        if (l) {
            return this.__arr[l.id]
        } else {
            return false
        }
    }

    get_first_visible_element() {
        let l = this.display_tasks[0]
        if (l) {
            return this.__arr[l.id]
        } else {
            return false
        }
    }

    async change_filtering(newfiltering, searchterm = "") {
        // this.filtering = 'none'
        this.rootnode.firstElementChild.scrollIntoView({behavior: 'smooth'})
        // let prevlast = this.get_last_visible_element()
        // await this.view_refresh()
        // await transition_stop(prevlast)
        this.search_term = searchterm
        this.filtering = newfiltering
        this.rootnode.firstElementChild.scrollIntoView({behavior: 'smooth'})
        await this.view_refresh()
    }

    async view_refresh() {
        await this.view_filtersort()
        // if we create any elements, we want to add them to
        // the dom later. 
        // Note that this happens for all elements at once when the page loads,
        // and then once for each time a task is added
        let toadd = []
        // We go over every task in the master
        // task list, and process them
        for (let id of Object.keys(api.tasklist)) {
            // We see if the item was created yet
            let t = this.__arr[id]
            // If we don't have the item, we make it
            if (!t) {
                t = new TaskItem(id)
                t.list = this
                // and record it
                this.__arr[id] = t
                // and signal that we need to add it
                toadd.push(t)
            } else {
                // If we have the item already, we refresh it
                t.refresh_view()
            }
        }
        // We make sure that display_tasks and all_tasks are proper
        this.view_filtersort()

        let latest = undefined
        // Now let's process all of the elements
        // Using an arrow function because it
        // lets 'this' mean 'this TaskList object'
        this.all_tasks.forEach((task, i) => {
            let taskitem = this.__arr[task.id]
            let displayed = this.display_tasks.includes(task)
            let added = toadd.includes(taskitem)
            if (added) {
                // Add the 'inserted' class, setting
                // the element up for animation
                taskitem.elem.classList.add('inserted')
                // Get the element following 
                let prev = this.all_tasks[i+1]
                // If we have a following element, insert before it
                if (prev) {
                    this.rootnode.insertBefore(taskitem.elem, prev.elem)
                // If we don't have a following element, append
                } else {
                    this.rootnode.append(taskitem.elem)
                }
                // defering to a callback is necessary in order
                // for the transition animation to actually work
                // requestAnimationFrame does not help, but
                // a 0-millisecond timeout does
                setTimeout(() => {
                    // remove the 'inserted' class, letting the 
                    // transition animations play
                    taskitem.elem.classList.remove('inserted')
                // Setting the timeout to stagger a little 
                // adds a cascade-y effect 
                }, this.display_tasks.indexOf(task) * 100);
                if (displayed) {
                    latest = taskitem
                }
            }
            // Now, we determine if a task item can
            // be shown or not. If 'display_tasks' (which
            // is the result of filtering our sorted list
            // of all tasks) contains the item, call the manager
            // object's 'show' method
            if (displayed)  {
                taskitem.show(!this.firsttime)
            } else {
            // and if not, call the 'hide' method
                taskitem.hide(!this.firsttime)
            }
        })

        // Now that all of the things have been processed, we want
        // to scroll the most recent added element into view
        if (latest && !this.firsttime) {
            latest.elem.addEventListener('transitionstart', function(e) {
                this.scrollIntoView({'behavior': 'smooth'})
            })
        } else {
            await transition_stop(this.get_last_visible_element())
            this.rootnode.firstElementChild.scrollIntoView({behavior: 'smooth'})
        }

        let last_displayed = this.display_tasks.slice(-1)[0]
        if (last_displayed) {
            await transition_stop(this.__arr[last_displayed.id].elem)
        }



        // setTimeout(() => {
        //     if (latest) {
        //         latest.elem.scrollIntoView({'behavior': 'smooth'})
        //     }
        // }, 100);




        // If we've done this once, then it's no longer the first time
        this.firsttime = false
    }

    async view_refresh_server() {
        await api.fetch_all_tasks()
        return await this.view_refresh()
    }

    async view_filtersort() {
        // First, sort all of the tasks, and cache result
        this.all_tasks = Object.values(api.tasklist).sort(sorters[this.sorting])
        // If we want to search, then we need to add a search filter
        // Then, filter the sorted tasks, and cache that result
        this.display_tasks = this.all_tasks.filter(this.filters[this.filtering])
        // Chin links ahoy!
        return this
    }

}

class TaskItem {
    constructor(id) {
        this.list = undefined
        this.id=id
        this.visible=true
        let task = api.tasklist[id]
        let last_kind = task.kind
        let tmp = get_template('taskitem', {
            '.text': task.text,
            '.kind': task.kind,
            '.date': dateutil.prettydate(task.date),
            '.due': dateutil.prettydatetime(task.due, 'Due: ')
        })
        this.elem = tmp.children[0]
        this.elem.dataset.id=id
        this.elem.classList.add('visible')
        this.elem.addEventListener('transitionend', e=>this.elem.classList.replace('hidden-start', 'hidden'))
        this.populate_action_buttons()
    }
    async hide(transition) {
        if (this.visible) {
            this.visible = false
            this.elem.classList.remove('visible')
            this.elem.classList.remove('visible-start')
            if (transition) {
                this.elem.classList.add('hidden-start')
                await transition_stop(this.elem)
                this.elem.classList.replace('hidden-start', 'hidden')
            } else {
                this.elem.classList.add('hidden')
            }
        }
    }
    async show(transition) {
        if (!this.visible) {
            this.visible = true
            this.elem.classList.remove('hidden')
            this.elem.classList.remove('hidden-start')
            if (transition) {
                this.elem.classList.add('visible-start')
                setTimeout(() => {
                    this.elem.classList.replace('visible-start', 'visible')
                }, 0);
            } else {
                this.elem.classList.add('visible')
            }
        }
    }
    async refresh_view() {
        let task = api.tasklist[this.id]
        element_text_replace(this.elem, {
            '.text': task.text,
            '.kind': task.kind,
            '.date': dateutil.prettydate(task.date),
            '.due': dateutil.prettydatetime(task.due, 'Due: ')

        })
        this.populate_action_buttons()
    }
    async action_defer(doafter) {
        await api.do_action(this.id, 'defer', '', false)
        if (doafter) doafter()
        this.list.view_refresh()
    }
    async action_cancel(doafter) {
        await api.do_action(this.id, 'cancel', '', false)
        if (doafter) doafter()
        this.list.view_refresh()
    }
    async action_reactivate(doafter) {
        await api.do_action(this.id, 'reactivate', '', false)
        if (doafter) doafter()
        this.list.view_refresh()
    }
    async action_showall(doafter) {
        await this.list.modalsystem('all-actions',
            {setup:()=>this.populate_all_action_buttons()})
        if (doafter) doafter()
        this.list.view_refresh()
    }
    populate_all_action_buttons(ul, hide_modal_fn) {
        ul.textContent = ''
        let task = api.tasklist[this.id]
        let buttons = []
        if (task.kind === 'active') {
            buttons.push(make_action_button(()=>this.action_defer(hide_modal_fn), "Defer"))
            buttons.push(make_action_button(()=>this.action_cancel(hide_modal_fn), "Cancel"))
            buttons.push(make_action_button(()=>console.log('Delegate'), "Delegate"))
            buttons.push(make_action_button(()=>console.log('Reschedule'), "Reschedule"))
            buttons.push(make_action_button(()=>console.log('Cancel'), "Cancel"))
            buttons.push(make_action_button(()=>console.log('Strike'), "Strike"))
            buttons.push(make_action_button(()=>console.log('ChangeDue'), "Change When Due"))
            buttons.push(make_action_button(()=>console.log('RemoveDue'), "Remove Due"))
        }
        buttons.forEach(li=>ul.appendChild(li))
    }
    populate_action_buttons() {
        // cache the task
        let task = api.tasklist[this.id]
        console.log(task)
        // if the kind hasn't changed since last time, we don't
        // want to renew the buttons
        if (task.kind === this.last_kind) return
        // cache the actions ul, and remove the buttons therein
        let actions = this.elem.querySelector('.actions ul')
        actions.textContent = ''
        // If the task is 'active', we want to display 
        // defer, cancel, and 'all' buttons
        if (task.kind === 'active') {
            let x = make_action_button(()=>this.action_defer(), 'Def')
            let y = make_action_button(()=>this.action_cancel(), 'Can')
            let z = make_action_button(()=>this.action_showall(), 'All', false)
            actions.appendChild(x)
            actions.appendChild(y)
            actions.appendChild(z)
        }
        // If canceled, we waant the option to reinstate
        if (task.kind === 'canceled' || task.kind === 'struck') {
            let x = make_action_button(()=>this.action_reactivate(), 'Reup')
            actions.appendChild(x)
        }  

        if (task.kind === 'note') {
            let x = make_action_button(()=>console.log('edito'), 'Edit', false)
            actions.appendChild(x)
        }
    }

}

function make_action_button(action, text, needs_confirmation = true) {
    let b = document.createElement('button')
    let li = document.createElement('li')
    li.appendChild(b)
    b.textContent = text
    let asked = !needs_confirmation
    b.onclick = function() {
        if (asked) {
            action()
        }  else {
            let og = b.textContent
            b.textContent = 'Sure?'
            asked = true
            setTimeout(() => {
                asked = false
                b.textContent = og
            }, 1000);
        }
    }
    return li
}

function element_text_replace(element, texts) {
    Object.entries(texts).forEach(([k,v])=>{
        element.querySelector(k).textContent = v
        if (k === ".duetext") {
            console.log(v)
        }
    })
    return element
}
function get_template(templateID, texts, fade=false) {
    let elem = document.querySelector(`template#t_${templateID}`)
    let cloned = elem.content.cloneNode(true)
    let item = cloned.firstElementChild
    if (fade) {
        item.classList.add('inserted')
        cloned.afterInsert = function() {item.classList.remove('inserted')}

    }
    element_text_replace(cloned, texts)
    return cloned
}

class ModalSystem {
    constructor(tasklist) {
        this.tasklist = tasklist
        this.modals = [...document.querySelectorAll('.modal')].reduce((acc,elemthing)=>{acc[elemthing.id]=elemthing;return acc},{})
        console.log(Object.values(this.modals))
        prepare_modals(Object.values(this.modals))
        console.log(this.modals)
    }

    show(modaltype, extra = {}) {
        // Do pre-setup if needed
        if (extra.pre) {
            extra.pre(this)
        }
        // Get the modal element
        let elem = this.modals[`${modaltype}-modal`]
        // If the modal element is invalid, we don't continue
        console.log(elem)
        if (!elem) return
        // Ensure that other modals are hidden
        this.hide()
        // Kick-off the transition animation
        elem.classList.replace('hidden', 'visible-start')
        // Get the blur, and kick of its transition animation
        let blur = document.querySelector('#modal-blur')
        blur.classList.replace('hidden', 'visible-start')
        // Set a 0-milli timeout that will move the
        // transition animation to the next step
        setTimeout(() => {
            elem.classList.replace('visible-start', 'visible')
            blur.classList.replace('visible-start', 'visible')
        }, 0);
        if (extra.setup) {
            extra.setup(this)
        }
    }

    hide(extras = {}) {
        if (extras.pre) {
            extras.pre(this)
        }
        let modals = Object.values(this.modals)
        modals.forEach(e=>e.classList.replace('visible', 'hidden-start'))
        let blur = document.querySelector('#modal-blur')
        blur.classList.replace('visible', 'hidden-start')
        if (extras.post) {
            extras.post(this)
        }
    }




}

function prepare_modals(modals) {
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

function prepare_add_modal() {
    async function makenew(isnote) {
        if (isnote) {
            await api.make_new_note()
        } else {
            await api.make_new_task()
        }
        tasklist.view_refresh()
        clear_add_form()
        hide_modal()
    }
    document.querySelector('#new-task-button')
        .addEventListener('click', ()=>makenew(false))
    document.querySelector('#new-note-button')
        .addEventListener('click', ()=>makenew(true))
}

function clear_add_form() {
    document.querySelector('#newtask input').value = ''
    document.querySelector('#newtask textarea').value = ''
}