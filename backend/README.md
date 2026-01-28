# Sistema Hospitalario Backend

## Instalación

1. Instala las dependencias:

```
npm install
```

2. Crea un archivo `.env` con los datos de conexión a cada sede (ya incluido en este repo):

- DB_HOST_CENTRO, DB_USER_CENTRO, DB_PASS_CENTRO, DB_NAME_CENTRO
- DB_HOST_SUR, DB_USER_SUR, DB_PASS_SUR, DB_NAME_SUR
- DB_HOST_NORTE, DB_USER_NORTE, DB_PASS_NORTE, DB_NAME_NORTE

3. Inicia el servidor:

```
npm run dev
```

## Endpoints

- `GET /api/pacientes?sede=centro|norte|sur` — Lista los pacientes de la sede indicada.

Puedes agregar más rutas y controladores para otras entidades (doctores, citas, etc.) siguiendo la misma estructura modular.
