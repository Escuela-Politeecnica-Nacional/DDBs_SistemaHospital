import { useState } from 'react';

interface Props {
  onLogin: (sede: string) => void;
}

export function Login({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (e: any) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Login: non-JSON response', res.status, text);
        setError(`Respuesta inesperada del servidor (${res.status}). Revisa que el backend esté corriendo.`);
        return;
      }

      const data = await res.json();
      if (res.ok && data.ok) {
        onLogin(data.sede);
      } else {
        setError(data.message || 'Credenciales inválidas');
      }
    } catch (err: any) {
      console.error('Login error', err);
      setError(err.message || 'Error de conexión');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold">Iniciar sesión</h2>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <label className="block text-sm">Usuario</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div>
          <label className="block text-sm">Contraseña</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded">Entrar</button>
        </div>
      </form>
      <div className="text-xs text-gray-600 mt-2">Usuarios de prueba: <b>norte/norte</b>, <b>centro/centro</b>, <b>sur/sur</b></div>
    </div>
  );
}

export default Login;
