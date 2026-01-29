const consultoriosControllerCentro = require('./consultoriosControllerCentro');
const consultoriosControllerNorte = require('./consultoriosControllerNorte');
const consultoriosControllerSur = require('./consultoriosControllerSur');

module.exports = {
  async getConsultorios(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return consultoriosControllerCentro.getConsultorios(req, res);
    } else if (sede === 'norte') {
      return consultoriosControllerNorte.getConsultorios(req, res);
    } else if (sede === 'sur') {
      return consultoriosControllerSur.getConsultorios(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async addConsultorio(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return consultoriosControllerCentro.addConsultorio(req, res);
    } else if (sede === 'norte') {
      return consultoriosControllerNorte.addConsultorio(req, res);
    } else if (sede === 'sur') {
      return consultoriosControllerSur.addConsultorio(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async editConsultorio(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return consultoriosControllerCentro.editConsultorio(req, res);
    } else if (sede === 'norte') {
      return consultoriosControllerNorte.editConsultorio(req, res);
    } else if (sede === 'sur') {
      return consultoriosControllerSur.editConsultorio(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async deleteConsultorio(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return consultoriosControllerCentro.deleteConsultorio(req, res);
    } else if (sede === 'norte') {
      return consultoriosControllerNorte.deleteConsultorio(req, res);
    } else if (sede === 'sur') {
      return consultoriosControllerSur.deleteConsultorio(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },
};
