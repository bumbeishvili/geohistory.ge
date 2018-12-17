function Timeline(params) {
    // Exposed variables
    var attrs = {
        id: "ID" + Math.floor(Math.random() * 1000000),  // Id for event handlings
        svgWidth: 700,
        svgHeight: 700,
        marginTop: 5,
        marginBottom: 5,
        marginRight: 15,
        marginLeft: 40,
        container: 'body',
        defaultTextFill: '#2C3E50',
        defaultFont: 'Helvetica',
        svgBackground: 'rgb(73, 73, 73)',
        countriesColor: '#191919',
        pinColor: 'red',
        animationTime: 20, // in seconds
        animaionDelay: 3, // in seconds
        onTimelineClick: d => d,
        onNextTick: d => d,
        districts: null,
        data: null
    };

    //InnerFunctions
    var updateData, animate, animationStarted = false, formatDate = d3.timeFormat("%Y %b");

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

            var playButtonData = {
                start: [
                    [
                        [5, (calc.chartHeight - 25)], 
                        [25, (calc.chartHeight - 15)],
                        [5, calc.chartHeight - 5], 
                        [5, (calc.chartHeight - 25)]
                    ]
                ],
                stop: [
                    [
                        [5, (calc.chartHeight - 20)], 
                        [20, (calc.chartHeight - 20)],
                        [20, calc.chartHeight - 5], 
                        [5, (calc.chartHeight - 5)]
                    ]
                ]
            }

            /*##################################   HANDLERS  ####################################### */
            var handlers = {
                zoomed: null
            }

            /*##################################   BEHAVIORS ####################################### */
            var behaviors = {};
            behaviors.zoom = d3.zoom().on("zoom", d => handlers.zoomed(d));

            /*################################## SCALES ####################################### */
            var x = d3.scaleTime()
                .domain([new Date(1939, 0, 1), new Date(1946, 11, 31)])
                .range([0, calc.chartWidth]);

            var xAxis = d3.axisBottom(x);

            /*################################## SCALES ####################################### */
            var line = d3.line()
                .x(d => d[0])
                .y(d => d[1])

            //################################ DRAWING ######################  
            //Drawing

            container.style('pointer-events', 'none');
            
            var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
                .attr('width', attrs.svgWidth)
                .attr('height', attrs.svgHeight)
                .attr('font-family', attrs.defaultFont)
                .style('pointer-events', 'none')

            var chart = svg.patternify({ tag: 'g', selector: 'chart' })
                .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')')

            var playButton = svg.patternify({ tag: 'path', selector: 'playButton', data: playButtonData.start })
                .attr("d", line)
                .attr('id', 'playBtn')
                .attr("fill", 'gray')
                .style('cursor', 'pointer')
                .style('pointer-events', 'all')
                .on("mouseover", d => {
                    d3.select(this).style("fill", "#fff")
                })
                .on("mouseout", d => {
                    d3.select(this).attr("fill", 'gray')
                })
                .on("click", d => {
                    if (animate) {
                        animate();
                    }
                    attrs.onTimelineClick(d);
                });

            chart.patternify({ tag: 'g', selector: 'xAxis' })
                .call(xAxis)
                .attr('transform', 'translate(' + (0) + ',' + (calc.chartHeight - 20) + ')')

            var pin = chart.patternify({ tag: 'g', selector: 'timePin' })
                .attr('transform', 'translate(-20,' + (calc.chartHeight - 70) + ')')

            var pinText = pin.patternify({ tag: 'text', selector: 'pinText' })
                .attr("y", 15)
                .attr("x", 30)
                .text(formatDate(x.invert(0)))

            pin.patternify({ tag: 'circle', selector: 'pinPath', data: [[[0, 30], [20, 45], [40, 30], [0, 30]]] })
                .attr("transform", "translate(" + 20 + "," + 50 + ")")
                .attr("r", 5)
                .attr("d", line);

            var timer, translateX;
            animate = function () {

                if (animationStarted) {
                    playButton.data(playButtonData.start)
                        .attr("d", line);
                    if (timer) {
                        timer.stop();
                    }
                    pinText.text(formatDate(x.invert(0)));
                    pin.transition()
                        .duration(1500)
                        .attr('transform', 'translate(-20,' + (calc.chartHeight - 70) + ')')
                }
                else {
                    setTimeout(function () {
                        timer = d3.timer(function (ellapsedTime) {
                            translateX = (calc.chartWidth - 20) * (ellapsedTime / (attrs.animationTime * 1000));
                            pin.attr("transform", "translate(" + (translateX) + "," + (calc.chartHeight - 70) + ")");
                            pinText.text(formatDate(x.invert(translateX)))
                            if (translateX >= calc.chartWidth - 20) {
                                timer.stop();
                            }

                            attrs.onNextTick({ time: x.invert(translateX) })
                        });
                    }, world.isZoomedOut() ? 0 : attrs.animaionDelay * 1000);
                    playButton.data(playButtonData.stop)
                        .attr("d", line);
                    world.zoomToEurope();
                }
                animationStarted = !animationStarted;
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
            handleWindowResize();
            // Smoothly handle data updating
            updateData = function () {

            }
        });
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

    //animate
    main.animate = function () {
        if (typeof animate === "function") {
            animate();
        }
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