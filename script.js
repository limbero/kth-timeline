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
    kurser = kurser.sort(startOchSlutComparator)
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

  //starts off courses on the right date
  while(kurser.length > 0 && dateString === kurser[0].startdatum) {
    var kurs = kurser.shift()

    var element = document.createElement('div')
    element.id = kurs.kurskod
    element.className = 'kurs active'
    element.style.left = (100*(now.getTime()-ORIGIN.getTime())/(TODAY.getTime()-ORIGIN.getTime()))+'%'

    var p = document.createElement('p')
    p.innerHTML = kurs.kursnamn

    var div = document.createElement('div')
    div.id = kurs.kurskod+'line'
    div.className = 'line'

    element.appendChild(p)
    element.appendChild(div)
    document.getElementById('graph').appendChild(element)

    element.classList.add('show')

    if(kurs.slutdatum !== '') {
      startadekurser.push(kurs)
      startadekurser = startadekurser.sort(slutComparator)
    }
  }

  //bi-yearly date markers
  if( (now.getMonth() == 0 && now.getDate() == 1) ||  (now.getMonth() == 6 && now.getDate() == 1) ) {
    var element = document.createElement('div')
    element.className = 'marker'
    var p = document.createElement('p')
    p.innerHTML = dateString
    element.appendChild(p)
    element.style.left = (100*(now.getTime()-ORIGIN.getTime())/(TODAY.getTime()-ORIGIN.getTime()))+'%'
    document.getElementById('graph').appendChild(element)
  }

  //keeps 'em growing
  var courselines = document.getElementsByClassName('kurs active')
  for(var i = 0; i < courselines.length; i++) {
    var right = (100*(now.getTime()-ORIGIN.getTime())/(TODAY.getTime()-ORIGIN.getTime()))
    var left = courselines[i].style.left
    left = parseFloat(left.substring(0, left.length - 1))

    courselines[i].style.width = right-left+'%'
    if(document.getElementById('graph').getBoundingClientRect().right - courselines[i].getBoundingClientRect().left - getTextWidth(courselines[i].getElementsByTagName('p')[0].innerHTML) < 0) {
      courselines[i].getElementsByTagName('p')[0].classList.add('keepinside')
    }
  }

  //kills courses when they're done
  while(startadekurser.length > 0 && dateString === startadekurser[0].slutdatum) {
    var kurs = startadekurser.shift()
    document.getElementById(kurs.kurskod).classList.remove('active')
    document.getElementById(kurs.kurskod).classList.add('done')
  }

  //don't go into the actual future, stop if it's today
  if( new Date(dateString).getFullYear() !== TODAY.getFullYear() || new Date(dateString).getMonth() !== TODAY.getMonth() || new Date(dateString).getDate() !== TODAY.getDate() )
  setTimeout(timeTravel, 50)
}

var request = new XMLHttpRequest()
request.onload = requestedResponse
request.open('get', 'config.json', true)
request.send()

//helper functions for sorting
function startOchSlutComparator(a,b){
  var val = 0
  if(a.startdatum < b.startdatum) val = -1
  else if(a.startdatum > b.startdatum) val = 1
  else if(a.slutdatum === "" && b.slutdatum === "") val = 0
  else if(b.slutdatum === "") val = -1
  else if(a.slutdatum === "") val = 1
  else if(a.slutdatum < b.slutdatum) val = -1
  else if(a.slutdatum > b.slutdatum) val = 1
  return val
}
function slutComparator(a,b){
  var val = 0
  if(a.slutdatum === "" && b.slutdatum === "") val = 0
  else if(b.slutdatum === "") val = -1
  else if(a.slutdatum === "") val = 1
  else if(a.slutdatum < b.slutdatum) val = -1
  else if(a.slutdatum > b.slutdatum) val = 1

  return val
}
function getTextWidth(text) {
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'))
  var context = canvas.getContext('2d')
  context.font = '14px PT Serif'
  var metrics = context.measureText(text)
  return metrics.width
}
