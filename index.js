require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");

const app = express();
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const port = process.env.PORT;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const errorLoadData = "Error loading data from admin table.";

// Database connection
const db = mysql.createConnection({
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
});

// Test database connection
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
  }
});

/**
 * Função para lidar com erros.
 * @param {Object} res - O objeto de resposta Express.
 * @param {Error} error - O erro que ocorreu.
 */
const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: errorLoadData });
};

/**
 * Função para lidar com casos em que a entidade não é encontrada.
 * @param {Object} res - O objeto de resposta Express.
 * @param {string} entity - O nome da entidade que não foi encontrada.
 */
const handleNotFound = (res, entity) => {
  res.status(404).json({ error: `${entity} not found` });
};

/**
 * Função para lidar com os resultados de uma consulta.
 * @param {Object} res - O objeto de resposta Express.
 * @param {string} entity - O nome da entidade associada aos resultados.
 * @param {Array} results - Os resultados da consulta.
 */
const handleQueryResult = (res, entity, results) => {
  if (results.length === 0) {
    handleNotFound(res, entity);
  } else {
    res.json(results[0]);
  }
};

/**
 * Função para criar um manipulador de rota GET para buscar todos os registros de uma entidade.
 * @param {string} entity - O nome da entidade para a qual a rota está sendo criada.
 * @returns {Function} - A função do manipulador de rota GET.
 */
const createGetAllRouteHandler = (entity) => (req, res) => {
  const query = `SELECT * FROM ${entity}`;
  db.query(query, (err, results) => {
    if (err) {
      handleError(res, err);
    } else {
      res.json(results);
    }
  });
};

/**
 * Função para criar um manipulador de rota GET para uma única entidade por ID.
 * @param {string} entity - O nome da entidade para a qual a rota está sendo criada.
 * @param {string} idField - O nome do campo ID usado na consulta.
 * @returns {Function} - A função do manipulador de rota GET.
 */
const createGetRouteHandler = (entity, idField) => (req, res) => {
  const entityId = req.params.id;
  const query = `SELECT * FROM ${entity} WHERE ${idField} = ?`;
  db.query(query, [entityId], (err, results) => {
    if (err) {
      handleError(res, err);
    } else {
      handleQueryResult(res, entity, results);
    }
  });
};

// Methods GET
app.get("/admins", createGetAllRouteHandler("admin"));
app.get("/clients", createGetAllRouteHandler("client"));
app.get("/products", createGetAllRouteHandler("product"));

app.get("/admins/:id", createGetRouteHandler("admin", "idAdmin"));
app.get("/clients/:id", createGetRouteHandler("client", "idClient"));
app.get("/products/:id", createGetRouteHandler("product", "idProduct"));

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
