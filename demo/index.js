var load = require('img')
var domready = require('domready')
var uri = require('baboon-image-uri')
var delaunify = require('../')

domready(function() {
	load(uri, function(err, img) {
		if (err) 
			throw err

		var result = delaunify(img, { count: 350 })
		document.body.appendChild(result)
	})
})

