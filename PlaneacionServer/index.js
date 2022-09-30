const webSocketsServerPort = 8000;
const webSocketServer = require('websocket').server;
const { query } = require('express');
const http = require('http');
const { MongoClient } = require('mongodb');


const url = `mongodb+srv://bouquetplanning:YbkXB0NyuhWybFhK@mongodbtest.wrrye7l.mongodb.net/?retryWrites=true&w=majority`;


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

            console.log(`El resultado seria ${result}`)
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

            console.log(`Resultado de update ${result}`)

        }


        wsServer.on('request', async function (request) {
            var userID = getUniqueID();

            var data = await fetchData(client, "sameday")

            console.log((new Date()) + 'Received a new connection from origin ' + request.origin + '.');

            const connection = request.accept(null, request.origin);

            clients[userID] = connection;
            console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));

            connection.on('message', async function (message) {
                console.log(data)
                if (message.type === 'utf8') {

                    const input = JSON.parse(message.utf8Data);

                    if (input["type"] == 'update') {
                        let row = input["row"]
                        data[row] = input["data"]
                    } else if (input["type"] == 'add') {
                        data.push(input["data"])
                    } else if (input["type"] == 'delete') {
                        let row = input["row"]
                        data = input["data"]
                        data.splice(data, row)
                        for (let i = 0; i < data.length; i++) {
                            data[i].id = i + 1
                        }
                    }
                    for (key in clients) {




                        if (input["type"] == 'update') {
                            let row = input["row"]
                            const retorno = {
                                
                                "type": "update",
                                "data": data[row],
                                "row": row
                            }

                            //console.log(data[row])
                            clients[key].send(JSON.stringify(retorno));


                        } else if (input["type"] == 'conn') {
                            //console.log("En Conn")
                            //console.log(data)
                            const retorno = {
                                "type": "conn",
                                "data": data
                            }
                            clients[key].send(JSON.stringify(retorno));
                        } else if (input["type"] == 'add') {
                            
                            const retorno = {
                                "type": "add",
                                "data": input["data"],
                                "row": input["row"]
                            }
                            //await updateData(client, "sameday", data)
                            clients[key].send(JSON.stringify(retorno));
                        } else if (input["type"] == 'delete') {

                            const retorno = {
                                "type": "delete",
                                "data": data
                            }


                            //await updateData(client, "sameday", data)
                            clients[key].send(JSON.stringify(retorno));
                            
                        }
                        //console.log("Al final")


                    }
                    await updateData(client, "sameday", data)


                }
            })
        });


    } catch (e) {
        console.error(e);
    }



}

main().catch(console.error);





