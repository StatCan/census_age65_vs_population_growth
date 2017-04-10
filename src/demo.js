var lang = document.documentElement.lang,
	idPrefix = "sgc_",
	chart = d3.select(".scatter .data")
		.append("svg")
			.attr("id", "age65_dist_growth"),
		provincesSGC = ["01", "10", "11", "12", "13", "24", "35", "46", "47", "48", "59", "60", "61", "62"],
		CAs = ["005","010","015","105","110","210","215","220","225","320","328","329","330","335","403","404","405","406","410","411","412","428","430","437","440","444","447","450","452","454","456","465","468","480","485","501","502","512","515","516","527","528","530","531","533","544","546","547","553","556","557","562","566","567","569","571","575","582","586","590","598","605","607","610","640","710","715","720","735","745","750","805","806","820","821","826","828","830","831","832","833","840","845","850","860","865","905","913","918","920","925","930","934","937","938","939","940","943","944","945","950","952","955","965","970","975","977","990","995"],
		CMAs = ["001","205","305","310","408","421","433","442","462","505","521","522","529","532","535","537","539","541","543","550","555","559","568","580","595","602","705","725","810","825","835","915","932","933","935"],
		baseFilter = function(data) {
			if (!data.index) {
				data.index = data.distribution.map(function(d) {
					return d.id;
				});
			}
			return data.distribution
		},
		defaultFilter = function(data) {
			return baseFilter(data).slice(0,159);
		},
		settings = {
			filterData: defaultFilter,
			margin: {
				top: 10,
	      right: 10,
	      bottom: 30,
	      left: 22
			},
			x: {
				getValue: function(d) {
					return d.pop_growth;
				}
			},
			y: {
				getValue: function(d) {
					return d.pc_over_65;
				}
			},
			z: {
				getValue: function(d) {
					if (provincesSGC.indexOf(d.id) !== -1) {
						return "pt";
					} else if (CAs.indexOf(d.id) !== -1) {
						return "ca";
					} else if (CMAs.indexOf(d.id) !== -1) {
						return "cma";
					}
				}
			},
			key: {
				get: function(d){
					return idPrefix + d.id;
				}
			},
			width: 1200
		},
		getDisplayPointFn = function(sgcs){
			return function(data) {
				return data.filter(function(d) {
					if (sgcs.indexOf(d.id) !== -1) {
						return true;
					}

					return false;
				});
			};
		},
		uiHandler = function() {
			var $sgc, id, idShort, list;

			switch(document.getElementById("groups").value) {
			case "pt":
				list = provincesSGC
				break;
			case "ca":
				list = CAs
				break;
			case "cma":
				list = CMAs
				break;
			}

			if (document.getElementById("sgc_select").value) {
				$sgc = $("option[value='" + document.getElementById("sgc_select").value + "']");
				if ($sgc.length !== 0) {
					id = $sgc.attr("data-id");

					idShort = id.substr(idPrefix.length);
					list = list.concat(idShort);

					settings.filterData = function(data) {
						var newData = defaultFilter(data);
						newData.push(baseFilter(data)[data.index.indexOf(idShort)]);
						return newData;
					}
				}
			}

			settings.displayOnly = getDisplayPointFn(list);
			scatterChart(chart, settings);

			setTimeout(function() {
				chart.select("#" + id)
					.classed("selected", true);
			}, 500);
		}, uiTimeout;

i18next.init({
	lng: lang
});


//Load the i18n
$.getJSON("lib/statcan_sgc/i18n/" + lang + ".json", function(data) {
	var ns = Object.keys(data[lang])[0];
	i18next.addResourceBundle(lang, ns, data[lang][ns]);
});

settings.displayOnly = getDisplayPointFn(provincesSGC);

d3.json('/data/65plus_over_pop_growth.json', function(error, data) {
	var $list = $("#sgc_list"),
		filteredData, f, id, label;

	settings.data = data;
	scatterChart(chart, settings);

	filteredData = baseFilter(data);
	for (f = 0; f < filteredData.length; f++) {
		id = settings.key.get(filteredData[f]);
		text = i18next.t(id, {ns: "sgc"});
		$list.append("<option value=\"" + text + "\" data-id=\"" + id + "\">" + text + "</option>");
	}
});

$(document).on("change", uiHandler);
$(document).on("input", function() {
	clearTimeout(uiTimeout);
	uiTimeout = setTimeout(function() {
		uiHandler();
	}, 500)
});

$("#age65_dist_growth").on("mouseenter mouseleave", "circle.visible", function(e) {
	var circle;
	switch(e.type) {
	case "mouseenter":
		circle = e.target;
		chart.select("#data").append("text")
			.attr("class", "mouseover")
			.attr("x", circle.cx.baseVal.value + 10)
			.attr("y", circle.cy.baseVal.value - 10)
			.text(i18next.t(circle.id, {ns: "sgc"}));
			break;
	case "mouseleave":
		d3.selectAll(".mouseover").remove();
	}
});
