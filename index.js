const express = require("express");
const cors = require('cors')
const mysql = require("mysql");
const app = express()
const WebSocket = require('ws');
const PORT = 5000;
app.use(cors());
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(404).send('ko');
      console.log('invalid JSON')
    }
  }
}));
var tl = require("./utils/tool")
var db = require('./models/db.js');

const wsServer = new WebSocket.Server({
  port: PORT
});


var reportAPI = [];

global.sp_query = '';
global.sp_user = '';
global.sp_detail = '';

global.timeEmpty = '';
global.type_ = 0;
global.type_check = 0;

const userRouter = require('./routes/user')
const dataRouter = require('./routes/data')
const personRouter = require('./routes/person')
const personERPRouter = require('./routes/personERP')
const shiftRouter = require('./routes/shift');
const bodyParser = require("body-parser");
const FP = require("./routes/FP")
const erp = require("./routes/erp")

app.use("/api/user", userRouter);
app.use("/api/data", dataRouter);
app.use("/api/person", personRouter);
app.use("/api/personERP", personERPRouter);
app.use("/api/shift", shiftRouter);
app.use("/api/FPData", FP);
app.use("/api/erp", erp);


wsServer.on('connection', function (socket) {
  // Some feedback on the console
  console.log("A client just connected");

  // Attach some behavior to the incoming socket
  socket.on('message', function (msg) {
      console.log("Received message from client: "  + msg);
      // socket.send("Take this back: " + msg);

      // Broadcast that message to all connected clients
      wsServer.clients.forEach(function (client) {
          client.send("Someone said: " + msg);
      });

  });

  socket.on('close', function () {
      console.log('Client disconnected');
  })

});

app.listen(99, () => {
  //console.log("server started on port 99...");
});

// app.listen(process.env.PORT, () => {
// });
