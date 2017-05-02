var lang = document.documentElement.lang,
  sgcI18nRoot = "lib/statcan_sgc/i18n/",
  rootI18nRoot = "src/i18n/",
  dataUrl = "data/65plus_over_pop_growth.json",
  sgcUrl = "lib/statcan_sgc/sgc.json",
  idPrefix = "sgc_",
  chart = d3.select(".scatter .data")
    .append("svg")
      .attr("id", "age65_dist_growth"),
  provincesSGC = ["01", "10", "11", "12", "13", "24", "35", "46", "47", "48", "59", "60", "61", "62"],
  CA = {
    atl: ["001","005","010","011","015","105","110","205","210","215","220","225","305","310","320","328","329","330","335"],
    QC: ["403","404","405","406","408","410","411","412","421","423","428","430","433","437","440","442","444","447","450","452","454","456","462","465","468","480","485"],
    ON: ["501","502","505","507","509","512","515","516","521","522","527","528","529","530","531","532","533","535","537","539","541","543","544","546","547","550","553","555","556","557","559","562","565","566","567","568","569","571","575","580","582","586","590","595","598"],
    pra: ["602","603","605","607","610","640","705","710","715","720","725","735","745","750","755","805","806","810","820","821","825","826","828","830","831","832","833","835","840","845","850","860","865"],
    BC: ["905","907","913","915","918","920","925","930","932","933","934","935","937","938","939","940","943","944","945","950","952","955","965","970","975","977"],
    terr: ["990","995"]
  },
  CAs = CA.atl.concat(CA.QC, CA.ON, CA.pra, CA.BC, CA.terr),
  CMAs = ["001","205","305","310","408","421","433","442","462","505","521","522","529","532","535","537","539","541","543","550","555","559","568","580","595","602","705","725","810","825","835","915","932","933","935"],
  baseFilter = function(data) {
    return data.distribution;
  },
  defaultFilter = function(data, mode) {
    var newData = baseFilter(data);

    if (mode === "chart") {
      return newData.slice(0,193);
    }
    return newData;
  },
  numberFormatter = (function() {
  try {
    return new Intl.NumberFormat(lang, {minimumFractionDigits: 1 });
  } catch (e) {
    return {
      format: function(d){return d;}
    };
  }
  })(),
  settings = {
    filterData: defaultFilter,
    margin: {
      top: 10,
      right: 10,
      bottom: 30,
      left: 27
    },
    x: function() {
      var _this = {
        getValue: function(d) {
          return d.pop_growth;
        },
        getText: function(d) {
          return numberFormatter.format(_this.getValue(d));
        }
      };

      return _this;
    }(),
    y: function() {
      var _this = {
        getValue: function(d) {
          return d.pc_over_65;
        },
        getText: function(d) {
          return numberFormatter.format(_this.getValue(d));
        }
      };

      return _this;
    }(),
    z: function() {
      var _this = {
        getClass: function(d) {
          var cl = "",
            id = _this.getSGCId(d);
          if (provincesSGC.indexOf(id) !== -1) {
            cl += "pt";
          } else if (CMAs.indexOf(id) !== -1) {
            cl += "cma";
          } else if (CAs.indexOf(id) !== -1) {
            cl += "ca";
          }

          if (selected === d) {
            cl += " selected";
          }

          return cl;
        },
        getId: function(d){
          return idPrefix + d.sgcId;
        },
        getSGCId: function(d) {
          return d.sgcId;
        },
        getText: function(d) {
          var sgcId = _this.getSGCId(d),
            text = i18next.t(_this.getId(d), {ns: "sgc"});
          if (sgcId.length > 2) {
            text  += ", " + i18next.t(d.type, {ns: "sgc_type"}) + ", " + i18next.t(idPrefix + sgc.getSGCProvince(sgcId), {ns: "sgc", context: "abbr"});
          }
          return text;
        }
      };

      return _this;
    }(),
    showLabels: false,
    width: 900
  },
  mergeData = function(data, sgcs) {
    var filteredData = baseFilter(data),
      s, sgc, id, index;

    data.index = filteredData.map(function(d) {
      return settings.z.getSGCId(d);
    });

    for (s = 0; s < sgcs.sgcs.length; s ++) {
      sgc = sgcs.sgcs[s];
      id = settings.z.getSGCId(sgc);

      if (data.index.indexOf(id) !== -1) {
        index = data.index.indexOf(id);
        $.extend(filteredData[index], sgc);
      }
    }
    return data;
  },
  getDisplayPointFn = function(sgcs){
    return function(data) {
      return data.filter(function(d) {
        if (sgcs.indexOf(settings.z.getSGCId(d)) !== -1) {
          return true;
        }

        return false;
      });
    };
  },
  toggleHover = function() {
    var $chart = $(chart.node());

    if (!settings.showLabels) {
      $chart.on(hoverEvents, hoverSelector, hoverHandler);
    } else {
      $chart.off(hoverEvents, hoverSelector);
    }
  },
  uiHandler = function(event) {
    var $sgc, id, idShort, list;

    if (event.target.id === "labels") {
      settings.showLabels = event.target.checked;
      toggleHover();
    } else {
      switch(document.getElementById("groups").value) {
      case "pt":
        list = provincesSGC;
        break;
      case "cma":
        list = CMAs;
        break;
      default:
        list = CA[document.getElementById("groups").value];
      }

      if (document.getElementById("sgc_select").value) {
        $sgc = $("option[value='" + document.getElementById("sgc_select").value.replace("'", "\\'") + "']");
        if ($sgc.length !== 0) {
          id = $sgc.attr("data-id");

          idShort = id.substr(idPrefix.length);
          list = list.concat(idShort);

          settings.filterData = function(data) {
            var newData = defaultFilter(data, "chart"),
              point = baseFilter(data)[data.index.indexOf(idShort)];

            selected = point;

            if (newData.indexOf(point) === -1) {
              newData.push(point);
            }

            return newData;
          };

        }
      }

      settings.displayOnly = getDisplayPointFn(list);
    }

    scatterChart(chart, settings);

  },
  hoverEvents = "mouseenter mouseleave",
  hoverSelector = "circle.visible",
  hoverHandler = function(e) {
    var circle, text, textGroup, bbox, circleX, circleY, x, y;
    switch(e.type) {
    case "mouseenter":
      circle = e.target;

      textGroup = chart.select("#data").append("g")
        .attr("class", "mouseover");

      text = textGroup.append("text");

      text.append("tspan")
        .attr("class", "sgc_name")
        .text(settings.z.getText(circle.__data__));

      text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.5em")
        .text(settings.x.label + ": " + settings.x.getText(circle.__data__));

      text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.5em")
        .text(settings.y.label + ": " + settings.y.getText(circle.__data__));


      // Position hover box
      bbox = textGroup.node().getBBox();
      circleX = circle.cx.baseVal.value;
      circleY = circle.cy.baseVal.value;

      x = circleX + 10;
      y = circleY - 10;

      if (bbox.width + x > scatterObj.settings.innerWidth - scatterObj.settings.margin.left) {
        x -= bbox.width + 20;
      }

      if (bbox.height + y > scatterObj.settings.innerHeight) {
        y = scatterObj.settings.innerHeight + scatterObj.settings.margin.top - bbox.height;
      } else if (y < 0) {
        y = 0;
      }

      textGroup.attr("transform", "translate(" + x + ", " + y + ")");
      break;
    case "mouseleave":
      d3.selectAll(".mouseover").remove();
    }
  },
  uiTimeout, scatterObj, selected;

i18next.init({
  lng: lang
}).on("initialized", function() {
  //Load the i18n
  (function(roots) {
    var i18nCallback = function(data) {
        var namespaces = Object.keys(data[lang]),
          n, ns;
        for (n = 0; n < namespaces.length; n++) {
          ns = namespaces[n];
          i18next.addResourceBundle(lang, ns, data[lang][ns]);
        }
      }, promises = [],
      r;
    for(r = 0; r < roots.length; r++) {
      promises.push($.getJSON(roots[r] + lang + ".json"));
    }

    $.when.apply(this, promises).done(function() {
      var i;

      for(i =0; i < arguments.length; i++) {
        i18nCallback(arguments[i][0]);
      }

      settings.x.label = i18next.t("x_label", {ns: "age65_popgrowth"});
      settings.y.label = i18next.t("y_label", {ns: "age65_popgrowth"});
      settings.z.label = i18next.t("z_label", {ns: "age65_popgrowth"});
      settings.altText = i18next.t("alt", {ns: "age65_popgrowth"});
      settings.datatableTitle = i18next.t("datatableTitle", {ns: "age65_popgrowth"});

      settings.displayOnly = getDisplayPointFn(provincesSGC);

      d3.queue()
        .defer(d3.json, dataUrl)
        .defer(d3.json, sgcUrl)
          .await(function(error, data, sgcs) {
            var $list = $("#sgc_list"),
              filteredData, f, dataPoint, id, text;

            settings.data = mergeData(data, sgcs);
            scatterObj = scatterChart(chart, settings);

            toggleHover();

            filteredData = baseFilter(data);
            for (f = 0; f < filteredData.length; f++) {
              dataPoint = filteredData[f];
              id = settings.z.getId(dataPoint);
              text = settings.z.getText(dataPoint);
              $list.append("<option value=\"" + text + "\" data-id=\"" + id + "\">" + text + "</option>");
            }
          });
    });
  })([sgcI18nRoot, rootI18nRoot]);
});

$(document).on("input change", function(event) {
  if (event.target.type === "text") {
    clearTimeout(uiTimeout);
    uiTimeout = setTimeout(function() {
      uiHandler(event);
    }, 500);
  } else {
    uiHandler(event);
  }
});
