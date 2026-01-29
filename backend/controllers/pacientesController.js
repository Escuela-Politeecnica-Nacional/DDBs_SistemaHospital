const pacientesControllerCentro = require('./pacientesControllerCentro');
const pacientesControllerNorte = require('./pacientesControllerNorte');
const pacientesControllerSur = require('./pacientesControllerSur');

module.exports = {
  async getPacientes(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return pacientesControllerCentro.getPacientes(req, res);
    } else if (sede === 'norte') {
      return pacientesControllerNorte.getPacientes(req, res);
    } else if (sede === 'sur') {
      return pacientesControllerSur.getPacientes(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async addPaciente(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return pacientesControllerCentro.addPaciente(req, res);
    } else if (sede === 'norte') {
      return pacientesControllerNorte.addPaciente(req, res);
    } else if (sede === 'sur') {
      return pacientesControllerSur.addPaciente(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async editPaciente(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return pacientesControllerCentro.editPaciente(req, res);
    } else if (sede === 'norte') {
      return pacientesControllerNorte.editPaciente(req, res);
    } else if (sede === 'sur') {
      return pacientesControllerSur.editPaciente(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async getPacienteById(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return pacientesControllerCentro.getPacienteById(req, res);
    } else if (sede === 'norte') {
      return pacientesControllerNorte.getPacienteById(req, res);
    } else if (sede === 'sur') {
      return pacientesControllerSur.getPacienteById(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },

  async deletePaciente(req, res) {
    const sede = req.query.sede || 'centro';
    if (sede === 'centro') {
      return pacientesControllerCentro.deletePaciente(req, res);
    } else if (sede === 'norte') {
      return pacientesControllerNorte.deletePaciente(req, res);
    } else if (sede === 'sur') {
      return pacientesControllerSur.deletePaciente(req, res);
    } else {
      return res.status(400).json({ error: 'Sede inválida' });
    }
  },
};
