function parseJSON (data) {
    console.log(data)
}

function requestedResponse () {
    config = JSON.parse(this.responseText)
    console.log(config)

    var script = document.createElement('script')
    script.src = '//spreadsheets.google.com/feeds/list/'+config.spreadsheet+'/'+config.sheets[0]+'/public/values?alt=json-in-script&callback=parseJSON'

    document.head.appendChild(script)
}

var request = new XMLHttpRequest()
request.onload = requestedResponse
request.open("get", "config.json", true)
request.send()
