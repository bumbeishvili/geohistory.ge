var world;
var width = window.innerWidth - (isMobile.any() ? 0 : 300);
var height = window.innerHeight;
var converter = new EncodingConverter();

d3.csv('/data/districts.csv').then(function(districts) {
	d3.json('/data/world_minified.json').then((json) => {
		world = getChart()
			.svgHeight(height)
			.svgWidth(width)
			.geojson(json)
			.districts(districts)
			.container('#myGraph')
			.data('Pass Something Here and use it as attrs.data')
			.circleClicked((d) => {
				$('.select2').val(d.index).trigger('change');
				search();
			})
			.run();
	});
});

if (!isMobile.any()) {
	var boundingRect = document.getElementById('timeline').getBoundingClientRect();

	var timeline = Timeline()
		.svgHeight(150)
		.svgWidth(boundingRect.width - 100)
		.container('#timeline')
		.run();
}

initSidebar();

function search() {
	document.getElementById('resultCount').style.display = 'none';
	var name = document.getElementById('person-name'),
		surname = document.getElementById('person-surname'),
		cityDistrict = document.getElementById('person-city-district');

	name = name.value; // converter.toLatin(name.value || '').toLowerCase();
	surname = surname.value; // converter.toLatin(surname.value || '').toLowerCase();

	localStorage.setItem('tip-shown', true);

	var search = {
		name: name || '_',
		surname: surname || '_',
		cityDistrict: cityDistrict.value || '_'
	};

	$('.collapsible-wrapper').html('');
	d3.select('.loader').style('display', 'block');
	$.get(
		`https://geohistory-backend.herokuapp.com/search/${search.name}/${search.surname}/${search.cityDistrict}`,
		(data) => {
			document.getElementById('resultCount').style.display = 'block'
			document.getElementById('resultCount').innerHTML = `მოიძებნა ${data.length} პიროვნება`
			const html = `<ul class="collapsible">
		${data
			.sort(function(a, b){
				if(a.lastNameGe < b.lastNameGe) { return -1; }
				if(a.lastNameGe > b.lastNameGe) { return 1; }
				return 0;
			})
				.map(mapLabels)
				.map((d, i) => {
					return `
           <li>
                 <div  style="height: 0px; float: right;" class="collapsible-header"><a onclick='onPersonCLick(${JSON.stringify(
						d
					)})' class="btn-floating  right btn-small waves-effect waves-light  play-button red">▶</a></div>
                 <div class="collapsible-header">${i + 1}. ${d.lastNameGe}  ${d.nameGe} </div>
                 <div class="collapsible-body"><span>
                 <div><b>სახელი</b> - ${d.nameGe}</div>
                 <div><b>გვარი</b> - ${d.lastNameGe}</div>
                 <div><b>დაბად. თარ.</b> - ${d.birthDate}</div>
                 <div><b>გაწვ. ადგ.</b> - ${d.place}</div>
                 <div><b>რანგი</b> - ${d.rank}</div>
                 <div><b>დასაფლ. ადგ.</b> - ${d.burialLocation}</div>
                 <div><b>გარდაც. თარ.</b> - ${d.deathDate}  </div>
                 <div><b>გარდაც. მიზ. </b> - ${d.deathReason}</div>
                 <div>
				 წყარო
				 ${
					i>10?`<br/><a target="_blank" href="https://cdn.obd-memorial.ru/html/fullimage?id=${d.url}">იხ. დოკუმენტი</a>`:
                     `<img class="materialboxed" width="200" src="https://cdn.obd-memorial.ru/html/fullimage?id=${d.url}"></img>`
				 }
                
                 </div>
                  <br/>
                 
          </li>
    `;
				})
				.join('')}
               
						</ul>`;

			d3.select('.loader').style('display', 'none');
			$('.collapsible-wrapper').html(html);

			$(document).ready(function() {
				$('.collapsible').collapsible();
			});
			$(document).ready(function() {
				$('.materialboxed').materialbox();
			});

			d3.selectAll('.play-button').each(function(d) {
				let node = this;
				let tip = node._tippy;
				if (tip) {
					tip.destroy();
				}
				tippy(node, {
					content: 'განვლილი გზის ჩვენება რუკაძე',
					arrow: true,
					theme: 'light',
					animation: 'scale',
					duration: 200
				});
			});
		}
	);
}

function initSidebar() {
	document.addEventListener('DOMContentLoaded', function() {
		var elems = document.querySelectorAll('.sidenav');
		var container = document.querySelector('.container');

		if (isMobile.any()) {
			container.style.width = '100%';
			document.getElementById('download-button').style.display = 'none';
			document.getElementById('about-button').style.display = 'none';
		} else {
			elems.forEach((el) => {
				el.classList.add('sidenav-fixed');
			});

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

function getPointsAt(v) {
	var coords = getCoords();
	var projection = world.getProjection();
	var pos = euroConfig(v.time);
	var result = coords.map((d) => {
		var coord = [ d.lat, d.long ];
		return {
			sx: projection()(coord)[0] + (Math.random() - 0.5) * 50 + 330,
			sy: projection()(coord)[1] + (Math.random() - 0.5) * 30 + 340,
			tx: projection()(pos)[0] * 5 + (Math.random() - 0.5) * 150 - 2800,
			ty: projection()(pos)[1] * 1.2 + (Math.random() - 0.5) * 200 + 00,
			duration: Math.round(Math.random() * 20),
			size: 2
		};
	});

	return result;
}

function getCoords() {
	return [
		{ lat: '44.8015019', long: '41.6935247' },
		{ lat: '42.705359', long: '42.271584' },
		{ lat: '44.1089577', long: '41.9874329' },
		{ lat: '45.4746493', long: '41.918292' },
		{ lat: '43.4839313', long: '41.4079269' },
		{ lat: '43.5989395', long: '41.9972652' },
		{ lat: '45.9220959', long: '41.6184557' },
		{ lat: '41.8779873', long: '42.5112864' },
		{ lat: '41.6360085', long: '41.6509502' },
		{ lat: '43.0350696', long: '42.1071766' },
		{ lat: '42.511975', long: '42.0851175' },
		{ lat: '46.2772162', long: '41.8263247' },
		{ lat: '41.737236', long: '42.628948' },
		{ lat: '43.2866046', long: '42.2910523' },
		{ lat: '43.5586205', long: '42.0223521' },
		{ lat: '43.1519007', long: '42.5193765' },
		{ lat: '42.3462329', long: '42.1625885' },
		{ lat: '42.7700726', long: '42.6476005' },
		{ lat: '42.0364392', long: '42.0875384' },
		{ lat: '41.4721354', long: '42.7121136' },
		{ lat: '43.8935335', long: '42.0216487' },
		{ lat: '44.6959371', long: '42.0844709' },
		{ lat: '44.4206038', long: '41.9271624' },
		{ lat: '43.4059465', long: '42.3388168' },
		{ lat: '43.3833782', long: '41.8413282' },
		{ lat: '42.2033321', long: '42.2049284' },
		{ lat: '45.8151463', long: '41.9523697' },
		{ lat: '40.6247105', long: '43.102487' },
		{ lat: '44.4625567', long: '41.5427292' },
		{ lat: '44.4851837', long: '42.1218994' },
		{ lat: '41.6748028', long: '42.141614' },
		{ lat: '42.9980769', long: '42.3477177' },
		{ lat: '42.2399471', long: '42.0192103' },
		{ lat: '43.4427287', long: '42.585344' },
		{ lat: '41.7793202', long: '41.8113601' },
		{ lat: '41.7334564', long: '41.7187049' },
		{ lat: '42.1321257', long: '42.5258474' },
		{ lat: '43.2504979', long: '41.5727921' },
		{ lat: '42.7061207', long: '41.6749791' },
		{ lat: '44.9678573', long: '42.1099414' }
	];
}

function euroConfig(d) {
	var minDate = new Date('1939 sep 1');
	var maxDate = new Date('1946 sep 1');

	var coordinates = [
		[ 23.5546875, 52.3755991766591 ],
		[ 23.818359375, 50.28933925329178 ],
		[ 25.6640625, 49.439556958940855 ],
		[ 25.3125, 53.4357192066942 ],
		[ 29.70703125, 49.49667452747045 ],
		[ 27.421875, 53.85252660044951 ],
		[ 30.234375, 52.74959372674114 ],
		[ 32.16796875, 51.17934297928927 ],
		[ 31.81640625, 53.330872983017066 ],
		[ 33.310546875, 54.470037612805754 ],
		[ 35.33203125, 51.67255514839674 ],
		[ 35.068359375, 53.69670647530323 ],
		[ 33.75, 55.52863052257191 ],
		[ 36.38671875, 55.32914440840507 ],
		[ 37.70507812499999, 55.32914440840507 ],
		[ 36.826171875, 53.64463782485651 ],
		[ 36.826171875, 52.32191088594773 ],
		[ 34.453125, 54.316523240258256 ],
		[ 33.486328125, 51.01375465718821 ],
		[ 32.783203125, 52.74959372674114 ],
		[ 30.05859375, 54.77534585936447 ],
		[ 30.849609375, 51.28940590271679 ],
		[ 30.849609375, 49.49667452747045 ],
		[ 27.861328125, 49.32512199104001 ],
		[ 26.630859375, 50.736455137010665 ],
		[ 24.609375, 51.56341232867588 ],
		[ 22.32421875, 52.214338608258196 ],
		[ 22.763671875, 50.064191736659104 ],
		[ 23.90625, 47.754097979680026 ],
		[ 25.224609375, 47.100044694025215 ],
		[ 23.203125, 46.558860303117164 ],
		[ 21.796875, 48.40003249610685 ],
		[ 20.126953125, 50.56928286558243 ],
		[ 17.841796875, 52.64306343665892 ],
		[ 17.841796875, 49.724479188712984 ],
		[ 19.335937499999996, 48.40003249610685 ],
		[ 19.16015625, 46.37725420510028 ],
		[ 15.732421875, 46.37725420510028 ],
		[ 15.029296875, 48.80686346108517 ],
		[ 14.94140625, 50.84757295365389 ],
		[ 14.414062499999998, 52.64306343665892 ],
		[ 13.271484375, 51.12421275782688 ],
		[ 12.041015625, 50.28933925329178 ],
		[ 12.65625, 51.6180165487737 ],
		[ 13.18359375, 52.482780222078226 ],
		[ 10.8984375, 52.16045455774706 ]
	];

	var scale = d3.scaleTime().domain([ minDate, maxDate ]).range([ 0, coordinates.length ]);
	var n = scale(d);
	n = Math.round(n);
	return coordinates[n];
}

function getDriveDataObj(driveData) {
	const result = {};
	const keys = Object.keys(driveData);
	keys.forEach((d) => {
		result[d] = {};
		const arr = driveData[d];
		arr.elements.forEach((item) => {
			result[d][item.index] = item;
		});
	});
	return result;
}

function mapLabels(d) {
	const result = Object.assign({}, d);

	if (!isNaN(d.place)) {
		result.placeId = d.place;
	}
	if (!isNaN(d.burialLocation)) {
		result.burialLocationId = d.burialLocation;
	}

	if (!isNaN(d.place)) {
		result.place = driveDataObj.regions[d.place].geo || driveDataObj.regions[d.place].rus;
	}
	if (!isNaN(d.rank)) {
		result.rank = driveDataObj.rank[d.rank].geo || driveDataObj.rank[d.rank].rus;
	}
	if (!isNaN(d.burialLocation)) {
		result.burialLocation =
			driveDataObj.burialLocation[d.burialLocation].geo || driveDataObj.burialLocation[d.burialLocation].rus;
	}
	if (!isNaN(d.deathReason)) {
		result.deathReason = driveDataObj.deathReason[d.deathReason].geo || driveDataObj.deathReason[d.deathReason].rus;
	}

	return result;
}

function onPersonCLick(person) {
	if (!+person.placeId) {
		M.toast({
			html:
				'სამწუხაროდ, გზის საჩვენებლად საკმარისი მონაცემები არ მოიძებნა'
		});
	} else {
		$.get(
			`https://geohistory-backend.herokuapp.com/places/${person.placeId || '_'}/${person.lastPlaceOfService ||
				'_'}`,
			(data) => {
				if (!data.armyData) {
					M.toast({
						html:
							'სამწუხაროდ, მონაცემები არასაკმარისია განვლილი გზის საჩვენებლად, სანაცლოდ ვაჩვენებთ მიმდინარე რეგიონში სხვა ადამიანების მიერ განვლილ გზას'
					});
					const matchedData = data.cityArmyData.map(getMatchedData);
					world.showPath(matchedData);
				} else {
					console.log(data.armyData);
					const matchedData = getMatchedData(data.armyData, person);
					world.showPath([ matchedData ]);
				}
			}
		);
	}
}

function getMatchedData(armyData, person) {
	return armyData.values.map((d, i, arr) => {
		if (i == 0) {
			if (
				person &&
				+person.burialLocation &&
				driveDataObj.burialLocation[person.burialLocation] &&
				driveDataObj.burialLocation[person.burialLocation].lat &&
				driveDataObj.burialLocation[person.burialLocation].lng
			) {
				return [
					{
						lat: +driveDataObj.place[person.placeId].lat,
						lng: +driveDataObj.place[person.placeId].lng
					},
					{
						lat: +driveDataObj.burialLocation[d.burialLocation].lat,
						lng: +driveDataObj.burialLocation[d.burialLocation].lng
					}
				];
			} else {
				return [
					{
						lat: 41.9838,
						lng: 43.5866
					},
					{
						lat: +driveDataObj.burialLocation[d.burialLocation].lat,
						lng: +driveDataObj.burialLocation[d.burialLocation].lng
					}
				];
			}
		} else {
			return [
				{
					name: driveDataObj.burialLocation[arr[i - 1].burialLocation].geo,
					isBurial: arr[i - 1].burialLocation == (person && person.burialLocationId),
					lat: +driveDataObj.burialLocation[arr[i - 1].burialLocation].lat,
					lng: +driveDataObj.burialLocation[arr[i - 1].burialLocation].lng
				},
				{
					lat: +driveDataObj.burialLocation[d.burialLocation].lat,
					lng: +driveDataObj.burialLocation[d.burialLocation].lng
				}
			];
		}
	});
}
