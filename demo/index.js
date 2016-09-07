const load = require('load-img');
const lerp = require('lerp');
const uri = 'test.jpg';
const mat2d = require('gl-matrix-mat2d');
const delaunify = require('../');
const clamp = require('clamp');
const randomCircle = require('gl-vec2/random');
const triangulate = require('delaunay-triangulate');
const randomFloat = require('random-float');
const triangleCentroid = require('triangle-centroid');
const luminance = require('color-luminance');
const getImagePixels = require('get-image-pixels');
const newArray = require('new-array');
const colorStyle = require('color-style');
const getBounds = require('bound-points');

load(uri, (err, img) => {
  if (err) throw err;
  const width = img.width;
  const height = img.height;
  const pixels = getImagePixels(img);
  const radius = Math.min(width, height) / 2;
  const positions = getRandomPoints(500, width / 2, height / 2, radius);
  const cells = triangulate(positions);

  const dpr = window.devicePixelRatio;
  const canvas = document.createElement('canvas');
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  // canvas.style.width = `${width}px`;
  // canvas.style.height = `${height}px`;
  canvas.style.width = '100%';

  const ctx = canvas.getContext('2d');
  ctx.save();
  ctx.scale(dpr, dpr);

  cells.forEach(function (cell) {
    const p0 = positions[cell[0]];
    const p1 = positions[cell[1]];
    const p2 = positions[cell[2]];

    

    const L = triangleLuminance(positions, cell, pixels, width, height);
    const color = colorStyle(L * 255, L * 255, L * 255);
    // const color = `hsl(0, 0%, ${L * 100}%)`;
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.lineTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.lineTo(p0[0], p0[1]);
    
    ctx.save();
    ctx.clip();
    ctx.beginPath();
    drawHatches(ctx, [ p0, p1, p2 ], L);
    
    ctx.strokeStyle = 'black';
    // ctx.fillStyle = color;
    ctx.stroke();

    ctx.restore();
    
  });
  ctx.restore();

  document.body.style.margin = '0';
  document.body.appendChild(canvas);
});

function drawHatches (ctx, triangle, L) {
  const angle = 0//Math.random() * 2 * Math.PI;
  const bounds = getBounds(triangle);

  const minBounds = bounds[0];
  const maxBounds = bounds[1];
  const width = maxBounds[0] - minBounds[0];
  const height = maxBounds[1] - minBounds[1];
  const cx = minBounds[0] + width / 2;
  const cy = minBounds[1] + height / 2;
  const radius = Math.sqrt(width * width + height * height) / 2;
  const lines = Math.min(30, Math.floor(radius * 1.5 * (1 - L)));

  const rotatedTriangle = triangle.map(p => {
    var sin = Math.sin(angle);
    var cos = Math.cos(angle);

    // to origin
    var tx = p[0] - cx;
    var ty = p[1] - cy;

    // rotate point
    var nx = (cos * tx) - (sin * ty);
    var ny = (sin * tx) + (cos * ty);

    // translate back
    return [ nx + cx, ny + cy ];
  });
  const rotatedBounds = getBounds(rotatedTriangle);
  const minRotBounds = rotatedBounds[0];
  const maxRotBounds = rotatedBounds[1];

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.translate(-cx, -cy);
  for (var i = 0; i < lines; i++) {
    const t = i / (lines - 1);
    const y = lerp(minBounds[1], maxBounds[1], t);
    ctx.moveTo(minBounds[0], y);
    ctx.lineTo(maxBounds[0], y);
  }
  ctx.restore();
}

function triangleLuminance (positions, cells, pixels, width, height) {
  const p0 = positions[cells[0]];
  const p1 = positions[cells[1]];
  const p2 = positions[cells[2]];

  // centroid of triangle
  const cx = (p0[0] + p0[0] + p0[0]) / 3;
  const cy = (p0[1] + p1[1] + p2[1]) / 3;
  const L = sample(pixels, cx, cy, width, height);
  return L / 255;
}

function getRandomPoints (count, cx, cy, radius) {
  return newArray(count).map(x => {
    const offset = randomCircle([], randomFloat(0, radius));
    offset[0] += cx;
    offset[1] += cy;
    return offset;
  });
}

function sample (data, cx, cy, width, height) {
  const offsets = [ 5, 4, -3, -2, -1, 0, 1, 2, 3, 4, 5 ];
  const samples = offsets.length;
  const distance = 1;
  var sum = 0;
  // original point
  cx = Math.floor(cx % width);
  cy = Math.floor(cy % height);
  for (var yCount = 0; yCount < samples; yCount++) {
    for (var xCount = 0; xCount < samples; xCount++) {
      const tx = clamp(cx + offsets[xCount] * distance, 0, width);
      const ty = clamp(cy + offsets[yCount] * distance, 0, height);
      const i = tx + (ty * width);
      const r = data[i * 4 + 0];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      sum += luminance(r, g, b);
    }
  }
  return sum / (samples * samples);
}
