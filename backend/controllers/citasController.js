const citasControllerCentro = require('./citasControllerCentro');
const citasControllerNorte = require('./citasControllerNorte');
const citasControllerSur = require('./citasControllerSur');

module.exports = {
  async getCitas(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return citasControllerCentro.getCitas(req, res);
    } else if (sede === 'norte') {
      return citasControllerNorte.getCitas(req, res);
    } else if (sede === 'sur') {
      return citasControllerSur.getCitas(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async addCita(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return citasControllerCentro.addCita(req, res);
    } else if (sede === 'norte') {
      return citasControllerNorte.addCita(req, res);
    } else if (sede === 'sur') {
      return citasControllerSur.addCita(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async editCita(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return citasControllerCentro.editCita(req, res);
    } else if (sede === 'norte') {
      return citasControllerNorte.editCita(req, res);
    } else if (sede === 'sur') {
      return citasControllerSur.editCita(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async deleteCita(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return citasControllerCentro.deleteCita(req, res);
    } else if (sede === 'norte') {
      return citasControllerNorte.deleteCita(req, res);
    } else if (sede === 'sur') {
      return citasControllerSur.deleteCita(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },
};
