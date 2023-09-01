const db = require("./models/db.js");

const errorLoadingData = "Error loading data.";
const errorDeleteRecord = "Error deleting record.";
const errorUpdateRecord = "Error updating record.";
const errorInsertRecord = "Error inserting record.";
const successDeleteRecord = "Record deleted successfully!";

/**
 * Função para lidar com erros.
 * @param {Object} msgError - Mensagem que será retornada em caso de erro.
 * @param {Object} res - O objeto de resposta Express.
 * @param {Error} error - O erro que ocorreu.
 */
const handleError = (msgError, res, error) => {
  console.error(error);
  res.status(500).json({ error: msgError });
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
    res.json(results);
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
      handleError(errorLoadingData, res, err);
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
      handleError(errorLoadingData, res, err);
    } else {
      handleQueryResult(res, entity, results);
    }
  });
};

/**
 * Função para criar um manipulador de rota DELETE para deletar registros.
 * @param {string} entity - O nome da entidade para a qual a rota está sendo criada.
 * @param {string} idField - O nome do campo ID usado na consulta.
 * @returns {Function} - A função do manipulador de rota DELETE.
 */
const createDeleteRouteHandler = (entity, idField) => (req, res) => {
  const entityId = req.params.id;
  const query = `DELETE FROM ${entity} WHERE ${idField} = ?`;
  db.query(query, [entityId], (err, results) => {
    if (err) {
      handleError(errorDeleteRecord, res, err);
    } else {
      res.status(200).json({ success: successDeleteRecord });
    }
  });
};

/**
 * Função para criar um manipulador de rota PUT para alterar registros.
 * @param {string} entity - O nome da entidade para a qual a rota está sendo criada.
 * @param {string} idField - O nome do campo ID usado na consulta.
 * @returns {Function} - A função do manipulador de rota PUT.
 */
const createPutRouteHandler = (entity, idField) => (req, res) => {
  const entityId = req.params.id;
  const updatedData = req.body;

  const query = `UPDATE ${entity} SET ? WHERE ${idField} = ?`;
  db.query(query, [updatedData, entityId], (err, results) => {
    if (err) {
      handleError(errorUpdateRecord, res, err);
    } else {
      const getUpdatedDataQuery = `SELECT * FROM ${entity} WHERE ${idField} = ?`;
      db.query(getUpdatedDataQuery, [entityId], (err, updatedResults) => {
        if (err) {
          handleError(errorGetUpdatedData, res, err);
        } else {
          if (updatedResults.length === 0) {
            handleNotFound(res, entity);
          } else {
            res.json(updatedResults[0]);
          }
        }
      });
    }
  });
};


module.exports = {
  handleError,
  handleNotFound,
  handleQueryResult,
  createGetAllRouteHandler,
  createGetRouteHandler,
  createDeleteRouteHandler,
  createPutRouteHandler
};