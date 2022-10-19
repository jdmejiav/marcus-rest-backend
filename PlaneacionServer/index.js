const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const { query } = require('express');
const http = require('http');
const { MongoClient } = require('mongodb');
require('dotenv').config()


const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@mongodbtest.wrrye7l.mongodb.net/?retryWrites=true&w=majority`;


const server = http.createServer();
server.listen(webSocketsServerPort);
console.log('listening on port 8000');


async function listDatabases(client) {
    databasesList = await client.db().admin().listDatabases();

    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
};


async function createListing(client, data) {
    const result = await client.db("planeacion").collection("planeacion").insertOne({ _id: "sameday", "data": [] })
    const result2 = await client.db("planeacion").collection("planeacion").insertOne({ _id: "nextday", "data": [] })
    console.log(`New listing created with the following id: ${result}`)
}


async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/ecosystem/drivers/node/ for more details
     */


    console.log(process.env.DB_USERNAME)
    const client = new MongoClient(url);

    try {
        // Connect to the MongoDB cluster
        const result = await client.connect();
        console.log(`Connnected ${result}`)




        // Make the appropriate DB calls


        // Uncoment this line to create base collections 
        // await createListing(client);

        // await listDatabases(client);


        const wsServer = new webSocketServer({
            httpServer: server
        });



        const clients = {};


        const getUniqueID = () => {
            const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            return s4() + s4() + '-' + s4();
        }

        const fetchData = async (client, list) => {
            const result = await client.db("planeacion").collection("planeacion").findOne({ _id: list })

            //console.log(`El resultado seria ${result}`)
            return result.data
        }


        const updateData = async (client, list, data) => {
            const result = await client.db("planeacion").collection("planeacion").updateOne(
                {
                    _id: list
                },
                {
                    $set: {
                        _id: list,
                        data: data
                    }
                }
            )



        }


        wsServer.on('request', async function (request) {
            var userID = getUniqueID();

            var data = await fetchData(client, "sameday")
            var dataDict = {
                sameday: await fetchData(client, "sameday"),
                nextday: await fetchData(client, "nextday")
            }
            console.log((new Date()) + 'Received a new connection from origin ' + request.origin + '.');
            const connection = request.accept(null, request.origin);
            clients[userID] = connection;
            console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));
            connection.on('message', async function (message) {
                if (message.type === 'utf8') {
                    const input = JSON.parse(messazge.utf8Data);

                    if (input["day"] === "sameday") {
                        data = dataDict["sameday"]
                    } else {
                        data = dataDict["nextday"]
                    }
                    if (input["type"] === 'update') {
                        let row = input["row"]
                        data[row] = input["data"]
                    } else if (input["type"] === 'add') {
                        data.push(input["data"])
                    } else if (input["type"] == 'delete') {
                        let row = input["row"]
                        data = input["data"]
                        const copy = [...data];
                        const arr_inf = copy.splice(copy, row)

                        for (let i = row + 1; i < data.length; i++) {
                            arr_inf.push(data[i])
                            arr_inf[arr_inf.length - 1].id = arr_inf[arr_inf.length - 1].id = i
                        }



                        data = arr_inf

                    }

                    for (key in clients) {
                        if (clients[key].state === "open") {

                            if (input["type"] == 'update') {
                                let row = input["row"]
                                const retorno = {
                                    "day": input["day"],
                                    "type": "update",
                                    "data": data[row],
                                    "row": row
                                }

                                clients[key].send(JSON.stringify(retorno));


                            } else if (input["type"] == 'conn') {
                                const retorno = {
                                    "day": input["day"],
                                    "type": "conn",
                                    "data": data
                                }
                                clients[key].send(JSON.stringify(retorno));
                            } else if (input["type"] == 'add') {

                                const retorno = {
                                    "day": input["day"],
                                    "type": "add",
                                    "data": input["data"],
                                    "row": input["row"]
                                }
                                //await updateData(client, "sameday", data)
                                clients[key].send(JSON.stringify(retorno))

                            } else if (input["type"] == 'delete') {

                                const retorno = {
                                    "day": input["day"],
                                    "type": "delete",
                                    "data": data
                                }

                                clients[key].send(JSON.stringify(retorno))
                                //await updateData(client, "sameday", data)


                            }
                            //console.log("Al final")


                        } else {
                            delete clients[key]
                        }
                    }
                    await updateData(client, input["day"], data)


                }
            })
        });


    } catch (e) {
        console.error(e);
    }



}

main().catch(console.error);





