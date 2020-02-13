var NodeHelper = require('node_helper');
var unirest = require('unirest');
var hashtable = {};
'use strict';

module.exports = NodeHelper.create({
    getJson: function (url) {
        let self = this;

        unirest.get("https://www.infotuc.es/index.php/es/?option=com_transporte&view=paradatiempos&format=json&id=" + url.stopId)
            .header('Accept', 'application/json')
            .end(result => {
                let data = result.body;

                if (data["estado"] !== "ok") {
                    return;
                }

                let streetName = data['nombre'];
                let rawEstimations = data["estimaciones"];

                let estimations = [];
                rawEstimations.forEach(value => {
                    estimations.push({lineNumber: value['id'], temp: value['tiempo']});
                });

                let response = {
                    streetName: streetName,
                    estimations: estimations
                };

                self.sendSocketNotification("MMM-JsonTable_JSON_RESULT", {
                    url: url.url,
                    data: response
                });
            });
    },

    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, url) {
        if (notification === "MMM-JsonTable_GET_JSON") {
            this.getJson(url);
        }
    }
});
