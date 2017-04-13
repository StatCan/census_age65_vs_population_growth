(function() {
	var codes = {
		"01": "CA",
		"10": "NL",
		"11": "PE",
		"12": "NS",
		"13": "NB",
		"24": "QC",
		"35": "ON",
		"46": "MB",
		"47": "SK",
		"48": "AB",
		"59": "BC",
		"60": "YK",
		"61": "NT",
		"62": "NU"
	};

	this.sgc =  {
		getProvinceFromSGC: function(sgcId) {
			return codes[sgcId];
		},
		getProvinceSGC: function(province) {
			var keys = Object.keys(codes),
				key;
			for(var p = 0; p < keys.length; p++) {
				key = keys[p];
				if (province === codes[key])
					return key;
			}
		},
		getCMAProvince: function(sgcId) {
			var keys = Object.keys(codes),
				value = (typeof sgcId !== "string") ? sgcId.toString() : sgcId;
			for(var p = 0; p < keys.length; p++) {
				if (value.substr(0,2) === keys[p])
					return keys[p];
			}
		}
	};
})();
