/* global WebSocket, SPOTLIGHT_WS_URL */

const TYPE_IMAGE = 'image'
const TYPE_REGION = 'region'

const SPOTLIGHT_CLIENT_URL = location.protocol + '//' + location.host

const COLOR_BLACK = '#000'


function createSpotlightClient (canvas, socket) {
  const ctx = canvas.getContext('2d')

  let width = null
  let height = null
  let regionData = null

  function askForImage (imageName) {
    socket.send(JSON.stringify({
      type: 'init',
      image_name: imageName,
      width: window.innerWidth * 0.95,  // to ensure we are smaller than the window
      height: window.innerHeight * 0.95
    }))
  }

  function askForRegionData (x, y) {
    socket.send(JSON.stringify({
      type: 'coords',
      coords: {
        x: x,
        y: y
      }
    }))
  }

  function setImageDetails (_width, _height) {
    width = _width
    height = _height
    ctx.canvas.width = width
    ctx.canvas.height = height
    resetCanvas()
  }

  function setRegionData (_regionData) {
    regionData = _regionData
  }

  function drawRegionPixels (data) {
    resetCanvas()

    const imgData = ctx.createImageData(regionData.width, regionData.height)
    imgData.data.set(new Uint8Array(data))
    ctx.putImageData(imgData, regionData.left, regionData.top)
  }

  function resetCanvas () {
    ctx.fillStyle = COLOR_BLACK
    ctx.fillRect(0, 0, width, height)
  }

  return {
    askForImage,
    askForRegionData,
    setImageDetails,
    setRegionData,
    drawRegionPixels
  }
}

function handleFileUpload () {
  const file = this.files[0]

  if ((file.size / 1024 / 1024) >= 10.0) {
    document.getElementById('status').innerHTML = "File is too big."
    return
  }

  const socket = new WebSocket(SPOTLIGHT_WS_URL)
  socket.binaryType = 'arraybuffer'

  socket.onopen = function () {
    console.log(`WS opened for upload on ${SPOTLIGHT_WS_URL}`)
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
    const url = `${SPOTLIGHT_CLIENT_URL}#${msg.name}`
    document.getElementById('status').href = url
    document.getElementById('status').innerHTML = url
    socket.close()
  }
}

document.addEventListener('DOMContentLoaded', function () {

  const imageHash = window.location.hash.substr(1)
  if (!imageHash) {
    document.body.innerHTML = '<input id="upload-input" type="file" accept="image/*"><a id="status"></span>'
    document.getElementById('upload-input').addEventListener('change', handleFileUpload, false)
    return
  }

  document.body.innerHTML = "<canvas id='image'></canvas>"

  const canvas = document.getElementById('image')
  const socket = new WebSocket(SPOTLIGHT_WS_URL)
  socket.binaryType = 'arraybuffer'

  const client = createSpotlightClient(canvas, socket)

  canvas.addEventListener('mousemove', (event) => {
    event.preventDefault()
    client.askForRegionData(event.offsetX, event.offsetY)
  })

  canvas.addEventListener('touchmove', (event) => {
    event.preventDefault()
    client.askForRegionData(event.touches[0].clientX, event.touches[0].clientY)
  })

  socket.onopen = function () {
    console.log(`WS opened on ${SPOTLIGHT_WS_URL}`)
    client.askForImage(imageHash)
  }

  socket.onmessage = function (rawMsg) {
    if (rawMsg.data instanceof ArrayBuffer) {
      client.drawRegionPixels(rawMsg.data)
    } else {
      const msg = JSON.parse(rawMsg.data)
      switch (msg.type) {
        case TYPE_IMAGE:
          client.setImageDetails(msg.width, msg.height)
          canvas.style.position = 'absolute'
          canvas.style.left = `${(window.innerWidth - msg.width) / 2}px`
          canvas.style.top = `${(window.innerHeight - msg.height) / 2}px`
          break
        case TYPE_REGION:
          client.setRegionData(msg.region)
          break
      }
    }
  }

  socket.onclose = function () {
    console.log(`WS closed on ${SPOTLIGHT_WS_URL}`)
    // TODO(vperron): This WS should reconnect !
  }
})
