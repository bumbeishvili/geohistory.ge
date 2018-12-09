function Canvas() {
  var points = [], width = 500, height = 500, container = 'body';

  function main() {
    var containerSelection = d3.select(container);

    var canvas = containerSelection.patternify({ tag: 'canvas', selector: 'canvas-container' })
      .attr('width', width)
      .attr('height', height);

    return main;
  }

  main.run = function () {
    return main();
  }

  main.container = function (value) {
    if (!arguments.length) return container;
    container = value;
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