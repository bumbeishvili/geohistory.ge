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
        pinColor: '#39787E',
        animationTime: 20, // in seconds
        animaionDelay: 3, // in seconds
        districts: null,
        data: null
    };

    //InnerFunctions
    var updateData, animate, animationStarted = false, formatDate = d3.timeFormat("%Y %b %d");;

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
                start: [[[5, (calc.chartHeight - 20)], [25, (calc.chartHeight - 10)], 
                        [5, calc.chartHeight], [5, (calc.chartHeight - 20)]]],
                stop: [[ 
                        [5, (calc.chartHeight - 15)], [25, (calc.chartHeight - 15)], 
                        [25, calc.chartHeight], [5, (calc.chartHeight)]
                    ]]
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
            var svg = container.patternify({ tag: 'svg', selector: 'svg-chart-container' })
                .attr('width', attrs.svgWidth)
                .attr('height', attrs.svgHeight)
                .attr('font-family', attrs.defaultFont)

            var chart = svg.patternify({ tag: 'g', selector: 'chart' })
                .attr('transform', 'translate(' + (calc.chartLeftMargin) + ',' + calc.chartTopMargin + ')')
            
            var playButton = svg.patternify({ tag: 'path', selector: 'playButton', data: playButtonData.start })
                 .attr("d", line)
                 .style("fill", "rgb(73, 73, 73)")
                 .on("mouseover", d => {
                     d3.select(this).style("fill", "#fff")
                 })
                 .on("mouseout", d => {
                    d3.select(this).style("fill", "rgb(73, 73, 73)")
                 })
                 .on("click", d => {
                    if (animate) {
                        animate();
                    }
                 });

            chart.patternify({ tag: 'g', selector: 'xAxis'})
                .call(xAxis)
                .attr('transform', 'translate(' + (0) + ',' + (calc.chartHeight - 20) + ')')

            var pin = chart.patternify({ tag: 'g', selector: 'timePin' })
                           .attr('transform', 'translate(-20,' + (calc.chartHeight - 70) + ')')

            var pinText = pin.patternify({ tag: 'text', selector: 'pinText' })
                             .attr("y", -5)
                             .attr("x", -30)
                             .style("fill", attrs.pinColor)
                             .text(formatDate(x.invert(0)))

            pin.patternify({ tag: 'rect', selection: 'pinRect' })
               .attr("width", 40)
               .attr("height", 30)
               .style("rx", 5)
               .style("ry", 5)
               .style("fill", attrs.pinColor);

            pin.patternify({ tag: 'path', selector: 'pinPath', data: [[ [0, 30], [20, 45], [40, 30], [0, 30]]] })
               .attr("d", line)
               .style("fill", attrs.pinColor);

            var timer, translateX;
            animate = function() {
                
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
                else{
                    setTimeout(function(){
                        timer = d3.timer(function(ellapsedTime){
                            translateX = (calc.chartWidth - 20) * (ellapsedTime / (attrs.animationTime * 1000));
                            pin.attr("transform", "translate("+ (translateX) +","+ (calc.chartHeight - 70)+")");
                            pinText.text(formatDate(x.invert(translateX)))
                            if (translateX >= calc.chartWidth - 20){
                                timer.stop();
                            }
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

    //animate
    main.animate = function(){
        if (typeof animate === "function") {
            animate();
        }
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