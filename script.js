var ORIGIN = new Date('2011-08-15')
var TODAY = new Date()

var kurser = []
var startadekurser = []
var counter = 0

function parseJSON (data) {
    for(entry of data.feed.entry)
    if(entry.hasOwnProperty('gsx$startdatum') && entry.gsx$startdatum.$t !== '')
    kurser.push({"kurskod":entry.gsx$kurskod.$t,"kursnamn":entry.gsx$kurs.$t,"startdatum":entry.gsx$startdatum.$t,"slutdatum":entry.gsx$slutdatum.$t})

    counter++ //use this for progress bar?
    if(counter == config.sheets.length) {
        console.log(kurser)
        kurser = kurser.sort(startComparator)
        timeTravel()
    }
}

function requestedResponse () {
    config = JSON.parse(this.responseText)

    for(sheet of config.sheets) {
        var script = document.createElement('script')
        script.src = '//spreadsheets.google.com/feeds/list/'+config.spreadsheet+'/'+sheet.id+'/public/values?alt=json-in-script&callback=parseJSON'
        document.head.appendChild(script)
    }
}

function timeTravel() {
    var now = new Date(document.getElementById('timemachine').innerHTML)
    now.setDate(now.getDate()+1)

    dateString = now.getFullYear()+'-'
    dateString += ((now.getMonth()+1) < 10 ? '0'+(now.getMonth()+1) : (now.getMonth()+1))+'-'
    dateString += ((now.getDate()) < 10 ? '0'+(now.getDate()) : (now.getDate()))

    document.getElementById('timemachine').innerHTML = dateString

    while(kurser.length > 0 && dateString === kurser[0].startdatum) {
        var kurs = kurser.shift()
        
        var element = document.createElement('div')
        element.id = kurs.kurskod
        element.className = 'kurs active'
        var p = document.createElement('p')
        p.innerHTML = kurs.kursnamn
        var div = document.createElement('div')
        div.id = kurs.kurskod+'line'
        div.className = 'line'

        element.appendChild(p)
        element.appendChild(div)
        document.getElementById('graph').appendChild(element)

        document.getElementById(kurs.kurskod).style.left = (100*(now.getTime()-ORIGIN.getTime())/(TODAY.getTime()-ORIGIN.getTime()))+'%'
        document.getElementById(kurs.kurskod).classList.add('show')

        if(kurs.slutdatum !== '') {
            startadekurser.push(kurs)
            startadekurser = startadekurser.sort(slutComparator)
        }
    }

    var courselines = document.getElementsByClassName('kurs active')
    for(var i = 0; i < courselines.length; i++) {
        var right = (100*(now.getTime()-ORIGIN.getTime())/(TODAY.getTime()-ORIGIN.getTime()))
        var left = courselines[i].style.left
        left = parseFloat(left.substring(0, left.length - 1))

        courselines[i].style.width = right-left+'%'
    }

    while(startadekurser.length > 0 && dateString === startadekurser[0].slutdatum) {
        var kurs = startadekurser.shift()
        document.getElementById(kurs.kurskod).classList.remove('active')
        document.getElementById(kurs.kurskod).classList.add('done')
    }

    if( new Date(dateString).getFullYear() !== TODAY.getFullYear() || new Date(dateString).getMonth() !== TODAY.getMonth() || new Date(dateString).getDate() !== TODAY.getDate() )
    setTimeout(timeTravel, 50)
}

var request = new XMLHttpRequest()
request.onload = requestedResponse
request.open('get', 'config.json', true)
request.send()

//helper functions for sorting
function startComparator(a,b){
    if(a.startdatum < b.startdatum) return -1
    if(a.startdatum > b.startdatum) return 1
    return 0
}
function slutComparator(a,b){
    if(a.slutdatum < b.slutdatum) return -1
    if(a.slutdatum > b.slutdatum) return 1
    return 0
}
