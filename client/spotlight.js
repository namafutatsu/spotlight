/* global WebSocket, SPOTLIGHT_WS_URL */

const TYPE_IMAGE = 'image'
const TYPE_REGION = 'region'
const TYPE_MESSAGE = 'message'

const WS_ADDRESS = SPOTLIGHT_WS_URL
const COLOR_BLACK = '#000'

const TEXT_TO_SHADOW_FACTOR = 0.1 // ratio distance text-shadow / distance text-mouse
const TEXT_SHADOW_BLUR_MIN = 5
const TEXT_SHADOW_BLUR_MAX = 20
const TEXT_SHADOW_ALPHA_MIN = 3
const TEXT_SHADOW_ALPHA_MAX = 8

function createSpotlightClient (canvas, socket) {
  const ctx = canvas.getContext('2d')

  let width = null
  let height = null
  let regionData = null
  let messages = []

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

  function setMessage (message) {
    messages.push(message)
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

  function drawMessages () {
    messages.forEach(message => {
      const distx = regionData.left + regionData.width / 2 - message.x - ctx.measureText(message.text).width / 2
      const disty = regionData.top + regionData.height / 2 - message.y
      var distmax = ((regionData.width * regionData.width) + (regionData.height * regionData.height)) / 4
      var blurfactor = TEXT_SHADOW_BLUR_MAX / distmax
      var shadowfactor = TEXT_SHADOW_ALPHA_MAX / distmax
      var dist = (distx * distx) + (disty * disty)
      ctx.shadowOffsetX = -distx * TEXT_TO_SHADOW_FACTOR
      ctx.shadowOffsetY = -disty * TEXT_TO_SHADOW_FACTOR
      ctx.shadowBlur = Math.max(parseInt(blurfactor * dist, 10), TEXT_SHADOW_BLUR_MIN)
      var alpha = Math.max(parseInt(shadowfactor * dist, 10), TEXT_SHADOW_ALPHA_MIN)
      ctx.shadowColor = 'rgba(0,0,0,' + (1 - alpha / 10) + ')'
      ctx.font = message.font
      ctx.fillText(message.text, message.x, message.y)
    })
  }

  function resetCanvas () {
    ctx.fillStyle = COLOR_BLACK
    ctx.fillRect(0, 0, width, height)
  }

  return {
    askForImage,
    askForRegionData,
    setImageDetails,
    setMessage,
    setRegionData,
    drawRegionPixels,
    drawMessages
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
      client.drawMessages()
    } else {
      const msg = JSON.parse(rawMsg.data)
      switch (msg.type) {
        case TYPE_IMAGE:
          client.setImageDetails(msg.width, msg.height)
          break
        case TYPE_MESSAGE:
          client.setMessage(msg)
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
