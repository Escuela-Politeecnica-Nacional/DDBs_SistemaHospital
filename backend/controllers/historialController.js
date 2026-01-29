const { getConnection, sql } = require('../config/db');
const queries = require('../queries/queries_v2');
const historialesControllerCentro = require('./historialesControllerCentro');
const historialesControllerNorte = require('./historialesControllerNorte');
const historialesControllerSur = require('./historialesControllerSur');

function sedeToCentroId(sede) {
  if (!sede) return 1;
  const s = sede.toLowerCase();
  if (s === 'centro') return 1;
  if (s === 'sur') return 2;
  return 0;
}

module.exports = {
  async getHistorial(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return historialesControllerCentro.getHistorial(req, res);
    } else if (sede === 'norte') {
      return historialesControllerNorte.getHistorial(req, res);
    } else if (sede === 'sur') {
      return historialesControllerSur.getHistorial(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async addHistorial(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return historialesControllerCentro.addHistorial(req, res);
    } else if (sede === 'norte') {
      return historialesControllerNorte.addHistorial(req, res);
    } else if (sede === 'sur') {
      return historialesControllerSur.addHistorial(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async editHistorial(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return historialesControllerCentro.editHistorial(req, res);
    } else if (sede === 'norte') {
      return historialesControllerNorte.editHistorial(req, res);
    } else if (sede === 'sur') {
      return historialesControllerSur.editHistorial(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async deleteHistorial(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return historialesControllerCentro.deleteHistorial(req, res);
    } else if (sede === 'norte') {
      return historialesControllerNorte.deleteHistorial(req, res);
    } else if (sede === 'sur') {
      return historialesControllerSur.deleteHistorial(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },
};
