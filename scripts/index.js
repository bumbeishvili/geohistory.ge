var world;
d3.csv('/data/districts.csv').then(function (districts) {
    d3.json('/data/world_minified.json')
        .then(json => {
            world = getChart()
                .svgHeight(window.innerHeight)
                .svgWidth(window.innerWidth - 300)
                .geojson(json)
                .districts(districts)
                .container('#myGraph')
                .data('Pass Something Here and use it as attrs.data')
                .run()
        });
});

var drawPoints = DrawPoints()
                .points([
                    {
                        sy: 200,
                        sx: 200,
                        tx: 1000,
                        ty: 180,
                        size: 15
                    }
                ])

var boundingRect = document.getElementById('timeline').getBoundingClientRect();

var timeline = Timeline()
    .svgHeight(150)
    .svgWidth(boundingRect.width - 100)
    .container('#timeline')
    .onTimelineClick(d => {
        setTimeout(drawPoints.run, 3000);
    })
    .onNextTick(d => {
        if (d.time.getFullYear() <= 1943) {
            var points = getPointsAt(d)
            drawPoints.addPoints(points)
        }
    })
    .run();

searchInputClick();
initSidebar();

function initSidebar () {
    document.addEventListener('DOMContentLoaded', function() {
        var elems = document.querySelectorAll('.sidenav');
        var container =  document.querySelector('.container');

        if (isMobile.any()) {
            container.style.width = '100%';
        } else {
            elems.forEach(el => {
                el.classList.add('sidenav-fixed')
            })
            
            container.style.width = 'calc(100vw - 300px)';
            container.style.marginLeft = '300px';
        }
        var instances = M.Sidenav.init(elems, {
            edge: 'left',
            menuWidth: 300,
            closeOnClick: false,
            draggable: true
        });
        // instances[0].open();
    });
}

function searchInputClick() {
    d3.select('#person-search-input')
        .on('keydown', function (d) {
            var inputText = d3.select(this).property('value');

            var str = inputText.split(' ').join('_');

            if (event.code != 'Enter' || inputText == '') return;

            d3.selectAll('.sk-fading-circle ').style('display', 'block');

            d3.json('http://geohistory-node-app.herokuapp.com/' + str).then(d => {

                d3.selectAll('.sk-fading-circle ').style('display', 'none');

                var modal = d3.select('#myModal');

                modal.style('display', 'block')
                var closeButton = d3.select('.close');

                closeButton.on('click', function (d) {
                    modal.style('display', 'none');
                })

                d3.select('#pname').html(d[1][1] + ' ' + d[1][2]);


                var generatedStr = `
                <table>
                    ${d[0].map((r, i) => {
                        return `
                        <tr><td>
                            ${r}
                        </td>
                        <td> ${d[1][i]}
                        </td>
                        </tr>`


                    }).join('')}    
                </table>
                
                `
                d3.select('.modal-body').html(generatedStr)
            })

        });
}

function getPointsAt(v) {
    var coords = getCoords();
    var projection = world.getProjection();
    var pos = euroConfig(v.time);
    var result = coords.map(d => {
        var coord = [d.lat, d.long];
        return {
            sx: projection()(coord)[0] + (Math.random() - 0.5) * 50 + 330,
            sy: projection()(coord)[1] + (Math.random() - 0.5) * 30 + 340,
            tx: projection()(pos)[0] * 5 + (Math.random() - 0.5) * 150 - 2800,
            ty: projection()(pos)[1] * 1.2 + (Math.random() - 0.5) * 200 + 00,
            duration: Math.round(Math.random() * 20),
            size: 2
        }
    })

    return result;

}

function getCoords() {
    return [{ "lat": "44.8015019", "long": "41.6935247" }, { "lat": "42.705359", "long": "42.271584" }, { "lat": "44.1089577", "long": "41.9874329" }, { "lat": "45.4746493", "long": "41.918292" }, { "lat": "43.4839313", "long": "41.4079269" }, { "lat": "43.5989395", "long": "41.9972652" }, { "lat": "45.9220959", "long": "41.6184557" }, { "lat": "41.8779873", "long": "42.5112864" }, { "lat": "41.6360085", "long": "41.6509502" }, { "lat": "43.0350696", "long": "42.1071766" }, { "lat": "42.511975", "long": "42.0851175" }, { "lat": "46.2772162", "long": "41.8263247" }, { "lat": "41.737236", "long": "42.628948" }, { "lat": "43.2866046", "long": "42.2910523" }, { "lat": "43.5586205", "long": "42.0223521" }, { "lat": "43.1519007", "long": "42.5193765" }, { "lat": "42.3462329", "long": "42.1625885" }, { "lat": "42.7700726", "long": "42.6476005" }, { "lat": "42.0364392", "long": "42.0875384" }, { "lat": "41.4721354", "long": "42.7121136" }, { "lat": "43.8935335", "long": "42.0216487" }, { "lat": "44.6959371", "long": "42.0844709" }, { "lat": "44.4206038", "long": "41.9271624" }, { "lat": "43.4059465", "long": "42.3388168" }, { "lat": "43.3833782", "long": "41.8413282" }, { "lat": "42.2033321", "long": "42.2049284" }, { "lat": "45.8151463", "long": "41.9523697" }, { "lat": "40.6247105", "long": "43.102487" }, { "lat": "44.4625567", "long": "41.5427292" }, { "lat": "44.4851837", "long": "42.1218994" }, { "lat": "41.6748028", "long": "42.141614" }, { "lat": "42.9980769", "long": "42.3477177" }, { "lat": "42.2399471", "long": "42.0192103" }, { "lat": "43.4427287", "long": "42.585344" }, { "lat": "41.7793202", "long": "41.8113601" }, { "lat": "41.7334564", "long": "41.7187049" }, { "lat": "42.1321257", "long": "42.5258474" }, { "lat": "43.2504979", "long": "41.5727921" }, { "lat": "42.7061207", "long": "41.6749791" }, { "lat": "44.9678573", "long": "42.1099414" }]

}

function euroConfig(d) {
    var minDate = new Date('1939 sep 1');
    var maxDate = new Date('1946 sep 1');


    var coordinates = [
        [
            23.5546875,
            52.3755991766591
        ],
        [
            23.818359375,
            50.28933925329178
        ],
        [
            25.6640625,
            49.439556958940855
        ],
        [
            25.3125,
            53.4357192066942
        ],
        [
            29.70703125,
            49.49667452747045
        ],
        [
            27.421875,
            53.85252660044951
        ],
        [
            30.234375,
            52.74959372674114
        ],
        [
            32.16796875,
            51.17934297928927
        ],
        [
            31.81640625,
            53.330872983017066
        ],
        [
            33.310546875,
            54.470037612805754
        ],
        [
            35.33203125,
            51.67255514839674
        ],
        [
            35.068359375,
            53.69670647530323
        ],
        [
            33.75,
            55.52863052257191
        ],
        [
            36.38671875,
            55.32914440840507
        ],
        [
            37.70507812499999,
            55.32914440840507
        ],
        [
            36.826171875,
            53.64463782485651
        ],
        [
            36.826171875,
            52.32191088594773
        ],
        [
            34.453125,
            54.316523240258256
        ],
        [
            33.486328125,
            51.01375465718821
        ],
        [
            32.783203125,
            52.74959372674114
        ],
        [
            30.05859375,
            54.77534585936447
        ],
        [
            30.849609375,
            51.28940590271679
        ],
        [
            30.849609375,
            49.49667452747045
        ],
        [
            27.861328125,
            49.32512199104001
        ],
        [
            26.630859375,
            50.736455137010665
        ],
        [
            24.609375,
            51.56341232867588
        ],
        [
            22.32421875,
            52.214338608258196
        ],
        [
            22.763671875,
            50.064191736659104
        ],
        [
            23.90625,
            47.754097979680026
        ],
        [
            25.224609375,
            47.100044694025215
        ],
        [
            23.203125,
            46.558860303117164
        ],
        [
            21.796875,
            48.40003249610685
        ],
        [
            20.126953125,
            50.56928286558243
        ],
        [
            17.841796875,
            52.64306343665892
        ],
        [
            17.841796875,
            49.724479188712984
        ],
        [
            19.335937499999996,
            48.40003249610685
        ],
        [
            19.16015625,
            46.37725420510028
        ],
        [
            15.732421875,
            46.37725420510028
        ],
        [
            15.029296875,
            48.80686346108517
        ],
        [
            14.94140625,
            50.84757295365389
        ],
        [
            14.414062499999998,
            52.64306343665892
        ],
        [
            13.271484375,
            51.12421275782688
        ],
        [
            12.041015625,
            50.28933925329178
        ],
        [
            12.65625,
            51.6180165487737
        ],
        [
            13.18359375,
            52.482780222078226
        ],
        [
            10.8984375,
            52.16045455774706
        ]
    ]

    var scale = d3.scaleTime().domain([minDate, maxDate]).range([0, coordinates.length]);
    var n = scale(d);
    n = Math.round(n);
    return coordinates[n];

}
                