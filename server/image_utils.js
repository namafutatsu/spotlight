const fs = require('fs')
const Canvas = require('canvas')

const MIN_WINDOW_SIZE = 100  // pixels
const WINDOW_SIZE_IMG_RATIO = 4  // you need "that N scrolls" to see the whole image
const INNER_RADIUS_RATIO = 0.93 // circle radius / shadow radius
const SHADOW_BLUR = 10 // level of blurring effect

let maxImgDimension = null // in pixels
let windowSize = null
let mask = null

function computeWindowSize (handicap = 0) {
  windowSize = Math.max(
    MIN_WINDOW_SIZE,
    maxImgDimension / WINDOW_SIZE_IMG_RATIO
  )
  windowSize = Math.max(windowSize - handicap, 0)
}

function createMask () {
  mask = new Canvas(windowSize, windowSize)
  mask.width = windowSize
  mask.height = windowSize
  const maskCtx = mask.getContext('2d')
  maskCtx.fillStyle = 'black'
  maskCtx.fillRect(0, 0, mask.width, mask.height)
  maskCtx.globalCompositeOperation = 'xor'
  const radius = windowSize / 2
  const innerRadius = radius * INNER_RADIUS_RATIO
  maskCtx.arc(radius, radius, innerRadius, 0, 2 * Math.PI)
  maskCtx.fill()
  maskCtx.shadowBlur = SHADOW_BLUR
  maskCtx.shadowColor = 'black'
  maskCtx.fill()
}

function getCanvasImageFrom (filePath) {
  const img = new Canvas.Image()
  const data = fs.readFileSync(filePath)
  img.src = data
  maxImgDimension = Math.max(img.width, img.height)
  computeWindowSize()
  createMask()
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
  ctx.drawImage(mask, 0, 0)
  const imgData = ctx.getImageData(0, 0, region.width, region.height)
  return imgData.data
}

module.exports = {
  getCanvasImageFrom,
  getRegion,
  getPixelRegionInImage
}
