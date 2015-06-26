var klaradekurser = []
var counter = 0

function parseJSON (data) {
    for(entry of data.feed.entry)
        if(entry.hasOwnProperty('gsx$slutdatum') && entry.gsx$slutdatum.$t !== '')
            klaradekurser.push([entry.gsx$kurs.$t,entry.gsx$slutdatum.$t])

    counter++ //use this for progress bar?
    if (counter == config.sheets.length) {
        klaradekurser = klaradekurser.sort(Comparator)
        spitData()
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

function spitData() {
    var date = new Date(document.getElementById('timemachine').innerHTML)
    date.setDate(date.getDate()+1)

    dateString = date.getFullYear()+'-'
    dateString += ((date.getMonth()+1) < 10 ? '0'+(date.getMonth()+1) : (date.getMonth()+1))+'-'
    dateString += ((date.getDate()) < 10 ? '0'+(date.getDate()) : (date.getDate()))

    document.getElementById('timemachine').innerHTML = dateString

    var delay = 50

    if(klaradekurser.length > 0 && dateString === klaradekurser[0][1]) {
        var paragraph = document.createElement('p')
        paragraph.appendChild(document.createTextNode(klaradekurser.shift()[0]))
        document.body.appendChild(paragraph)
        delay = 500
    }

    if( new Date(dateString).getFullYear() !== new Date().getFullYear() || new Date(dateString).getMonth() !== new Date().getMonth() || new Date(dateString).getDate() !== new Date().getDate() )
        setTimeout(spitData, delay)
}

var request = new XMLHttpRequest()
request.onload = requestedResponse
request.open('get', 'config.json', true)
request.send()

//helper function for sorting array of arrays
function Comparator(a,b){
    if (a[1] < b[1]) return -1
    if (a[1] > b[1]) return 1
    return 0
}
