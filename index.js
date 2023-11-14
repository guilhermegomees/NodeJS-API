require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");

const db = require("./models/db");
const util = require("./util");

const app = express();
const port = process.env.PORT;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use(cors());

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  }
});

// Methods GET
app.get("/getAdmins",   util.createGetAllRouteHandler("admin"));
app.get("/getUsuarios", util.createGetAllRouteHandler("usuario"));
app.get("/getProducts", util.createGetAllRouteHandler("product"));
app.get("/getCompanies", util.createGetAllRouteHandler("company"));
app.get("/getCarts", util.createGetAllRouteHandler("cart"));
app.get("/getAdmins/:id", util.createGetRouteHandler("admin", "idAdmin"));
app.get("/getUsuarios/:id", util.createGetRouteHandler("usuario", "idUser"));
app.get("/getProducts/:id", util.createGetRouteHandler("product", "id"));
app.get("/getCompanies/:id", util.createGetRouteHandler("company", "idCompany"));
app.get("/getCarts/:id", util.createGetAllRouteHandler("cart", "idCart"));
app.get("/getDetailsCart/:id", util.createGetRouteHandler("detailcart", "fkIdCart"));
app.get("/getCartsByIdUser/:id", util.createGetRouteHandler("cart", "fkIdUser"));
app.get("/getProductsByQuantity/:quant", util.createGetQuantityRouteHandler("product"));
app.get("/getImageProducts/:name", async (req, res) => {
  try {
    const nameImage = req.params.name;
    const imageUrl = `https://supplygear.000webhostapp.com/backand/img/${nameImage}`;

    // Faz a solicitação HTTP para obter a imagem
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // Define os cabeçalhos da resposta para indicar que é uma imagem
    res.set("Content-Type", "image/jpeg");
    res.send(response.data);
  } catch (error) {
    console.error("Erro ao obter imagem:", error.message);
    res.status(500).send("Erro interno do servidor");
  }
});

// Methods POST
app.post("/addAdmins", util.createPostRouteHandler("admin", "idAdmin"));
app.post("/addUsuarios", util.createPostRouteHandler("usuario", "idUser"));
app.post("/addProducts", util.createPostRouteHandler("product", "id"));
// app.post("/addCarts", util.addProductToCartHandler("cart", "idCart"));


// Methods PUT
app.put("/updateAdmins/:id", util.createPutRouteHandler("admin", "idAdmin"));
app.put("/updateUsuarios/:id", util.createPutRouteHandler("usuario", "idUser"));
app.put("/updateProducts/:id", util.createPutRouteHandler("product", "id"));
app.put("/updateCarts/:id", util.createPutRouteHandler("cart", "idCart"));

// Methods DELETE
app.delete("/deleteAdmins/:id", util.createDeleteRouteHandler("admin", "idAdmin"));
app.delete("/deleteUsuarios/:id", util.createDeleteRouteHandler("usuario", "idUser"));
app.delete("/deleteProducts/:id", util.createDeleteRouteHandler("product", "id"));
app.delete("/deleteCarts/:id", util.createDeleteRouteHandler("cart", "idCart"));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});