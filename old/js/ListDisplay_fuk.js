export class ListDisplay {
    constructor(root_id, {sorters, filters, newview, makenewitem, update}) {
        let rootnode = document.getElementById(root_id)
        if (!rootnode) {
            throw new ReferenceError(`Root node #${root_id} not found`)
        }
        this.rootnode = rootnode
        this.sorters = sorters
        this.filters = filters
        this.new_view = newview
        this.update_items = update
        this.make_new_item = makenewitem
        this.search_term = ''
        this.raw_items = {}
        this.all_views = {}
        this.current_views = []
    }

    get_last_visible_element() {
        let l = this.current_views[this.current_views.length - 1]
        if (l) {
            return this.raw_items[l.id]
        } else {
            return false
        }
    }

    get_first_visible_element() {
        let l = this.current_views[0]
        if (l) {
            return this.raw_items[l.id]
        } else {
            return false
        }
    }

    async change_filtering(filtername, searchterm = "") {
        // this.filtering = 'none'
        this.rootnode.firstElementChild.scrollIntoView({behavior: 'smooth'})
        // let prevlast = this.get_last_visible_element()
        // await this.view_refresh()
        // await transition_stop(prevlast)
        this.search_term = searchterm
        this.filtering = this.filters[filterame]
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
        // Before we begin, we want to get any items that the client might
        // have that we don't
        Object.assign(this.raw_items, this.update_items())
        // We go over every item in the master
        // item list, and require them to be updated
        for (let item of Object.entries(this.raw_items)) {
            let id = item.id
            // We see if the item was created yet
            let itemview = this.all_views[id]
            // If we don't have the item, we make it
            if (!itemview) {
                itemview = new TaskItem(id)
                itemview.list = this
                // and record it
                this.all_views[id] = itemview
                // and signal that we need to add it
                toadd.push(itemview)
            } else {
                // If we have the item already, we refresh it
                itemview.refresh_view()
            }
        }
        // We make sure that display_tasks and all_tasks are proper
        this.view_filtersort()

        let latest = undefined
        // Now let's process all of the elements
        // Using an arrow function because it
        // lets 'this' mean 'this TaskList object'
        this.all_views.forEach((task, i) => {
            let taskitem = this.all_views[task.id]
            let displayed = this.display_tasks.includes(task)
            // If the item is in the toadd list, it is new,
            // and we want to do additional processing
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
