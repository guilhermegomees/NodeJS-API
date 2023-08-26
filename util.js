const db = require("./models/db.js");

/**
 * Função para lidar com erros.
 * @param {Object} res - O objeto de resposta Express.
 * @param {Error} error - O erro que ocorreu.
 */
const handleError = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "Error loading data from admin table." });
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

module.exports = {
  handleError,
  handleNotFound,
  handleQueryResult,
  createGetAllRouteHandler,
  createGetRouteHandler,
};