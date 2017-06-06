const fs = require('fs')
const path = require('path')

const throttle = require('lodash.throttle')
const WebSocketServer = require('ws').Server

const constants = require('./constants')
const spotlight = require('./ws_server')

const wss = new WebSocketServer({
  port: constants.WEBSOCKET_PORT,
  perMessageDeflate: true,  // gzip compression, protocol-level
})

console.log(`WebSocket server listening on port ${constants.WEBSOCKET_PORT}`)

wss.on('connection', function (wsInstance) {
  console.log('Spotlight client connected')

  const server = spotlight.createSpotlightServer(wsInstance)

  const interval = setInterval(server.sendPixels, constants.REFRESH_RATE)

  wsInstance.on('message', throttle(function (rawMsg, flags) {
    if (flags.binary) {
      const name = Math.random().toString(36).substr(2, 8)  // random name.
      const filename = path.join(constants.IMAGE_PATH, name)
      if (!fs.existsSync(constants.IMAGE_PATH)) {
        fs.mkdirSync(constants.IMAGE_PATH, rawMsg)
      }
      fs.writeFileSync(filename, rawMsg)
      wsInstance.send(JSON.stringify({
        type: 'upload',
        name: name
      }))
    } else {
      const msg = JSON.parse(rawMsg)
      switch (msg.type) {
        case constants.MSG_INIT:
          server.initImage(msg.image_name, msg.width, msg.height)
          break
        case constants.MSG_COORDS:
          server.setCoords(msg.coords)
          break
      }
    }
  }, 25))  // In ms. "experimentally" chosen to get a smooth rendering.

  wsInstance.on('close', function () {
    console.log('WS: closing and removing interval sender')
    clearInterval(interval)
  })
})
