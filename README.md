# delaunify

[![unstable](http://badges.github.io/stability-badges/dist/unstable.svg)](http://github.com/badges/stability-badges)

Randomly delaunay-triangulates an image by distributing 2D points across the surface, and then triangulating it. The colours of each triangle is determined by the pixel color underneath the triangle's centroid.

A new canvas is returned with the same size as the image.

```js
var load = require('img')
var domready = require('domready')
var uri = require('baboon-image-uri')
var delaunify = require('../')

domready(function() {
	//load image with baboon for testing
	load(uri, function(err, img) {
		if (err) 
			throw err

		//delaunify the image into a canvas
		var result = delaunify(img, { count: 350 })
		document.body.appendChild(result)
	})
})
```

![img](http://i.imgur.com/tR0XK11.png)

## Usage

[![NPM](https://nodei.co/npm/delaunify.png)](https://nodei.co/npm/delaunify/)

#### `delaunify(img[, opts])`

Triangulates the image. By default, it uses a random distribution of points. 

Options:

- `min` an [x,y] array for the minimum random value (default `[0, 0]`)
- `max` an [x,y] array for the maximum random value (default `[imgWidth, imgHeight]`)
- `count` the number of points to distribute (default `50`)
- `fill` a boolean, whether to apply a fill (default `true`)
- `stroke` a boolean, whether to apply a stroke (default `true`)
- `points` an array of [x,y] points to use instead of random; this will ignore the `min`, `max` and `count` options

## License

MIT, see [LICENSE.md](http://github.com/mattdesl/delaunify/blob/master/LICENSE.md) for details.
