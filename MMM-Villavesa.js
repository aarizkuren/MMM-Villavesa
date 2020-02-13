'use strict';
Module.register("MMM-Villavesa", {
	jsonData: null,
	header: {},

	// Defaults module config
	defaults: {
		symbol: "bus",
		url: "",
		arrayName: null,
		tryFormatDate: false,
		updateInterval: 30000,
		stopId: 96
	},
	start: function () {
		this.getJson();
		this.scheduleUpdate();
	},

	getStyles: function () {
		return ["MMM-Villavesa.css"];
	},

	scheduleUpdate: function () {
		var self = this;
		setInterval(function () {
			self.getJson();
		}, this.config.updateInterval);
	},

	// Request node_helper to get json from url
	getJson: function () {
		this.sendSocketNotification("MMM-JsonTable_GET_JSON", this.config);
	},

	socketNotificationReceived: function (notification, payload) {
		if (notification === "MMM-JsonTable_JSON_RESULT" && payload.url === this.config.url) {
			this.jsonData = payload.data;
			this.updateDom(500);
		}
	},
	getDom: function () {
		var wrapper = document.createElement("div");
		wrapper.className = "xsmall";

		if (!this.jsonData) {
			wrapper.innerHTML = "Daturik gabe...";
			return wrapper;
		}

		var table = document.createElement("table");
		table.id = "VILLAVESA";
		var tbody = document.createElement("tbody");

		let streetName = this.jsonData['streetName'];
		let thead = document.createElement('thead');
		thead.innerHTML = '<th colspan="2">' + streetName + '</th>';

		var items = [];
		if (this.config.arrayName) {
			items = this.jsonData[this.config.arrayName];
		} else {
			items = this.jsonData;
		}

		// Check if items is of type array
		if (!(items instanceof Array)) {
			wrapper.innerHTML = "Datuak ez dira zuzenak!";
			return wrapper;
		}

		items.forEach(element => {
			var row = this.getTableRow(element);
			tbody.appendChild(row);
		});

		table.appendChild(thead);
		table.appendChild(tbody);
		wrapper.appendChild(table);

		return wrapper;

	},
	getTableRow: function (jsonObject) {
		var row = document.createElement("tr");
		for (var key in jsonObject) {
			var cell = document.createElement("td");

			var valueToDisplay = "";
			if (key === "icon") {
				cell.classList.add("fa", jsonObject[key]);
			} else if (this.config.tryFormatDate) {
				valueToDisplay = this.getFormattedValue(jsonObject[key]);
			} else {
				valueToDisplay = jsonObject[key];
			}

			var cellText = document.createTextNode(valueToDisplay);
			cell.appendChild(cellText);

			if (key === "lineNumber") {
				let iconSpan = document.createElement('span');
				iconSpan.classList.add("fa", "fa-fw", "fa-" + this.config.symbol);
				cell.appendChild(iconSpan);
			}

			row.appendChild(cell);
		}
		return row;
	},
	getFormattedValue: function (input) {
		var m = moment(input);
		if (typeof input !== "string" || !m.isValid()) {
			return input;
		}

		// Show a formatted time if it occures today
		if (m.isSame(new Date(), "day") && m.hours() !== 0 && m.minutes() !== 0 && m.seconds() !== 0) {
			return m.format("HH:mm:ss");
		}

		return m.format("YYYY-MM-DD");
	}
});
