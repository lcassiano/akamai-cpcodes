var EdgeGrid = require('akamai-edgegrid');
const fs = require('fs');

var eg = new EdgeGrid({
    path: '.edgerc',
    section: 'default'
});

const args = process.argv;
const accountSwitchKey = args[2];
const newDescription = args[3];

const allFileContents = fs.readFileSync('cpcodes.txt', 'utf-8');

allFileContents.split(/\r?\n/).forEach(cpcode => {
    var promise = new Promise(function (resolve, reject) {

        eg.auth({
            path: `/cprg/v1/cpcodes/${cpcode}`,
            method: 'GET',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            qs: {
                "accountSwitchKey": `${accountSwitchKey}`
            }
        });

        eg.send(function (error, response, body) {
            if (error) {
                return reject(error, response);
            }
            else
                return resolve(JSON.stringify(body));
        });
    });

    promise.then((eventsRaw) => {
        var json = JSON.parse(JSON.parse(eventsRaw));
        console.log(`Change description for cpcode : ${json.cpcodeId}`);

        eg.auth({
            path: `/cprg/v1/cpcodes/${json.cpcodeId}`,
            method: 'PUT',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            qs: {
                "accountSwitchKey": `${accountSwitchKey}`
            }
            , body: {
                "cpcodeId": cpcode,
                "cpcodeName": `${newDescription}`,
                "contracts": json.contracts,
                "products": json.products
            }
        });

        eg.send(function(error, response, body) {
            console.log(body);
          });
    });

    promise.catch((error, response) => {
        console.log(error, response);
    });
});