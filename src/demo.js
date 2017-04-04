var chart = d3.select(".scatter .data")
		.append("svg"),
		settings = {
			url: '/data/65plus_over_pop_growth.json',
			filterData: function(data) {
				return data.distribution/*.filter(function(d) {
					if ([
						"01",
						"10",
						"11",
						"12",
						"13",
						"24",
						"35",
						"46",
						"47",
						"48",
						"59",
						"60",
						"61",
						"62",
						"001",
						"205",
						"305",
						"310",
						"408",
						"421",
						"433",
						"442",
						"462",
						"505",
						"505",
						"505",
						"505",
						"505",
						"505",
						"505",
						"505",
						"505",
						"521",
						"529",
						"532",
						"535",
						"537",
						"539",
						"541",
						"543",
						"550",
						"555",
						"559",
						"568",
						"580",
						"595",
						"602",
						"705",
						"725",
						"825",
						"835",
						"915",
						"932",
						"933",
						"935",
						"405"
					].indexOf(d.id) !== -1) {
						return true;
					}

					return false;
				})*/;
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
			}
		};

scatterChart(chart, settings);

setTimeout(function() {
	settings.filterOutliar = true;
	scatterChart(chart, settings);
}, 3000)
