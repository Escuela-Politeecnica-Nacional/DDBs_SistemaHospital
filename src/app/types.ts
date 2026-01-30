export interface Especialidad {
  id: string;
  nombre: string;
}

export interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  cedula?: string;
  fechaNacimiento?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  genero?: string;
  centroMedico?: string;
}

export interface Doctor {
  id: string;
  nombre: string;
  apellido: string;
  cedula?: string;
  especialidadId?: string;
  telefono?: string;
  email?: string;
  centroMedico?: string;
}

export interface Consultorio {
  id: string;
  numero?: string;
  ubicacion?: string;
  centroMedico?: string;
}

export interface Cita {
  id: string;
  pacienteId: string;
  consultorioId: string;
  doctorId: string;
  fecha: string;
  motivo: string;
  centroMedico?: string | number;
}

export interface Historial {
  id: string;
  citaId: string;
  diagnostico?: string;
  tratamiento?: string;
  observaciones?: string;
  fecha?: string;
  centroMedico?: string;
}

export interface Centro {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
}
