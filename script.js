// function parseJSON (data) {
// }

function requestedResponse () {
    console.log(this.responseText)
}

var request = new XMLHttpRequest()
request.onload = requestedResponse
request.open("get", "config.json", true)
request.send()

// var script = document.createElement('script')
// script.src = '//spreadsheets.google.com/feeds/list/1hANk7xNMYR-bm8N5X_0TOLyn0X0u64FdgMr9YlyT5LI/o5yxovo/public/values?alt=json-in-script&callback=parseJSON'
//
// document.head.appendChild(script)
