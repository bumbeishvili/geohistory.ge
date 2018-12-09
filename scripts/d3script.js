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
        getProjection: d => d,
        isZoomedOut: false,
        geojson: null,
        districts: null,
        data: null
    };

    //InnerFunctions
    var updateData, zoomToEurope;

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

            attrs.getProjection = function (d) {
                return projection;
            }

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
                    population: d.population,
                    city: d.corrCity
                };
            });

            //calculate max population of districts
            var maxPopulation = d3.max(attrs.districts.map(x => +x.population));

            //linear scale for adjusting circle radius
            var radiusScale = d3.scaleLinear().domain([0, maxPopulation]).range([0.15, 1]);

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
                .attr("fill", attrs.populationCirclesColor)
                .on('mouseenter', function (d) {
                    displayTooltip(d);
                })
                .on('mouseleave', function (d) {
                    hideTooltip(d);
                });

            europeButtonClick();



            handleWindowResize();

            //#################################### TOOLTIP ####################################

            //initialize tooltip object
            var tooltip = d3.componentsTooltip()
                .container('.svg-chart-container')
                .content([
                    {
                        left: "city",
                        right: "{city}"
                    },
                    {
                        left: "death",
                        right: "{population}"
                    }
                ])



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

                var transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);

                chart
                    .transition()
                    .duration(3000)
                    .style("stroke-width", 1.5 / scale + "px")
                    .call(behaviors.zoom.transform, transform);
            }

            zoomToEurope = function () {
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
                    translate = [attrs.svgWidth / 2 - scale * x - 30, attrs.svgHeight / 2 - scale * y - 30];
                
                var transform = d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale);
                chart
                    .transition()
                    .duration(3000)
                    .style("stroke-width", 1.5 / scale + "px")
                    .call(behaviors.zoom.transform, transform);

                makeCirclesBigger();
                displayGeorgiaNeighborBorders();
                attrs.isZoomedOut = true;
            }

            function georgiaBorderCountry(d) {
                if ((d.properties.name == 'Georgia' && d.properties.sovereignt == 'Georgia')
                    || d.properties.name == 'Russia' || d.properties.name == 'Turkey' || d.properties.name == 'Azerbaijan'
                    || d.properties.name == 'Armenia') return true;

                return false;
            }

            function makeCirclesBigger() {
                radiusScale.range([0.2, 1.6]);

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

            function displayTooltip(d) {
                var xPosition = d3.event.offsetX - 5;
                var yPosition = d3.event.offsetY - 20;

                tooltip
                    .x(xPosition)
                    .y(yPosition)
                    .tooltipRowHeight(25)
                    .minSpaceBetweenColumns(50)
                    .fontSize(13)
                    .arrowHeight(10)
                    .arrowLength(20)
                    .contentMargin(0)
                    .heightOffset(7)
                    .textColor('#E5E2E0')
                    .tooltipFill('#830303')
                    .leftMargin(10)
                    .rightMargin(3)
                    .direction('bottom')
                    .show({
                        city: d.city,
                        population: d.population
                    });
            }

            function hideTooltip(d) {
                tooltip.hide();
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

            function europeButtonClick() {
                d3.select('#button-container')
                    .on('click', function (d) {
                        zoomToEurope();
                        d3.select(this)
                            .style('display', 'none');
                    });
            }

            function searchInputClick() {
                d3.select('#person-search-input')
                    .on('keydown', function (d) {
                        var inputText = d3.select(this).property('value');

                        if (event.code != 'Enter' || inputText == '') return;

                        var modal = d3.select('#myModal');

                        modal.style('display', 'block')
                        var closeButton = d3.select('.close');

                        closeButton.on('click', function (d) {
                            modal.style('display', 'none');
                        })

                    });
            }


            function commarize(numberValue) {
                // Alter numbers larger than 1k
                if (numberValue >= 1e3) {

                    // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
                    let unit = Math.floor(((numberValue).toFixed(0).length - 1) / 3) * 3
                    // Calculate the remainder
                    var num = (numberValue / ('1e' + 6)).toFixed(1)

                    // output number remainder + unitname
                    return num + ' million' + ' people'
                }
                // return formatted original number
                return numberValue.toLocaleString()
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

    main.zoomToEurope = function () {
        if (typeof zoomToEurope === "function") {
            zoomToEurope();
        }
        return main;
    }

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