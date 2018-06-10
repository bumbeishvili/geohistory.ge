function DrawPoints() {
  var points = [], width, height;

  function main() {
    // regl instance
    var regl = createREGL({
    });

    const drawDots = regl({

      // circle code comes from:
      // https://www.desultoryquest.com/blog/drawing-anti-aliased-circular-points-using-opengl-slash-webgl/
      frag: `
      precision mediump float;
      uniform vec4 color;
      void main () {
        float r = 0.0, delta = 0.0, alpha = 1.0;
        vec2 cxy = 2.0 * gl_PointCoord - 1.0;
        r = dot(cxy, cxy);
        if (r > 1.0) {
            discard;
        }
        gl_FragColor = color * alpha;
      }`,

      vert: `
      precision mediump float;
      attribute vec2 position;
      attribute float pointWidth;
      uniform float stageWidth;
      uniform float stageHeight;
      // helper function to transform from pixel space to normalized
      // device coordinates (NDC). In NDC (0,0) is the middle,
      // (-1, 1) is the top left and (1, -1) is the bottom right.
      // Stolen from Peter Beshai's great blog post:
      // http://peterbeshai.com/beautifully-animate-points-with-webgl-and-regl.html
      vec2 normalizeCoords(vec2 position) {
        // read in the positions into x and y vars
        float x = position[0];
        float y = position[1];
        return vec2(
          2.0 * ((x / stageWidth) - 0.5),
          // invert y to treat [0,0] as bottom left in pixel space
          -(2.0 * ((y / stageHeight) - 0.5)));
      }
      void main () {
        gl_PointSize = pointWidth;
        gl_Position = vec4(normalizeCoords(position), 0, 1);
      }`,

      attributes: {
        // There will be a position value for each point
        // we pass in
        position: function (context, props) {
          return props.points.map(function (point) {
            return [point.x, point.y]
          });
        },
        // Now pointWidth is an attribute, as each
        // point will have a different size.
        pointWidth: function (context, props) {
          return props.points.map(function (point) {
            return point.size;
          });
        },
      },

      uniforms: {
        color: function (context, props) {
          // just to be a bit strange, oscillate the color a bit.
          return [0.5137254901960784, 0.011764705882352941, 0.011764705882352941, 1.000];
        },
        // FYI: there is a helper method for grabbing
        // values out of the context as well.
        // These uniforms are used in our fragment shader to
        // convert our x / y values to WebGL coordinate space.
        stageWidth: regl.context('drawingBufferWidth'),
        stageHeight: regl.context('drawingBufferHeight')
      },

      count: function (context, props) {
        // set the count based on the number of points we have
        return props.points.length
      },
      primitive: 'points'
    });

    if (points.length) {
      regl.frame(function (context) {
        updateCoods(context.time);
        // And draw it!
        drawDots({
          points: points
        });

        if (!points.length) {
          regl.destroy();
        }
      });
    }

    const ease = d3.easeLinear;

    function updateCoods(elapsed) {
      // update point positions (interpolate between source and target)
      points.forEach(point => {
        if (!point.old) {
          point.elapsedBase = elapsed;
          point.old = true;
          //  point.duration = 10;
        }

        point.elapsed = elapsed - point.elapsedBase;

        // compute how far through the animation we are (0 to 1)
        var t = Math.min(1, ease(point.elapsed / point.duration));

        point.x = point.sx * (1 - t) + point.tx * t;
        point.y = point.sy * (1 - t) + point.ty * t;

        if (t == 1) {
          var index = points.indexOf(point);
          //points.splice(index, 1);
        }
      });

    }
  }

  main.run = function () {
    main();
    return main;
  }

  main.width = function (value) {
    if (!arguments.length) return width;
    width = value;
    return main;
  }

  main.height = function (value) {
    if (!arguments.length) return height;
    height = value;
    return main;
  }

  main.points = function (value) {
    if (!arguments.length) return points;
    points = value;
    return main;
  }

  main.addPoints = function (value) {
    value.forEach(d => {
      points.push(d)
    })
    return main;
  }
  return main;
}