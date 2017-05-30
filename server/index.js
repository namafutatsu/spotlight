const WebSocketServer = require('ws').Server

const constants = require('./constants')
const spotlight = require('./ws_server')

const wss = new WebSocketServer({
  port: constants.WEBSOCKET_PORT,
  perMessageDeflate: false // enable sending binary data, bug in node-ws
})

console.log(`WebSocket server listening on port ${constants.WEBSOCKET_PORT}`)

wss.on('connection', function (wsInstance) {
  console.log('Spotlight client connected')

  const server = spotlight.createSpotlightServer(wsInstance)

  const interval = setInterval(server.sendPixels, constants.REFRESH_RATE)

  wsInstance.on('message', function (rawMsg) {
    const msg = JSON.parse(rawMsg)
    switch (msg.type) {
      case constants.MSG_INIT:
        server.initImage(msg.image_name, msg.width, msg.height)
        break
      case constants.MSG_COORDS:
        server.setCoords(msg.coords)
        break
    }
  })

  wsInstance.on('close', function () {
    console.log('WS: closing and removing interval sender')
    clearInterval(interval)
  })
})
