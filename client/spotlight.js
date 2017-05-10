/* global WebSocket, SPOTLIGHT_WS_URL */

const TYPE_IMAGE = 'image'
const TYPE_REGION = 'region'

const WS_ADDRESS = SPOTLIGHT_WS_URL
const COLOR_BLACK = '#000'

function createSpotlightClient (canvas, socket) {
  const ctx = canvas.getContext('2d')

  let width = null
  let height = null
  let regionData = null

  function askForImage (imageName) {
    socket.send(JSON.stringify({
      type: 'init',
      image_name: imageName
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
    const pixels = imgData.data
    const buffer = new Uint8Array(data)
    for (let i = 0; i < pixels.length; i++) {  // FIXME(vperron): Optimize this.
      pixels[i] = buffer[i]
    }
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

document.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('image')
  const socket = new WebSocket(WS_ADDRESS)
  socket.binaryType = 'arraybuffer'

  const client = createSpotlightClient(canvas, socket)

  canvas.addEventListener('mousemove', (event) => {
    event.preventDefault()
    client.askForRegionData(event.offsetX, event.offsetY)
  })

  socket.onopen = function () {
    console.log(`WS opened on ${WS_ADDRESS}`)
    client.askForImage('image.jpg')  // TODO(vperron): This has to become dynamic.
  }

  socket.onmessage = function (rawMsg) {
    if (rawMsg.data instanceof ArrayBuffer) {
      client.drawRegionPixels(rawMsg.data)
    } else {
      const msg = JSON.parse(rawMsg.data)
      switch (msg.type) {
        case TYPE_IMAGE:
          client.setImageDetails(msg.width, msg.height)
          break
        case TYPE_REGION:
          client.setRegionData(msg.region)
          break
      }
    }
  }

  socket.onclose = function () {
    console.log(`WS closed on ${WS_ADDRESS}`)
    // TODO(vperron): This WS should reconnect !
  }
})
