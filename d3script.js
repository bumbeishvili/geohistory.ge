function getChart(params) {
    // Exposed variables
    var attrs = {
        id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
        svgWidth: 700,
        svgHeight: 700,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 5,
        marginLeft: 5,
        center: [43.5, 44],
        scale: 250,
        container: 'body',
        defaultTextFill: '#2C3E50',
        defaultFont: 'Helvetica',
        svgBackground: 'rgb(73, 73, 73)',
        countriesColor: '#191919',
        populationCirclesColor: '#39787E',
        geojson: null,
        districts: null,
        data: null
    };

    //InnerFunctions
    var updateData;

    //Main chart object
    var main = function (selection) {
        selection.each(function scope() {

            //Drawing containers
            var container = d3.select(this);

            //Calculated properties
            var calc = {}
            calc.id = "ID" + Math.floor(Math.random() * 1000000);  // id for event handlings
            calc.chartLeftMargin = attrs.marginLeft;
            calc.chartTopMargin = attrs.marginTop;
            calc.chartWidth = attrs.svgWidth - attrs.marginRight - calc.chartLeftMargin;
            calc.chartHeight = attrs.svgHeight - attrs.marginBottom - calc.chartTopMargin;


            /*##################################   HANDLERS  ####################################### */
            var handlers = {
                zoomed: null
            }

            /*##################################   BEHAVIORS ####################################### */
            var behaviors = {};
            behaviors.zoom = d3.zoom().on("zoom", d => handlers.zoomed(d));

            /* ############# PROJECTION ############### */

            var projection = d3.geoMercator()
                .scale(attrs.scale)
                .translate([calc.chartWidth * 0.56, calc.chartHeight * 0.33])
                .center(attrs.center);

            var path = d3.geoPath()
                .projection(projection);

            //################################ DRAWING ######################  
            //Drawing
            var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
                .attr('width', attrs.svgWidth)
                .attr('height', attrs.svgHeight)
                .attr('font-family', attrs.defaultFont)
                .style('background-color', attrs.svgBackground)
                .style('position', 'absolute')
            // .call(behaviors.zoom)

            var chart = svg.patternify({ tag: 'g', selector: 'chart' })
                .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')')

            //draw map
            chart.patternify({ tag: 'path', selector: 'map-path', data: attrs.geojson.features })
                .attr('d', path)
                .attr('fill', attrs.countriesColor)
                .attr('stroke', function (d) {
                    if (d.properties == undefined) return attrs.svgBackground;

                    if (georgiaBorderCountry(d)) return attrs.countriesColor;

                    return attrs.svgBackground;
                })
                .attr('stroke-width', 0.1)
                .classed('active', function (d) {
                    return d.properties.name == 'Georgia';
                });

            //zoom to georgia
            zoomToActiveCountry();

            //parse districts data
            var districtCoordinates = attrs.districts.map(function (d) {
                return {
                    long: +d.long,
                    lat: +d.lat,
                    population: d.population
                };
            });

            //calculate max population of districts
            var maxPopulation = d3.max(attrs.districts.map(x => +x.population));

            //linear scale for adjusting circle radius
            var radiusScale = d3.scaleLinear().domain([0, maxPopulation]).range([0.05, 0.5]);

            //add circles
            var populationCircles = chart.patternify({ tag: 'circle', selector: 'chart', data: districtCoordinates })
                .attr("cx", function (d) {
                    var projectionData = [d.lat, d.long]
                    return projection(projectionData)[0];
                })
                .attr("cy", function (d) {
                    var projectionData = [d.lat, d.long];
                    return projection(projectionData)[1];
                })
                .attr("r", function (d) {
                    return radiusScale(+d.population) + 'px';
                })
                .attr("fill", attrs.populationCirclesColor);

            handleWindowResize();

            d3.select('#button-container')
                .on('click', function (d) {
                    zoomToEurope();
                    d3.select(this)
                        .style('display', 'none');
                });


            /* #############################   FUNCTIONS    ############################## */

            function zoomToActiveCountry() {
                var d = d3.select('.active').data()[0];

                var bounds = path.bounds(d),
                    dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2,
                    scale = .9 / Math.max(dx / attrs.svgWidth, dy / attrs.svgHeight),
                    translate = [attrs.svgWidth / 2 - scale * x, attrs.svgHeight / 2 - scale * y];

                chart.transition()
                    .duration(3000)
                    .style("stroke-width", 1.5 / scale + "px")
                    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
            }

            function zoomToEurope() {
                var leftBounds = path.bounds(attrs.geojson.features.find(x => x.properties.name == 'Germany'));
                var topBounds = path.bounds(attrs.geojson.features.find(x => x.properties.name == 'Poland'));
                var rightBounds = path.bounds(attrs.geojson.features.find(x => x.properties.name == 'Azerbaijan'));
                var bottomBounds = path.bounds(attrs.geojson.features.find(x => x.properties.name == 'Bulgaria'));

                var bounds = [
                    [leftBounds[0][0], topBounds[0][1]],
                    [rightBounds[1][0], bottomBounds[1][1]]
                ];

                var dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1],
                    x = (bounds[0][0] + bounds[1][0]) / 2,
                    y = (bounds[0][1] + bounds[1][1]) / 2;

                var scale = .9 / Math.max(dx / attrs.svgWidth, dy / attrs.svgHeight),
                    translate = [attrs.svgWidth / 2 - scale * x, attrs.svgHeight / 2 - scale * y];

                chart.transition()
                    .duration(3000)
                    .style("stroke-width", 1.5 / scale + "px")
                    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

                makeCirclesBigger();
                displayGeorgiaNeighborBorders();
            }

            function georgiaBorderCountry(d) {
                if ((d.properties.name == 'Georgia' && d.properties.sovereignt == 'Georgia')
                    || d.properties.name == 'Russia' || d.properties.name == 'Turkey' || d.properties.name == 'Azerbaijan'
                    || d.properties.name == 'Armenia') return true;

                return false;
            }

            function makeCirclesBigger() {
                radiusScale.range([0.1, 0.8]);

                //change circles radius
                populationCircles
                    .transition()
                    .duration(3000)
                    .attr("r", function (d) {
                        return radiusScale(+d.population) + 'px';
                    });
            }

            function displayGeorgiaNeighborBorders() {
                d3.selectAll('.map-path')
                    .transition()
                    .duration(3000)
                    .attr('stroke', attrs.svgBackground);
            }

            /* #############################   HANDLER FUNCTIONS    ############################## */
            handlers.zoomed = function () {
                var transform = d3.event.transform;
                chart.attr('transform', transform);
            }

            function handleWindowResize() {
                d3.select(window).on('resize.' + attrs.id, function () {
                    setDimensions();
                });
            }

            function setDimensions() {
                setSvgWidthAndHeight();
                container.call(main);
            }

            function setSvgWidthAndHeight() {
                var containerRect = container.node().getBoundingClientRect();
                if (containerRect.width > 0)
                    attrs.svgWidth = containerRect.width;
                if (containerRect.height > 0)
                    attrs.svgHeight = containerRect.height;
            }

            // Smoothly handle data updating
            updateData = function () {

            }

            //#########################################  UTIL FUNCS ##################################
            function debug() {
                if (attrs.isDebug) {
                    //stringify func
                    var stringified = scope + "";

                    // parse variable names
                    var groupVariables = stringified
                        //match var x-xx= {};
                        .match(/var\s+([\w])+\s*=\s*{\s*}/gi)
                        //match xxx
                        .map(d => d.match(/\s+\w*/gi).filter(s => s.trim()))
                        //get xxx
                        .map(v => v[0].trim())

                    //assign local variables to the scope
                    groupVariables.forEach(v => {
                        main['P_' + v] = eval(v)
                    })
                }
            }
            debug();
        });
    }


    //----------- PROTOTYEPE FUNCTIONS  ----------------------
    d3.selection.prototype.patternify = function (params) {
        var container = this;
        var selector = params.selector;
        var elementTag = params.tag;
        var data = params.data || [selector];

        // Pattern in action
        var selection = container.selectAll('.' + selector).data(data, (d, i) => {
            if (typeof d === "object") {
                if (d.id) {
                    return d.id;
                }
            }
            return i;
        })
        selection.exit().remove();
        selection = selection.enter().append(elementTag).merge(selection)
        selection.attr('class', selector);
        return selection;
    }

    //dinamic keys functions
    Object.keys(attrs).forEach(key => {
        // Attach variables to main function
        return main[key] = function (_) {
            var string = `attrs['${key}'] = _`;
            if (!arguments.length) { return eval(` attrs['${key}'];`); }
            eval(string);
            return main;
        };
    });

    //set attrs as property
    main.attrs = attrs;

    //debugging visuals
    main.debug = function (isDebug) {
        attrs.isDebug = isDebug;
        if (isDebug) {
            if (!window.charts) window.charts = [];
            window.charts.push(main);
        }
        return main;
    }

    //exposed update functions
    main.data = function (value) {
        if (!arguments.length) return attrs.data;
        attrs.data = value;
        if (typeof updateData === 'function') {
            updateData();
        }
        return main;
    }

    // run  visual
    main.run = function () {
        d3.selectAll(attrs.container).call(main);
        return main;
    }

    return main;
}