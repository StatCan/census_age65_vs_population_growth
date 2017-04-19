var lang = document.documentElement.lang,
	sgcI18nRoot = "lib/statcan_sgc/i18n/",
	rootI18nRoot = "src/i18n/",
	idPrefix = "sgc_",
	chart = d3.select(".scatter .data")
		.append("svg")
			.attr("id", "age65_dist_growth"),
		provincesSGC = ["01", "10", "11", "12", "13", "24", "35", "46", "47", "48", "59", "60", "61", "62"],
		CA = {
			atl: ["001","005","010","015","105","110","205","210","215","220","225","305","310","320","328","329","330","335"],
			QC: ["403","404","405","406","408","410","411","412","421","428","430","433","437","440","442","444","447","450","452","454","456","462","465","468","480","485"],
			ON: ["501","502","505","512","515","516","521","522","527","528","529","530","531","532","533","535","537","539","541","543","544","546","547","550","553","555","556","557","559","562","566","567","568","569","571","575","580","582","586","590","595","598"],
			pra: ["602","605","607","610","640","705","710","715","720","725","735","745","750","805","806","810","820","821","825","826","828","830","831","832","833","835","840","845","850","860","865"],
			BC: ["905","913","915","918","920","925","930","932","933","934","935","937","938","939","940","943","944","945","950","952","955","965","970","975"],
			terr: ["977","990","995"]
		},
		CAs = CA.atl.concat(CA.QC, CA.ON, CA.pra, CA.BC, CA.terr),
		CMAs = ["001","205","305","310","408","421","433","442","462","505","521","522","529","532","535","537","539","541","543","550","555","559","568","580","595","602","705","725","810","825","835","915","932","933","935"],
		baseFilter = function(data) {
			if (!data.index) {
				data.index = data.distribution.map(function(d) {
					return d.id;
				});
			}
			return data.distribution
		},
		defaultFilter = function(data, mode) {
			var newData = baseFilter(data);

			if (mode === "chart") {
				return newData.slice(0,193);
			}
			return newData;
		},
		settings = {
			filterData: defaultFilter,
			margin: {
				top: 10,
	      right: 10,
	      bottom: 30,
	      left: 27
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
			z: function() {
				var _this = {
					getClass: function(d) {
						if (provincesSGC.indexOf(d.id) !== -1) {
							return "pt";
						} else if (CMAs.indexOf(d.id) !== -1) {
							return "cma";
						} else if (CAs.indexOf(d.id) !== -1) {
							return "ca";
						}
					},
					getId: function(d){
						return idPrefix + d.id;
					},
					getText: function(d) {
						return i18next.t(_this.getId(d), {ns: "sgc"});
					}
				};

				return _this;
			}(),
			width: 900
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
			case "cma":
				list = CMAs
				break;
			default:
				list = CA[document.getElementById("groups").value]
			}

			if (document.getElementById("sgc_select").value) {
				$sgc = $("option[value='" + document.getElementById("sgc_select").value + "']");
				if ($sgc.length !== 0) {
					id = $sgc.attr("data-id");

					idShort = id.substr(idPrefix.length);
					list = list.concat(idShort);

					setTimeout(function() {
						chart.select("#" + id)
							.classed("selected", true);
					}, 500);

					settings.filterData = function(data) {
						var newData = defaultFilter(data),
							point = baseFilter(data)[data.index.indexOf(idShort)];

						if (newData.indexOf(point) === -1) {
							newData.push(point);
						}

						return newData;
					}
				}
			}

			settings.displayOnly = getDisplayPointFn(list);
			scatterChart(chart, settings);

		}, uiTimeout;

i18next.init({
	lng: lang
});

//Load the i18n
(function(roots) {
	var i18nCallback = function(data) {
			var ns = Object.keys(data[lang])[0];
			i18next.addResourceBundle(lang, ns, data[lang][ns]);
		}, promises = [],
		r;
	for(r = 0; r < roots.length; r++) {
		promises.push($.getJSON(roots[r] + lang + ".json", i18nCallback));
	}

	$.when.apply(this, promises).then(function() {
		settings.x.label = i18next.t("x_label", {ns: "age65_popgrowth"});
		settings.y.label = i18next.t("y_label", {ns: "age65_popgrowth"});
		settings.z.label = i18next.t("z_label", {ns: "age65_popgrowth"});
		settings.altText = i18next.t("alt", {ns: "age65_popgrowth"});

		settings.displayOnly = getDisplayPointFn(provincesSGC);

		d3.json('data/65plus_over_pop_growth.json', function(error, data) {
			var $list = $("#sgc_list"),
				filteredData, f, dataPoint, id, label;

			settings.data = data;
			scatterChart(chart, settings);

			filteredData = baseFilter(data);
			for (f = 0; f < filteredData.length; f++) {
				dataPoint = filteredData[f];
				id = settings.z.getId(dataPoint);
				text = settings.z.getText(dataPoint);
				$list.append("<option value=\"" + text + "\" data-id=\"" + id + "\">" + text + "</option>");
			}
		});
	});
})([sgcI18nRoot, rootI18nRoot])

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
			.text(settings.z.getText(circle.__data__));
			break;
	case "mouseleave":
		d3.selectAll(".mouseover").remove();
	}
});
