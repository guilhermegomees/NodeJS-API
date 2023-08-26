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
app.get("/admins", util.createGetAllRouteHandler("admin"));
app.get("/clients", util.createGetAllRouteHandler("client"));
app.get("/products", util.createGetAllRouteHandler("product"));

app.get("/admins/:id", util.createGetRouteHandler("admin", "idAdmin"));
app.get("/clients/:id", util.createGetRouteHandler("client", "idClient"));
app.get("/products/:id", util.createGetRouteHandler("product", "idProduct"));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
