const doctoresControllerCentro = require('./doctoresControllerCentro');
const doctoresControllerNorte = require('./doctoresControllerNorte');
const doctoresControllerSur = require('./doctoresControllerSur');

module.exports = {
  async getDoctores(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return doctoresControllerCentro.getDoctores(req, res);
    } else if (sede === 'norte') {
      return doctoresControllerNorte.getDoctores(req, res);
    } else if (sede === 'sur') {
      return doctoresControllerSur.getDoctores(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async addDoctor(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return doctoresControllerCentro.addDoctor(req, res);
    } else if (sede === 'norte') {
      return doctoresControllerNorte.addDoctor(req, res);
    } else if (sede === 'sur') {
      return doctoresControllerSur.addDoctor(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async editDoctor(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return doctoresControllerCentro.editDoctor(req, res);
    } else if (sede === 'norte') {
      return doctoresControllerNorte.editDoctor(req, res);
    } else if (sede === 'sur') {
      return doctoresControllerSur.editDoctor(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async deleteDoctor(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return doctoresControllerCentro.deleteDoctor(req, res);
    } else if (sede === 'norte') {
      return doctoresControllerNorte.deleteDoctor(req, res);
    } else if (sede === 'sur') {
      return doctoresControllerSur.deleteDoctor(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },
};
