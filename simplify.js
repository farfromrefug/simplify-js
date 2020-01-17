/*
 (c) 2017, Vladimir Agafonkin
 Simplify.js, a high-performance JS polyline simplification library
 mourner.github.io/simplify-js
*/

(function() {
    'use strict';

    // to suit your point format, run search/replace for '.latitude' and '[longitudeKey]';
    // for 3D version, see 3d branch (configurability would draw significant performance overhead)

    // square distance between 2 points
    function getSqDist(p1, p2, latitudeKey, longitudeKey) {
        var dx = p1[latitudeKey] - p2[latitudeKey],
            dy = p1[longitudeKey] - p2[longitudeKey];

        return dx * dx + dy * dy;
    }

    // square distance from a point to a segment
    function getSqSegDist(p, p1, p2, latitudeKey, longitudeKey) {
        var x = p1[latitudeKey],
            y = p1[longitudeKey],
            dx = p2[latitudeKey] - x,
            dy = p2[longitudeKey] - y;

        if (dx !== 0 || dy !== 0) {
            var t = ((p[latitudeKey] - x) * dx + (p[longitudeKey] - y) * dy) / (dx * dx + dy * dy);

            if (t > 1) {
                x = p2[latitudeKey];
                y = p2[longitudeKey];
            } else if (t > 0) {
                x += dx * t;
                y += dy * t;
            }
        }

        dx = p[latitudeKey] - x;
        dy = p[longitudeKey] - y;

        return dx * dx + dy * dy;
    }
    // rest of the code doesn't care about point format

    // basic distance-based simplification
    function simplifyRadialDist(points, options) {
        var prevPoint = points[0],
            newPoints = [prevPoint],
            point;
        var tolerance = options.tolerance;
        var latitudeKey = options.latitudeKey;
        var longitudeKey = options.longitudeKey;
        for (var i = 1, len = points.length; i < len; i++) {
            point = points[i];

            if (getSqDist(point, prevPoint, latitudeKey, longitudeKey) > tolerance) {
                newPoints.push(point);
                prevPoint = point;
            }
        }

        if (prevPoint !== point) newPoints.push(point);

        return newPoints;
    }

    function simplifyDPStep(points, first, last, options, simplified) {
        var tolerance = options.tolerance;
        var maxSqDist = tolerance,
            index;
        var latitudeKey = options.latitudeKey;
        var longitudeKey = options.longitudeKey;
        console.log('simplifyDPStep', options, latitudeKey, longitudeKey);
        for (var i = first + 1; i < last; i++) {
            var sqDist = getSqSegDist(points[i], points[first], points[last], latitudeKey, longitudeKey);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > tolerance) {
            if (index - first > 1) simplifyDPStep(points, first, index, options, simplified);
            simplified.push(points[index]);
            if (last - index > 1) simplifyDPStep(points, index, last, options, simplified);
        }
    }

    // simplification using Ramer-Douglas-Peucker algorithm
    function simplifyDouglasPeucker(points, options) {
        var last = points.length - 1;

        var simplified = [points[0]];
        simplifyDPStep(points, 0, last, options, simplified);
        simplified.push(points[last]);

        return simplified;
    }

    // both algorithms combined for awesome performance
    function simplify(points, options) {
        if (points.length <= 2) return points;
        options = options || {};
        const tolerance = options.tolerance !== undefined ? options.tolerance * options.tolerance : 1;
        const actualOptions = { tolerance: tolerance, latitudeKey: options.latitudeKey, longitudeKey: options.longitudeKey };
        console.log('simplify', options, points);
        points = !!options.highestQuality ? points : simplifyRadialDist(points, actualOptions);
        points = simplifyDouglasPeucker(points, actualOptions);

        return points;
    }

    // export as AMD module / Node module / browser or worker variable
    if (typeof define === 'function' && define.amd)
        define(function() {
            return simplify;
        });
    else if (typeof module !== 'undefined') {
        module.exports = simplify;
        module.exports.default = simplify;
    } else if (typeof self !== 'undefined') self.simplify = simplify;
    else window.simplify = simplify;
})();
