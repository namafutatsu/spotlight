const fs = require('fs')
const Canvas = require('canvas')

const MIN_WINDOW_SIZE = 100  // pixels
const WINDOW_SIZE_IMG_RATIO = 4  // you need "that N scrolls" to see the whole image
const INNER_RADIUS_RATIO = 0.7  // the closer to 0, the blurrier the circle bounds.

let maxImgDimension = null // in pixels
let windowSize = null
let outerRadius = null
let innerRadius = null

function circle (data) {
  for (let i = -windowSize / 2; i < windowSize / 2; i += 1) {
    for (let j = -windowSize / 2; j < windowSize / 2; j += 1) {
      const d = i * i + j * j
      if (d > outerRadius) {
        data[((i + windowSize / 2) * windowSize) * 4 + (j + windowSize / 2) * 4 + 0] = 0
        data[((i + windowSize / 2) * windowSize) * 4 + (j + windowSize / 2) * 4 + 1] = 0
        data[((i + windowSize / 2) * windowSize) * 4 + (j + windowSize / 2) * 4 + 2] = 0
      } else if (d <= outerRadius && d >= (innerRadius)) {
        // normD is [0, 1]: 1 on outer limit, 0 inner.
        const normD = ((d - innerRadius) / (outerRadius - innerRadius))
        data[((i + windowSize / 2) * windowSize) * 4 + (j + windowSize / 2) * 4 + 0] *= (1 - normD)
        data[((i + windowSize / 2) * windowSize) * 4 + (j + windowSize / 2) * 4 + 1] *= (1 - normD)
        data[((i + windowSize / 2) * windowSize) * 4 + (j + windowSize / 2) * 4 + 2] *= (1 - normD)
      }
    }
  }
}

function computeWindowSize (handicap = 0) {
  windowSize = Math.max(
    MIN_WINDOW_SIZE,
    maxImgDimension / WINDOW_SIZE_IMG_RATIO
  )
  windowSize = Math.max(windowSize - handicap, 0)
  outerRadius = windowSize * windowSize / 4
  innerRadius = outerRadius * INNER_RADIUS_RATIO
}

function getCanvasImageFrom (filePath) {
  const img = new Canvas.Image()
  const data = fs.readFileSync(filePath)
  img.src = data
  maxImgDimension = Math.max(img.width, img.height)
  computeWindowSize()
  return img
}

function getRegion (coords) {
  return {
    top: coords.y - windowSize / 2,
    left: coords.x - windowSize / 2,
    width: windowSize,
    height: windowSize
  }
}

function getPixelRegionInImage (img, region) {
  const canvas = new Canvas(region.width, region.height)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, -region.left, -region.top)
  const imgData = ctx.getImageData(0, 0, region.width, region.height)
  circle(imgData.data)  // TODO(vperron): Restore this and opptimize efficiency.
  return imgData.data
}

module.exports = {
  getCanvasImageFrom,
  getRegion,
  getPixelRegionInImage
}
