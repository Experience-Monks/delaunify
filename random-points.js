var randf = require('randf')

module.exports = function positions(opt) {
	opt = opt||{}
	var min = opt.min||[0,0]
	var max = opt.max||[1,1]
	var n = opt.count||0
	
	var out = []
	for (var i=0; i<n; i++) {
		var x = randf(min[0], max[0]),
			y = randf(min[1], max[1])
		out.push([ x, y ])
	}
	return out
}