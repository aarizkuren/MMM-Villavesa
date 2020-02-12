var NodeHelper = require('node_helper');
var unirest = require('unirest');
var hashtable = {};
'use strict';

class Estimation {
    constructor(lineNumber, time) {
        this._lineNumber = lineNumber;
        this._time = time;
    }

    _lineNumber;

    get lineNumber() {
        return this._lineNumber;
    }

    _time;

    get time() {
        return this._time;
    }
}

module.exports = NodeHelper.create({
    getJson: function (url) {
        let self = this;

        unirest.get("https://www.infotuc.es/index.php/es/?option=com_transporte&view=paradatiempos&format=json&id=" + url.stopId)
            .header('Accept', 'application/json')
            .end(result => {
                console.log("Result", result);
                let data = result.body["data"][0];

                if (!data["estado"] !== "ok") {
                    return;
                }

                let streetName = data['nombre'];
                let rawEstimations = data["estimaciones"];

                let estimations = [];
                rawEstimations.forEach(value => {
                    estimations.push(new Estimation(value['id'], value['tiempo']));
                });

                self.sendSocketNotification("MMM-JsonTable_JSON_RESULT", {
                    url: url.url,
                    data: {
                        streetName: streetName,
                        estimations: estimations
                    }
                });
            });

        let response = {
            "estado": "ok",
            "estimaciones": [{
                "id": "4",
                "tiempo": "2 min",
                "destino": "Bara\u00f1\u00e1in, Avda. el Valle (Iglesia)",
                "distancia": 0
            }, {
                "id": "4",
                "tiempo": "7 min",
                "destino": "Bara\u00f1\u00e1in, Avda. el Valle (Iglesia)",
                "distancia": 0
            }, {"id": "N5", "tiempo": "706 min", "destino": "HUARTE - CORTES DE NAVARRA", "distancia": 0}, {
                "id": "N5",
                "tiempo": "736 min",
                "destino": "GORRAIZ NORTE - HUARTE - CORTES DE NAVARRA",
                "distancia": 0
            }],
            "id": "96",
            "nombre": "Burlada, c\/ Mayor, n\u00ba 37 bis",
            "correspondencias": [{
                "id": "4",
                "name": "BARA\u00d1\u00c1IN - VILLAVA",
                "tipo": "0",
                "color": "#D81E05",
                "id_sae": "200"
            }]
        };
    },

    //Subclass socketNotificationReceived received.
    socketNotificationReceived: function (notification, url) {
        if (notification === "MMM-JsonTable_GET_JSON") {
            this.getJson(url);
        }
    }
});
