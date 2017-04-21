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
		getProvinceCodeFromSGC: function(sgcId) {
			return codes[sgcId];
		},
		getProvinceSGCFromCode: function(province) {
			var keys = Object.keys(codes),
				key;
			for(var p = 0; p < keys.length; p++) {
				key = keys[p];
				if (province === codes[key])
					return key;
			}
		},
		getSGCProvince: function(sgcId) {
			var keys = Object.keys(codes),
				value = (typeof sgcId !== "string") ? sgcId.toString() : sgcId,
				firstNumber, p1, p2;

			keys.splice(keys.indexOf("01"));

			//Special cases
			switch (sgcId) {
			case "990":
				return "60";
			case "995":
				return "61";
			}

			if (value.length === 7) {
				for(p1 = 0; p1 < keys.length; p1++) {
					if (value.substr(0,2) === keys[p1])
						return keys[p1];
				}
			} else if (value.length === 3) {
				firstNumber = value.substr(0,1);

				for(p2 = 0; p2 < keys.length; p2++) {
					if (firstNumber === keys[p2].substr(1,1))
						return keys[p2];
				}
			} else if (value.length === 2) {
				if (keys.indexOf(value) !== -1) {
					return value;
				}
			}
		}
	};
})();
