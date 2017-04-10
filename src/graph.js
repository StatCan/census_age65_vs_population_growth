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
    pointRadius: 5,
    width: 600,
  };

this.scatterChart = function(svg, settings) {
  var mergedSettings = $.extend({}, scatterDefault, settings),
    outerWidth = mergedSettings.width,
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
    getOutliarBounds = function(data) {
      var numericalSort = function (a, b) {
          return a - b;
        },
        xArray, yArray, p5, xMin, xMax, yMin, yMax;

      xArray = data.map(function(d) {
        return mergedSettings.x.getValue(d);
      }).sort(numericalSort);

      yArray = data.map(function(d) {
        return mergedSettings.y.getValue(d);
      }).sort(numericalSort);

      p5 = Math.floor(data.length * .05);

      return {
        x: {
          min: xArray[p5],
          max: xArray[xArray.length - p5]
        },
        y: {
          min: yArray[p5],
          max: yArray[yArray.length - p5]
        }
      };
    },
    draw = function() {
      var sett = this.settings,
        data = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData(sett.data) : sett.data,
        xAxisObj = chartInner.select(".x.axis"),
        yAxisObj = chartInner.select(".y.axis"),
        dataLayer = svg.select("#data"),
        padding = 1 + sett.pointRadius / innerHeight,
        displayOnly = sett.displayOnly && typeof sett.displayOnly === "function" ?
          sett.displayOnly(data) : null,
        classFn = function(d,i){
          var cl = "point point" + (i + 1);

          if (sett.z && sett.z.getValue && typeof sett.z.getValue === "function") {
            cl += " " + sett.z.getValue(d)
          }

          if (!displayOnly || displayOnly.indexOf(d) !== -1) {
            cl += " visible"
          }

          return cl;
        },
        xFn = function(d) {return x(sett.x.getValue(d))},
        yFn = function(d) {return y(sett.y.getValue(d))},
        xDomain, yDomain, bounds;

      if (sett.filterOutliars) {
         bounds = getOutliarBounds(data);

         xDomain = [bounds.x.min, bounds.x.max];
         yDomain = [bounds.y.min, bounds.y.max];
      } else if (displayOnly) {
        xDomain = d3.extent(displayOnly, sett.x.getValue);
        yDomain = d3.extent(displayOnly, sett.y.getValue);
      } else {
        xDomain = d3.extent(data, sett.x.getValue);
        yDomain = d3.extent(data, sett.y.getValue);
      }

      xDomain[0] -= padding;
      yDomain[0] -= padding;
      xDomain[1] += padding;
      yDomain[1] += padding;

      x.domain(xDomain);
      y.domain(yDomain);

      if (dataLayer.empty()) {
        dataLayer = chartInner.append("g")
          .attr("id", "data");
      }

      scatter = dataLayer.selectAll(".point")
        .data(data)

      scatter
        .enter()
        .append("circle")
          .attr("r", sett.pointRadius)
          .attr("id", function(d) {if (sett.key && sett.key.get && typeof sett.key.get === "function"){return sett.key.get(d)}})
          .attr("class", classFn)
          .attr("cx", xFn)
          .attr("cy", yFn);

      scatter
        .transition(transition)
        .attr("class", classFn)
        .attr("cx", xFn)
        .attr("cy", yFn);

      scatter
        .exit()
          .remove();

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
    chartInner = chart.append("g")
      .attr("transform", "translate(" + mergedSettings.margin.left + "," + mergedSettings.margin.top + ")");
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
