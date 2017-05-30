const path = require('path')

const constants = require('./constants')
const imgUtils = require('./image_utils')

function createSpotlightServer (wsInstance) {
  let img = null
  let alreadySentCoords = null
  let newCoords = null

  function areDifferentCoords (a, b) {
    return (a.x !== b.x || a.y !== b.y)
  }

  function initImage (imageName, width, height) {
    img = imgUtils.getCanvasImageFrom(
      path.join(__dirname, imageName),
      width, height)
    wsInstance.send(JSON.stringify({
      type: 'image',
      width: img.width,
      height: img.height
    }))
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
