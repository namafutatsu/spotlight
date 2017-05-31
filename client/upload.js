/* global location, FileReader, WebSocket, SPOTLIGHT_WS_URL */

const WS_ADDRESS = SPOTLIGHT_WS_URL
const SPOTLIGHT_URL = location.protocol + '//' + location.host

function handleFiles () {
  const file = this.files[0]

  if ((file.size / 1024 / 1024) >= 1.0) {
    document.getElementById('status').innerHTML = "File is too big."
    return
  }

  const socket = new WebSocket(WS_ADDRESS)
  socket.binaryType = 'arraybuffer'

  socket.onopen = function () {
    console.log(`WS opened for upload on ${WS_ADDRESS}`)
    const reader = new FileReader()
    reader.onload = () => {
      socket.send(reader.result)
      console.log(`Data successfully sent to WS`)
    }
    reader.readAsArrayBuffer(file)
  }

  socket.onmessage = function (rawMsg) {
    const msg = JSON.parse(rawMsg.data)
    console.log('Received data back from WS:', msg)
    const url = `${SPOTLIGHT_URL}#${msg.name}`
    document.getElementById('status').href = url
    document.getElementById('status').innerHTML = url
    socket.close()
  }
}

document.getElementById('upload-input')
  .addEventListener('change', handleFiles, false)
