// Direct copy from Observable notebook
// https://observablehq.com/@mbostock/owls-to-the-max

import * as d3 from 'd3'

// TinyQueue from https://github.com/mourner/tinyqueue
export default class TinyQueue {
    constructor(data = [], compare = defaultCompare) {
        this.data = data;
        this.length = this.data.length;
        this.compare = compare;

        if (this.length > 0) {
            for (let i = (this.length >> 1) - 1; i >= 0; i--) this._down(i);
        }
    }

    push(item) {
        this.data.push(item);
        this.length++;
        this._up(this.length - 1);
    }

    pop() {
        if (this.length === 0) return undefined;

        const top = this.data[0];
        const bottom = this.data.pop();

        if (--this.length > 0) {
            this.data[0] = bottom;
            this._down(0);
        }

        return top;
    }

    peek() {
        return this.data[0];
    }

    _up(pos) {
        const {data, compare} = this;
        const item = data[pos];

        while (pos > 0) {
            const parent = (pos - 1) >> 1;
            const current = data[parent];
            if (compare(item, current) >= 0) break;
            data[pos] = current;
            pos = parent;
        }

        data[pos] = item;
    }

    _down(pos) {
        const {data, compare} = this;
        const halfLength = this.length >> 1;
        const item = data[pos];

        while (pos < halfLength) {
            let left = (pos << 1) + 1;
            let best = data[left];
            const right = left + 1;

            if (right < this.length && compare(data[right], best) < 0) {
                left = right;
                best = data[right];
            }
            if (compare(best, item) >= 0) break;

            data[pos] = best;
            pos = left;
        }

        data[pos] = item;
    }
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

// The actual Owls to the Max implementation
export async function* owlsToTheMax(imageContext, width, height, area_power = 0.5) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    class Quad {
        constructor(x, y, w, h) {
            const [r, g, b, error] = colorFromHistogram(computeHistogram(x, y, w, h));
            this.x = x, this.y = y, this.w = w, this.h = h;
            this.color = `#${(0x1000000 + (r << 16) + (g << 8) + b).toString(16).substring(1)}`;
            this.score = error * Math.pow(w * h, area_power);
        }
        split() {
            const dx = this.w / 2, x1 = this.x, x2 = this.x + dx;
            const dy = this.h / 2, y1 = this.y, y2 = this.y + dy;
            return [
                new Quad(x1, y1, dx, dy),
                new Quad(x2, y1, dx, dy),
                new Quad(x1, y2, dx, dy),
                new Quad(x2, y2, dx, dy)
            ];
        }
    }

    function computeHistogram(x, y, w, h) {
        const {data} = imageContext.getImageData(x, y, w, h);
        const histogram = new Uint32Array(1024);
        for (let i = 0, n = data.length; i < n; i += 4) {
            ++histogram[0 * 256 + data[i + 0]];
            ++histogram[1 * 256 + data[i + 1]];
            ++histogram[2 * 256 + data[i + 2]];
            ++histogram[3 * 256 + data[i + 3]];
        }
        return histogram;
    }

    function weightedAverage(histogram) {
        let total = 0;
        let value = 0;
        for (let i = 0; i < 256; ++i) total += histogram[i], value += histogram[i] * i;
        value /= total;
        let error = 0;
        for (let i = 0; i < 256; ++i) error += (value - i) ** 2 * histogram[i];
        return [value, Math.sqrt(error / total)];
    }

    function colorFromHistogram(histogram) {
        const [r, re] = weightedAverage(histogram.subarray(0, 256));
        const [g, ge] = weightedAverage(histogram.subarray(256, 512));
        const [b, be] = weightedAverage(histogram.subarray(512, 768));
        return [Math.round(r), Math.round(g), Math.round(b), re * 0.2989 + ge * 0.5870 + be * 0.1140];
    }

    const quads = new TinyQueue([], (a, b) => b.score - a.score);
    quads.push(new Quad(0, 0, width, height));

    for (let i = 0; true; ++i) {
        const q = quads.pop();
        if (q === undefined || q.score < 200 || q.w < 3 || q.h < 3) break;
        const qs = q.split();
        const qsi = d3.interpolate([q, q, q, q], qs);
        qs.forEach(quads.push, quads);
        for (let j = 1, m = Math.max(1, Math.floor(q.w / 10)); j <= m; ++j) {
            const t = d3.easeCubicInOut(j / m);
            context.clearRect(q.x, q.y, q.w, q.h);
            for (const s of qsi(t)) {
                context.fillStyle = s.color;
                context.beginPath();
                // 円の半径を領域内に収める
                const radius = Math.min(s.w, s.h) / 2 * 1;
                context.arc(s.x + s.w / 2, s.y + s.h / 2, radius, 0, 2 * Math.PI);
                context.fill();
            }
            yield context.canvas;
        }
    }
    
    // Draw remaining quads
    while (quads.length > 0) {
        const q = quads.pop();
        context.fillStyle = q.color;
        context.beginPath();
        const radius = Math.min(q.w, q.h) / 2 * 0.95;
        context.arc(q.x + q.w / 2, q.y + q.h / 2, radius, 0, 2 * Math.PI);
        context.fill();
    }
    yield context.canvas;
    
    // Store final quads for transition
    const finalQuads = [];
    const tempQuads = new TinyQueue([], (a, b) => b.score - a.score);
    tempQuads.push(new Quad(0, 0, width, height));
    
    for (let j = 0; true; ++j) {
        const q = tempQuads.pop();
        if (q === undefined || q.score < 200 || q.w < 3 || q.h < 3) {
            if (q) finalQuads.push(q);
            break;
        }
        const qs = q.split();
        qs.forEach(tempQuads.push, tempQuads);
    }
    
    while (tempQuads.length > 0) {
        const q = tempQuads.pop();
        if (q) finalQuads.push(q);
    }
    
    // Smooth morph transition with frame interpolation
    const frames = 30;
    
    // Create a buffer canvas for smooth blending
    const bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = width;
    bufferCanvas.height = height;
    const bufferContext = bufferCanvas.getContext('2d');
    
    for (let i = 0; i <= frames; i++) {
        const progress = i / frames;
        const easeProgress = d3.easeCubicInOut(progress);
        
        // Clear main canvas
        context.clearRect(0, 0, width, height);
        
        // Draw circles to buffer
        bufferContext.clearRect(0, 0, width, height);
        
        finalQuads.forEach(q => {
            const cx = q.x + q.w / 2;
            const cy = q.y + q.h / 2;
            const radius = Math.min(q.w, q.h) / 2 * 0.95;
            
            // Interpolate circle properties
            const morphRadius = radius * (1 - easeProgress * 0.3); // Slightly shrink circles
            
            bufferContext.fillStyle = q.color;
            bufferContext.beginPath();
            bufferContext.arc(cx, cy, morphRadius, 0, 2 * Math.PI);
            bufferContext.fill();
        });
        
        // Blend circles and original image
        context.globalAlpha = 1 - easeProgress;
        context.drawImage(bufferCanvas, 0, 0);
        
        context.globalAlpha = easeProgress;
        context.drawImage(imageContext.canvas, 0, 0);
        
        context.globalAlpha = 1;
        yield context.canvas;
    }
    
    // Final frame - just the original image
    context.clearRect(0, 0, width, height);
    context.drawImage(imageContext.canvas, 0, 0);
    yield context.canvas;
}