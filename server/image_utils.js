const fs = require('fs')
const Canvas = require('canvas')

const MIN_WINDOW_SIZE = 100  // pixels
const WINDOW_SIZE_IMG_RATIO = 4  // you need "that N scrolls" to see the whole image
const SHADOW_RADIUS_RATIO = 0.93 // shadow radius / circle radius
const SHADOW_BLUR = 10 // level of blurring effect https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/shadowBlur

let maxImgDimension = null // in pixels
let windowSize = null
let mask = null

function computeWindowSize (handicap = 0) {
  windowSize = Math.max(
    MIN_WINDOW_SIZE,
    maxImgDimension / WINDOW_SIZE_IMG_RATIO
  )
  windowSize = Math.floor(Math.max(windowSize - handicap, 0))
}

function createMask () {
  mask = new Canvas(windowSize, windowSize)
  const maskCtx = mask.getContext('2d')
  maskCtx.fillStyle = 'black'
  maskCtx.fillRect(0, 0, mask.width, mask.height)
  maskCtx.globalCompositeOperation = 'xor'
  const radius = Math.floor(windowSize / 2)
  const innerRadius = Math.floor(radius * SHADOW_RADIUS_RATIO)
  maskCtx.arc(radius, radius, innerRadius, 0, 2 * Math.PI)
  maskCtx.fill()
  maskCtx.shadowBlur = SHADOW_BLUR
  maskCtx.shadowColor = 'black'
  maskCtx.fill()
}

function getCanvasImageFrom (filePath, maxWidth, maxHeight) {
  const originalImg = new Canvas.Image()
  const data = fs.readFileSync(filePath)
  originalImg.src = data

  let ratio = 1.0
  if (originalImg.height > maxHeight) {
    ratio = maxHeight / originalImg.height
  } else if (originalImg.width > maxWidth) {
    ratio = maxWidth / originalImg.width
  }

  const finalWidth = ratio * originalImg.width
  const finalHeight = ratio * originalImg.height
  const cnv = new Canvas(finalWidth, finalHeight)
  const ctx = cnv.getContext('2d')
  ctx.drawImage(originalImg, 0, 0, finalWidth, finalHeight)

  const img = new Canvas.Image()
  img.src = cnv.toBuffer()

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
