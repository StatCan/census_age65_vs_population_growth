(function() {
var scatterDefault = {
    margin: {
      top: 10,
      right: 10,
      bottom: 30,
      left: 50
    },
    aspectRatio: 16 / 9,
    x: {
      ticks: 5
    },
    y: {
      ticks: 10
    },
    pointRadius: 5
  },
  outerWidth = 600;

this.scatterChart = function(svg, settings) {
  var mergedSettings = $.extend({}, scatterDefault, settings),
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    x = d3.scaleLinear().range([0, innerWidth]),
    y = d3.scaleLinear().range([innerHeight, 0]),
    xAxis = d3.axisBottom(x).ticks(mergedSettings.x.ticks),
    yAxis = d3.axisLeft(y).ticks(mergedSettings.y.ticks),
    chartInner = chart.select("g"),
    transition = d3.transition()
      .duration(1000),
    filterOutliars = function(data) {
      var numericalSort = function (a, b) {
          return a - b;
        },
        x, y, x5, y5, xMin, xMax, yMin, yMax;

      x = data.map(function(d) {
        return mergedSettings.x.getValue(d);
      }).sort(numericalSort);

      y = data.map(function(d) {
        return mergedSettings.y.getValue(d);
      }).sort(numericalSort);

      x5 = Math.floor(x.length * .05);
      y5 = Math.floor(y.length * .05);

      xMin = x[x5];
      xMax = x[x.length - x5];

      yMin = y[y5];
      yMax = y[y.length - y5];

      return data.filter(function(d) {
        var xD = mergedSettings.x.getValue(d),
          yD = mergedSettings.y.getValue(d);

        if (xD >= xMin && xD <= xMax && yD >= yMin && yD <= yMax) {
          return true;
        }

        return false;
      });
    },
    draw = function() {
      var sett = this.settings,
        data = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData(sett.data) : sett.data,
        xAxisObj = chartInner.select(".x.axis"),
        yAxisObj = chartInner.select(".y.axis"),
        dataLayer = svg.select("#data"),
        domainData;

      domainData = settings.filterOutliar === true ? filterOutliars(data) : data;

      x.domain(d3.extent(domainData, sett.x.getValue));

      y.domain([
        0,
        d3.max(domainData, settings.y.getValue) * (1 + mergedSettings.pointRadius / innerHeight)
      ]);

      chartInner
        .attr("transform", "translate(" + sett.margin.left + "," + sett.margin.top + ")");

      if (dataLayer.empty()) {
        dataLayer = svg
          .append("symbol")
            .attr("id", "data")
            .attr("preserveAspectRatio", "xMinYMax slice");

        chartInner.append("use")
          .attr("x", 0)
          .attr("y", 0)
          .attr("height", innerHeight)
          .attr("width", innerWidth)
          .attr("href", "#data");
      }

      scatter = dataLayer.selectAll(".point")
        .data(data)

      scatter
        .enter()
        .append("circle")
          .attr("r", mergedSettings.pointRadius)
          .attr("class", function(d,i){return "point point" + (i + 1);})
          .attr("cx", function(d) {return x(settings.x.getValue(d))})
          .attr("cy", function(d) {return y(settings.y.getValue(d))});

      scatter
        .transition(transition)
        .attr("cx", function(d) {return x(settings.x.getValue(d))})
        .attr("cy", function(d) {return y(settings.y.getValue(d))});

      if (xAxisObj.empty()) {
        xAxisObj = chartInner.append('g')
        .attr('class', 'x axis')
        .attr("transform", "translate(0," + innerHeight + ")")
      }
      xAxisObj.call(xAxis);

      if (yAxisObj.empty()) {
        yAxisObj = chartInner.append('g')
          .attr('class', 'y axis')
      }
      yAxisObj.call(yAxis);
    },
    rtnObj;

	rtnObj = {
		settings: mergedSettings,
		svg: svg
	};

  svg
    .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
    .attr("preserveAspectRatio", "xMidYMid meet");

  if (chartInner.empty()) {
    chartInner = chart.append("g");
  }

  if (!mergedSettings.data) {
    d3.json(mergedSettings.url, function(error, data) {
      mergedSettings.data = data;
      draw.apply(rtnObj);
    });
  } else {
    draw.apply(rtnObj);
  }

  return rtnObj;
};

})();
