const db = require("./models/db.js");

const errorLoadingData    = "Error loading data.";
const errorDeleteRecord   = "Error deleting record.";
const errorUpdateRecord   = "Error updating record.";
const errorInsertRecord   = "Error inserting record.";
const successDeleteRecord = "Record deleted successfully!";
const errorGetNewData     = "Error inserting record.";

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
 * Função para criar um manipulador de rota GET para retornar uma quantidade de registros.
 * @param {string} entity - O nome da entidade para a qual a rota está sendo criada.
 * @returns {Function} - A função do manipulador de rota GET.
 */
const createGetQuantityRouteHandler = (entity) => (req, res) => {
  const quant = req.params.quant;
  const query = `SELECT * FROM ${entity} LIMIT ${quant}`;
  db.query(query, [quant], (err, results) => {
    if (err) {
      handleError(errorLoadingData, res, err);
    } else {
      handleQueryResult(res, entity, results);
    }
  });
};

/**
 * Função para criar um manipulador de rota POST para alterar registros.
 * @param {string} entity - O nome da entidade para a qual a rota está sendo criada.
 * * @param {string} idField - O nome do campo ID usado na consulta.
 * @returns {Function} - A função do manipulador de rota POST.
 */
const createPostRouteHandler = (entity, idField) => (req, res) => {
  const newData = req.body;

  const insertQuery = `INSERT INTO ${entity} SET ?`;
  db.query(insertQuery, newData, (err, insertResults) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "duplicate data" });
      }

      handleError(errorInsertRecord, res, err);
    } else {
      const newId = insertResults.insertId;
      const getNewDataQuery = `SELECT * FROM ${entity} WHERE ${idField} = ?`;
      db.query(getNewDataQuery, [newId], (err, newResults) => {
        if (err) {
          handleError(errorGetNewData, res, err);
        } else {
          if (newResults.length === 0) {
            handleNotFound(res, entity);
          } else {
            res.json(newResults[0]);
          }
        }
      });
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
 * Função para adicionar um produto ao carrinho do usuário.
 * Se existir um carrinho em status "Processing" para o usuário, o produto será adicionado a esse carrinho.
 * Caso contrário, um novo carrinho com status "Processing" será criado.
 * @param {Object} req - Objeto da requisição.
 * @param {Object} res - Objeto de resposta.
 */
const addProductToCart = (req, res) => {
  const userId = req.user.id; // Supondo que você tenha a informação do usuário na requisição

  // Verifica se já existe um carrinho em andamento para o usuário
  const checkCartQuery = 'SELECT * FROM cart WHERE fkIdUser = ? AND status = "Processing"';

  db.query(checkCartQuery, [userId], (err, cartResults) => {
    if (err) {
      handleError(errorCheckCart, res, err);
    } else {
      if (cartResults.length > 0) {
        // Se o carrinho existir, adiciona o produto a ele
        const cartId = cartResults[0].idCart;
        const productId = req.body.productId; // Certifique-se de substituir 'productId' com o nome real do campo

        // Aqui você deve adaptar a lógica para adicionar o produto ao carrinho
        // Pode ser necessário validar a existência do produto, atualizar a quantidade, etc.

        // Exemplo de consulta de adição de produto ao carrinho (adapte conforme necessário)
        const addToCartQuery = 'INSERT INTO detailCart (fkIdCart, fkIdProduct, quantity, unityPrice, subTotal) VALUES (?, ?, ?, ?, ?)';
        const productQuantity = req.body.quantity || 1; // Defina uma quantidade padrão ou obtenha do corpo da requisição
        const unityPrice = req.body.unityPrice || 0.0; // Defina um preço padrão ou obtenha do corpo da requisição
        const subTotal = productQuantity * unityPrice;

        db.query(
          addToCartQuery,
          [cartId, productId, productQuantity, unityPrice, subTotal],
          (err, addToCartResults) => {
            if (err) {
              handleError(errorAddToCart, res, err);
            } else {
              res.json({ success: true, message: 'Produto adicionado ao carrinho com sucesso.' });
            }
          }
        );
      } else {
        // Se o carrinho não existir, cria um novo carrinho e adiciona o produto a ele
        const createCartQuery = 'INSERT INTO cart (creationDate, total, status, fkIdUser) VALUES (NOW(), 0.00, "Processing", ?)';
        
        db.query(createCartQuery, [userId], (err, createCartResults) => {
          if (err) {
            handleError(errorCreateCart, res, err);
          } else {
            const newCartId = createCartResults.insertId;
            const productId = req.body.productId; // Certifique-se de substituir 'productId' com o nome real do campo
            // Aqui você deve adaptar a lógica para adicionar o produto ao carrinho, similar à lógica acima

            res.json({ success: true, message: 'Produto adicionado ao novo carrinho com sucesso.' });
          }
        });
      }
    }
  });
};

// // Método para adicionar produto ao carrinho
// const addProductToCartHandler = (req, res) => {
//   try {
//     addProductToCart(req, res);
//   } catch (error) {
//     handleError(error, res, error.message);
//   }
// };

module.exports = {
  handleError,
  handleNotFound,
  handleQueryResult,
  createGetAllRouteHandler,
  createGetRouteHandler,
  createPostRouteHandler,
  createPutRouteHandler,
  createDeleteRouteHandler,
  createGetQuantityRouteHandler,
  
};