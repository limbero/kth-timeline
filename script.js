function parseJSON (data) {
    console.log(data)
}

function requestedResponse () {
    config = JSON.parse(this.responseText)
}

var request = new XMLHttpRequest()
request.onload = requestedResponse
request.open("get", "config.json", true)
request.send()

var script = document.createElement('script')
script.src = '//spreadsheets.google.com/feeds/list/'+config.spreadsheet+'/'+config.sheet[0]+'/public/values?alt=json-in-script&callback=parseJSON'

document.head.appendChild(script)
