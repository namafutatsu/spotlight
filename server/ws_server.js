const path = require('path')
const fs = require('fs')

const constants = require('./constants')
const imgUtils = require('./image_utils')

function createSpotlightServer (wsInstance) {
  let img = null
  let messages = null
  let alreadySentCoords = null
  let newCoords = null

  function areDifferentCoords (a, b) {
    return (a.x !== b.x || a.y !== b.y)
  }

  function initImage (imageName, width, height) {
    img = imgUtils.getCanvasImageFrom(
      path.join(constants.IMAGE_PATH, imageName),
      width, height)
    wsInstance.send(JSON.stringify({
      type: 'image',
      width: img.width,
      height: img.height
    }))
    fs.readFile(path.join(__dirname, imageName + '.json'), 'utf8', function (err, data) {
      if (err) return
      messages = JSON.parse(data)
      messages.forEach(message => {
        message.type = 'message'
        wsInstance.send(JSON.stringify(message))
      })
    })
  }

  function setCoords (coords) {
    if (
        alreadySentCoords == null ||
        areDifferentCoords(coords, alreadySentCoords)
    ) {
      newCoords = coords
    }
  }

  function sendPixels () {
    if (newCoords == null) return

    const region = imgUtils.getRegion(newCoords)
    wsInstance.send(JSON.stringify({
      type: constants.MSG_REGION,
      region: region
    }))

    const regionArray = imgUtils.getPixelRegionInImage(img, region)
    wsInstance.send(regionArray, { binary: true })

    alreadySentCoords = newCoords
    newCoords = null
  }

  return {
    initImage,
    setCoords,
    sendPixels
  }
}

module.exports = {
  createSpotlightServer
}
