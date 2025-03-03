const express = require("express");
const server = require("http").createServer();
const app = express(server);

app.get("/", function (req, res) {
  res.sendFile("index.html", { root: __dirname });
});

server.on("request", app);
server.listen(3000, function () {
  console.log("Server started on port 3000");
});

process.on("SIGINT", () => {
  console.log("sigint");
  // close each web socket connection before closing the DB
  wss.clients.forEach(function each(client) {
    client.close();
  });
  server.close(() => {
    shutdownDB();
  });
});

/** Begin Websocket **/
const WebSocketServer = require("ws").Server;

// attach the websocket to the server I created earlier
const wss = new WebSocketServer({ server: server });

wss.on("connection", function connection(ws) {
  const numClients = wss.clients.size;
  console.log("Clients connected", numClients);

  wss.broadcast(`Current visitors: ${numClients}`);

  //when a client connects and their connection's open, send them a msg
  if (ws.readyState === ws.OPEN) {
    ws.send("Welcome to my server");
  }

  db.run(`INSERT INTO visitors (count, time)
        VALUES (${numClients}, datetime('now'))
    `);

  ws.on("close", function close() {
    wss.broadcast(`Current visitors: ${numClients}`);
    console.log("A client has disconnected");
  });
});

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

/* END WEBSOCKETS */

/* BEGIN DATABASE */
const sqlite = require("sqlite3");

// saving this in-memory, which means the DB will be wiped every time it's reset.
const db = new sqlite.Database(":memory:");

// this just sets up the DB before I write any queries to it
db.serialize(() => {
  db.run(`
        CREATE TABLE visitors (
            count INTEGER,
            time TEXT
        )
    `);
});

function getCounts() {
  db.each("SELECT * FROM visitors", (err, row) => {
    console.log(row);
  });
}

function shutdownDB() {
  getCounts();
  console.log("shutting down DB");
  db.close();
}
