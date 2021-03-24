
export let weekdays = [
    'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
]

export let months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
    'Sep', 'Oct', 'Nov', 'Dec'
]

// let formatdate = (timestamp) => new Date(timestamp * 1000).toLocaleDateString()
export function prettydate(timestamp, pretext = '') {
    if (!timestamp) return
    let thisdate = new Date(timestamp * 1000)
    return `${pretext}${weekdays[thisdate.getDay()]} ${months[thisdate.getMonth()]} ${thisdate.getDate()}, ${thisdate.getFullYear()}`
}

export function prettydatetime(timestamp, pretext = '') {
    if (!timestamp) return 
    let datestring = prettydate(timestamp)
    let thisdate = new Date(timestamp * 1000)
    return `${pretext}${datestring}, ${thisdate.toLocaleTimeString()}`
}

export function get_today_range() {
    // Get the earliest time of today, as a timestamp
    let morning_stamp = new Date().setHours(0,0,0,0) / 1000
    // Get the latest time of today, as a timestamp
    let night_stamp = new Date().setHours(23,59,59,59) / 1000
    return [morning_stamp, night_stamp]
}

export function when_is_date(timestamp) {
    // The earliest and latest values for today
    let [morning, night] = get_today_range()
    // If neither of the following two things are true, then
    // the timestamp is within today
    let ret = 'today'
    // If the timestamp is less then the smallest possible
    // value that could be within today, then the timestamp
    // is in the past
    if (timestamp < morning) {
        ret = 'past'
    // If the timestmap is greater then the largest possible
    // value that could be in today, then the timestamp
    // is in the future
    } else if (night < timestamp) {
        ret = 'future'
    }
    return ret
}
