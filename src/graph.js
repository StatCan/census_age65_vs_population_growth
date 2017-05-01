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
  showLabels: false,
  pointRadius: 5,
  width: 600,
};

this.scatterChart = function(svg, settings) {
  var mergedSettings = $.extend({}, scatterDefault, settings),
    outerWidth = mergedSettings.width,
    outerHeight = Math.ceil(outerWidth / mergedSettings.aspectRatio),
    innerHeight = mergedSettings.innerHeight = outerHeight - mergedSettings.margin.top - mergedSettings.margin.bottom,
    innerWidth = mergedSettings.innerWidth = outerWidth - mergedSettings.margin.left - mergedSettings.margin.right,
    x = d3.scaleLinear().range([0, innerWidth]),
    y = d3.scaleLinear().range([innerHeight, 0]),
    xAxis = d3.axisBottom(x).ticks(mergedSettings.x.ticks),
    yAxis = d3.axisLeft(y).ticks(mergedSettings.y.ticks),
    chartInner = svg.select("g"),
    transition = d3.transition()
      .duration(1000)
      .ease(d3.easeLinear),
    getOutliarBounds = function(data) {
      var numericalSort = function (a, b) {
          return a - b;
        },
        xArray, yArray, p5;

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
          sett.filterData(sett.data, "chart") : sett.data,
        xAxisObj = chartInner.select(".x.axis"),
        yAxisObj = chartInner.select(".y.axis"),
        dataLayer = svg.select("#data"),
        padding = 1 + sett.pointRadius / innerHeight,
        displayOnly = sett.displayOnly && typeof sett.displayOnly === "function" ?
          sett.displayOnly(data) : null,
        classFn = function(d,i){
          var cl = "point point" + (i + 1);

          if (sett.z && sett.z.getClass && typeof sett.z.getClass === "function") {
            cl += " " + sett.z.getClass(d);
          }

          if (!displayOnly || displayOnly.indexOf(d) !== -1) {
            cl += " visible";
          }

          return cl;
        },
        labelClassFn = function(d, i) {
          var cl = "label label" + (i + 1);

          if (!displayOnly || displayOnly.indexOf(d) !== -1) {
            cl += " visible";
          }

          return cl;
        },
        idFn = function(d) {
          if (sett.z && sett.z.getId && typeof sett.z.getId === "function") {
            return sett.z.getId(d);
          }
        },
        xFn = function(d) {return x(sett.x.getValue(d));},
        yFn = function(d) {return y(sett.y.getValue(d));},
        xLabelFn = function(d, i, selection) {
          var bbox = selection[i].getBBox(),
            lblX = xFn(d) + sett.pointRadius;

          if (lblX + bbox.width > innerWidth) {
            lblX -= bbox.width + sett.pointRadius * 2;
          }

          return lblX;
        },
        yLabelFn = function(d) {
          var lblY = yFn(d) - sett.pointRadius;

          if (lblY < 0) {
            lblY =+ sett.pointRadius * 2;
          }

          return lblY;
        },
        xDomain, yDomain, bounds, scatter, scatterLabels;

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
        .data(data);

      scatter
        .enter()
        .append("circle")
          .attr("r", sett.pointRadius)
          .attr("id", idFn)
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


      scatterLabels = dataLayer.selectAll(".label");
      if (sett.showLabels) {
        scatterLabels
          .data(data)
          .enter()
          .append("text")
            .text(sett.z.getText)
            .attr("aria-hidden", "true")
            .attr("class", labelClassFn)
            .attr("fill", "#000")
            .attr("x", xLabelFn)
            .attr("y", yLabelFn);

        scatterLabels
          .transition(transition)
          .text(sett.z.getText)
          .attr("class", labelClassFn)
          .attr("x", xLabelFn)
          .attr("y", yLabelFn);

        scatterLabels
          .exit()
            .remove();
      } else {
        scatterLabels
          .remove();
      }

      if (xAxisObj.empty()) {
        xAxisObj = chartInner.append("g")
        .attr("class", "x axis")
        .attr("aria-hidden", "true")
        .attr("transform", "translate(0," + innerHeight + ")");
      }
      xAxisObj.call(xAxis)
        .append("text")
          .attr("class", "chart-label")
          .attr("fill", "#000")
          .attr("x", innerWidth)
          .attr("dy", "-0.5em")
          .attr("text-anchor", "end")
          .text(settings.x.label);

      if (yAxisObj.empty()) {
        yAxisObj = chartInner.append("g")
          .attr("class", "y axis")
          .attr("aria-hidden", "true");
      }
      yAxisObj.call(yAxis)
        .append("text")
          .attr("class", "chart-label")
          .attr("fill", "#000")
          .attr("y", "0")
          .attr("transform", "rotate(-90)")
          .attr("dy", "1.5em")
          .attr("text-anchor", "end")
          .text(settings.y.label);
    },
    drawTable = function() {
      var sett = this.settings,
        data = (sett.filterData && typeof sett.filterData === "function") ?
          sett.filterData(sett.data, "table") : sett.data,
        parent = svg.select(function(){return this.parentNode;}),
        details = parent
          .select("details"),
        table, header, body, dataRows, dataRow;

      if (details.empty()) {
        details = parent
          .append("details")
            .attr("class", "chart-data-table");

        details.append("summary")
          .attr("id", "chrt-dt-tbl")
          .text(settings.datatableTitle);

        table = details
          .append("table")
            .attr("class", "table");
        header = table.append("thead").append("tr");
        body = table.append("tbody");

        header.append("th")
          .text(settings.z.label);
        header.append("th")
          .text(settings.x.label);
        header.append("th")
          .text(settings.y.label);

        dataRows = body.selectAll("tr")
          .data(data);

        dataRow = dataRows
          .enter()
            .append("tr");

        dataRow
          .append("th")
            .text(settings.z.getText);

        dataRow
          .append("td")
            .text(settings.x.getText || settings.x.getValue);

        dataRow
          .append("td")
            .text(settings.y.getText || settings.y.getValue);

        if ($) {
          $(".chart-data-table summary").trigger("wb-init.wb-details");
        }
      }
    },
    rtnObj;

  rtnObj = {
    settings: mergedSettings,
    svg: svg
  };

  svg
    .attr("viewBox", "0 0 " + outerWidth + " " + outerHeight)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("role", "img")
    .attr("aria-label", mergedSettings.altText);

  if (chartInner.empty()) {
    chartInner = svg.append("g")
      .attr("transform", "translate(" + mergedSettings.margin.left + "," + mergedSettings.margin.top + ")");
  }

  if (!mergedSettings.data) {
    d3.json(mergedSettings.url, function(error, data) {
      mergedSettings.data = data;
      draw.apply(rtnObj);
      drawTable.apply(rtnObj);
    });
  } else {
    draw.apply(rtnObj);
    drawTable.apply(rtnObj);
  }

  return rtnObj;
};

})();
