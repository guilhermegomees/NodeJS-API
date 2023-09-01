require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");

const db = require("./models/db");
const util = require("./util");

const app = express();
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  }
});

// Methods GET
app.get("/getAdmins", util.createGetAllRouteHandler("admin"));
app.get("/getClients", util.createGetAllRouteHandler("client"));
app.get("/getProducts", util.createGetAllRouteHandler("product"));
app.get("/getAdmins/:id", util.createGetRouteHandler("admin", "idAdmin"));
app.get("/getClients/:id", util.createGetRouteHandler("client", "idClient"));
app.get("/getProducts/:id", util.createGetRouteHandler("product", "idProduct"));

// Methods DELETE
app.delete("/deleteAdmins/:id", util.createDeleteRouteHandler("admin", "idAdmin"));
app.delete("/deleteClients/:id", util.createDeleteRouteHandler("client", "idClient"));
app.delete("/deleteProducts/:id", util.createDeleteRouteHandler("product", "idProduct"));

// Methods PUT
app.put("/updateAdmins/:id", util.createPutRouteHandler("admin", "idAdmin"));
app.put("/updateClients/:id", util.createPutRouteHandler("client", "idClient"));
app.put("/updateProducts/:id", util.createPutRouteHandler("product", "idProduct"));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});