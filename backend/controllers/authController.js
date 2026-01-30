async function login(req, res) {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ ok: false, message: 'Faltan credenciales' });
    }

    // Credenciales simples por sede
    const map = {
      norte: { user: 'norte', pass: 'norte' },
      centro: { user: 'centro', pass: 'centro' },
      sur: { user: 'sur', pass: 'sur' },
      usuario: { user: 'usuario', pass: 'usuario' },
    };

    // Encontrar la sede que coincida
    const sede = Object.keys(map).find((s) => map[s].user === username && map[s].pass === password);
    if (!sede) {
      return res.status(401).json({ ok: false, message: 'Credenciales inválidas' });
    }

    // Respuesta simple: OK + sede
    return res.json({ ok: true, sede });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ ok: false, message: err.message });
  }
}

module.exports = {
  login,
};
