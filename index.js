require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const db = require("./models/db");
const util = require("./util");

const app = express();
const port = process.env.PORT;

app.use(cors());

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
app.get("/getCompanies", util.createGetAllRouteHandler("company"));
app.get("/getAdmins/:id", util.createGetRouteHandler("admin", "idAdmin"));
app.get("/getClients/:id", util.createGetRouteHandler("client", "idClient"));
app.get("/getProducts/:id", util.createGetRouteHandler("product", "id"));
app.get("/getCompanies/:id", util.createGetRouteHandler("company", "idCompany"));
app.get("/getProductsByQuantity/:quant", util.createGetQuantityRouteHandler("product"));

// Methods POST
app.post("/addAdmins", util.createPostRouteHandler("admin", "idAdmin"));
app.post("/addClients", util.createPostRouteHandler("client", "idClient"));
app.post("/addProducts", util.createPostRouteHandler("product", "id"));

// Methods PUT
app.put("/updateAdmins/:id", util.createPutRouteHandler("admin", "idAdmin"));
app.put("/updateClients/:id", util.createPutRouteHandler("client", "idClient"));
app.put("/updateProducts/:id", util.createPutRouteHandler("product", "id"));

// Methods DELETE
app.delete("/deleteAdmins/:id", util.createDeleteRouteHandler("admin", "idAdmin"));
app.delete("/deleteClients/:id", util.createDeleteRouteHandler("client", "idClient"));
app.delete("/deleteProducts/:id", util.createDeleteRouteHandler("product", "id"));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});