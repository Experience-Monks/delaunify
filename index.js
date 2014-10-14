var randomPoints = require('./random-points')
var randf = require('randf')
var triangulate = require('delaunay-triangulate')
var getPixels = require('get-image-pixels')
var toStyle = require('color-style')
var number = require('as-number')

function sample(data, cx, cy, width, height) {
    cx = ~~cx % width
    cy = ~~cy % height
    var i = cx + (cy * width)
    return [
    	data[i*4 + 0],
        data[i*4 + 1],
        data[i*4 + 2],
        data[i*4 + 3] ]
}

function contour(image) {
	return [
		[0, 0],
		[image.width, 0],
		[image.width, image.height],
		[0, image.height]
	]
}

function triangleColor(positions, cells, pixels, width, height) {
	var p0 = positions[cells[0]],
		p1 = positions[cells[1]],
		p2 = positions[cells[2]]

    //centroid of triangle
    var cx = (p0[0] + p0[0] + p0[0])/3
    var cy = (p0[1]+ p1[1] + p2[1])/3
    var color = sample(pixels, cx, cy, width, height)
    return toStyle(color)
}

module.exports = function process(img, opt) {
	var width = img.width,
		height = img.height

	opt = opt||{}
	opt.count = number(opt.count, 50)
	opt.max = opt.max||[width, height]
	
		
	var canvas = opt.canvas || document.createElement('canvas')
	canvas.width = width
	canvas.height = height

	var ctx = canvas.getContext('2d')
	ctx.drawImage(img, 0, 0)

	var positions = opt.points || randomPoints(opt).concat(contour(img))
	var pixels = getPixels(img)
	var tris = triangulate(positions)

	tris.forEach(function(t) {
		var p0 = positions[t[0]],
			p1 = positions[t[1]],
			p2 = positions[t[2]]

		ctx.beginPath()
		ctx.moveTo(p0[0], p0[1])
		ctx.lineTo(p1[0], p1[1])
		ctx.lineTo(p2[0], p2[1])
		ctx.lineTo(p0[0], p0[1])

		var color = triangleColor(positions, t, pixels, width, height)

		ctx.strokeStyle = color
		ctx.fillStyle = color
		if (opt.fill !== false) ctx.fill()
		if (opt.stroke !== false) ctx.stroke()
	})
	return canvas
}