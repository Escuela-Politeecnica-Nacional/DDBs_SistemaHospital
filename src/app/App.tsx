import { useState, useEffect, useMemo } from "react";
import { Button } from "./components/ui/button";
import { Activity, LayoutDashboard, Users, UserCog, Building2, Calendar, FileText } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { PacientesManager } from "./components/PacientesManager";
import { DoctoresManager } from "./components/DoctoresManager";
import { ConsultoriosManager } from "./components/ConsultoriosManager";
import { CitasManager } from "./components/CitasManager";
import { HistorialMedico } from "./components/HistorialMedico";
import { HistorialesManager } from "./components/HistorialesManager";
import { EspecialidadesManager } from "./components/EspecialidadesManager";
import { CentrosMedicosManager } from "./components/CentrosMedicosManager";
import Login from "./components/Login";

type Vista = "dashboard" | "pacientes" | "doctores" | "consultorios" | "citas" | "historial" | "especialidades" | "centros" | "historiales";
import type { Especialidad, Paciente, Doctor, Consultorio, Cita, Historial } from "@/app/types";

// Utilidad para mapear el nombre del centro a su valor numérico
const getSedeNumber = (sede: string) => {
  if (!sede) return 1;
  const s = sede.toLowerCase();
  if (s === 'centro') return 1;
  if (s === 'sur') return 2;
  if (s === 'norte') return 0;
  return 1;
};

export default function App() {
  // Helper: normalize centro_medico value to uppercase label used in UI
  const centroLabel = (val: any) => {
    if (val === null || val === undefined) return '';
    const s = String(val).toLowerCase();
    if (s === '1' || s === 'centro' || s === 'centro_medico' || s === 'central') return 'CENTRO';
    if (s === '2' || s === 'sur') return 'SUR';
    if (s === '0' || s === 'norte') return 'NORTE';
    // try numeric
    if (!isNaN(Number(s))) {
      const n = Number(s);
      if (n === 1) return 'CENTRO';
      if (n === 2) return 'SUR';
      if (n === 0) return 'NORTE';
    }
    return String(val).toUpperCase();
  };

  const [selectedCenter, setSelectedCenter] = useState<string>(localStorage.getItem('sede') || "");
  const [currentView, setCurrentView] = useState<Vista>("dashboard");
  const [selectedCitaId, setSelectedCitaId] = useState<string>("");
  const [pacientesFilter, setPacientesFilter] = useState<string>(selectedCenter ? selectedCenter.toLowerCase() : 'centro');
  const [doctoresFilter, setDoctoresFilter] = useState<string>(selectedCenter ? selectedCenter.toLowerCase() : 'centro');
  const [consultoriosFilter, setConsultoriosFilter] = useState<string>(selectedCenter ? selectedCenter.toLowerCase() : 'centro');
  const [citasFilter, setCitasFilter] = useState<string>(selectedCenter ? selectedCenter.toLowerCase() : 'centro');
  const [historialesFilter, setHistorialesFilter] = useState<string>(selectedCenter ? selectedCenter.toLowerCase() : 'centro');

  // Ensure module filters follow the currently selected center (e.g., after login)
  useEffect(() => {
    const s = selectedCenter ? selectedCenter.toLowerCase() : 'centro';
    setPacientesFilter(s);
    setDoctoresFilter(s);
    setConsultoriosFilter(s);
    setCitasFilter(s);
    setHistorialesFilter(s);
  }, [selectedCenter]);

  // Datos replicados (disponibles en ambos centros)
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);

  /**
   * Carga las especialidades desde el backend (replicadas).
   */
  const fetchEspecialidades = async () => {
    try {
      const url = selectedCenter === 'USUARIO' ? 'http://localhost:4000/api/usuario/especialidades' : 'http://localhost:4000/api/especialidades';
      const res = await fetch(url);
      const data = await res.json();
      const especialidadesAdaptadas = data.map((e: any) => ({
        id: e.id_especialidad?.toString() || e.id?.toString() || '',
        nombre: e.nombre_especialidad || '',
      }));
      setEspecialidades(especialidadesAdaptadas);
    } catch (error) {
      setEspecialidades([]);
    }
  };

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  /**
   * Agrega una especialidad usando la API.
   */
  const handleAddEspecialidad = async (especialidad: Omit<Especialidad, "id">) => {
    try {
      await fetch(`http://localhost:4000/api/especialidades`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_especialidad: (especialidad as any).id || undefined, nombre: especialidad.nombre })
        });
      fetchEspecialidades();
    } catch (error) {}
  };

  /**
   * Edita una especialidad usando la API.
   */
  const handleEditEspecialidad = async (id: string, especialidad: Omit<Especialidad, "id">) => {
    try {
      await fetch(`http://localhost:4000/api/especialidades/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: especialidad.nombre })
        });
      fetchEspecialidades();
    } catch (error) {}
  };

  /**
   * Elimina una especialidad usando la API.
   */
  const handleDeleteEspecialidad = async (id: string) => {
    try {
      await fetch(`http://localhost:4000/api/especialidades/${id}`, { method: "DELETE" });
      fetchEspecialidades();
    } catch (error) {}
  };

  // Datos fragmentados por centro médico
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  /**
   * Carga los pacientes desde el backend según la sede seleccionada.
   */
  const fetchPacientes = async () => {
    try {
      let res;
      if (selectedCenter === 'USUARIO') {
        res = await fetch('http://localhost:4000/api/usuario/pacientes');
      } else {
        const sede = selectedCenter.toLowerCase();
        res = await fetch(`http://localhost:4000/api/pacientes?sede=${sede}&filter=${pacientesFilter}`);
      }
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        console.error(`fetchPacientes: API returned ${res.status} ${res.statusText} - ${errBody}`);
        setPacientes([]);
        return;
      }
      const data = await res.json();
      const pacientesAdaptados = data.map((p: any) => ({
        id: p.id_paciente?.toString() || p.id?.toString() || '',
        cedula: p.cedula || '',
        nombre: p.nombre || '',
        apellido: p.apellido || '',
        fechaNacimiento: p.fecha_nacimiento || '',
        genero: p.genero || '',
        telefono: '',
        email: '',
        direccion: '',
        centroMedico: selectedCenter === 'USUARIO' ? centroLabel(p.centro_medico || '') : centroLabel(p.centro_medico || p.info_centro_medico || p.detalle_centro_medico || selectedCenter),
      }));
      setPacientes(pacientesAdaptados);
    } catch (error) {
      setPacientes([]);
    }
  };

  useEffect(() => {
    fetchPacientes();
    // eslint-disable-next-line
  }, [selectedCenter, pacientesFilter]);

  /**
   * Agrega un paciente usando la API.
   */
  const handleAddPaciente = async (paciente: any) => {
    try {
      if (selectedCenter === 'USUARIO') {
        const centroMedicoValue = paciente.centroMedico !== undefined && paciente.centroMedico !== ''
          ? Number(paciente.centroMedico)
          : 1; // default
        await fetch('http://localhost:4000/api/usuario/pacientes',
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_paciente: paciente.id || undefined,
              cedula: paciente.cedula,
              centro_medico: centroMedicoValue,
              nombre: paciente.nombre,
              apellido: paciente.apellido,
              fechaNacimiento: paciente.fechaNacimiento,
              genero: paciente.genero,
            })
          });
      } else {
        const sede = selectedCenter.toLowerCase();
        // usar centro_medico provisto en el formulario si existe, si no mapear desde selectedCenter
        const centroMedicoValue = paciente.centroMedico !== undefined && paciente.centroMedico !== ''
          ? Number(paciente.centroMedico)
          : (sede === 'centro' ? 1 : sede === 'sur' ? 2 : 0);

        await fetch(`http://localhost:4000/api/pacientes?sede=${sede}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_paciente: paciente.id || undefined,
              cedula: paciente.cedula,
              centro_medico: centroMedicoValue,
              nombre: paciente.nombre,
              apellido: paciente.apellido,
              fechaNacimiento: paciente.fechaNacimiento,
              genero: paciente.genero,
            })
          });
      }
      fetchPacientes();
    } catch (error) {}
  };

  /**
   * Edita un paciente usando la API.
   */
  const handleEditPaciente = async (id: string, paciente: Omit<Paciente, "id">) => {
    try {
      if (!id) {
        console.error('handleEditPaciente: id vacío, no se ejecutará la petición PUT');
        return;
      }
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/pacientes/${id}?sede=${sede}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: paciente.nombre,
            apellido: paciente.apellido,
            fechaNacimiento: paciente.fechaNacimiento,
            genero: paciente.genero,
          })
        });
      fetchPacientes();
    } catch (error) {}
  };

  /**
   * Elimina un paciente usando la API.
   */
  const handleDeletePaciente = async (id: string) => {
    try {
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/pacientes/${id}?sede=${sede}`, { method: "DELETE" });
      fetchPacientes();
    } catch (error) {}
  };

  const [doctores, setDoctores] = useState<Doctor[]>([]);

  /**
   * Carga los doctores desde el backend según la sede seleccionada.
   */
  const fetchDoctores = async () => {
    try {
      let res;
      if (selectedCenter === 'USUARIO') {
        res = await fetch('http://localhost:4000/api/usuario/doctores');
      } else {
        const sede = selectedCenter.toLowerCase();
        res = await fetch(`http://localhost:4000/api/doctores?sede=${sede}&filter=${doctoresFilter}`);
      }
      const data = await res.json();
      const doctoresAdaptados = data.map((d: any) => ({
        id: d.id_doctor?.toString() || d.id?.toString() || '',
        nombre: d.nombre || '',
        apellido: d.apellido || '',
        especialidadId: d.id_especialidad?.toString() || '',
        telefono: '',
        email: '',
        centroMedico: selectedCenter === 'USUARIO' ? centroLabel(d.centro_medico?.toString() || '') : centroLabel(d.centro_medico?.toString() || selectedCenter),
      }));
      setDoctores(doctoresAdaptados);
    } catch (error) {
      setDoctores([]);
    }
  };

  useEffect(() => {
    fetchDoctores();
    // eslint-disable-next-line
  }, [selectedCenter, doctoresFilter]);

  /**
   * Agrega un doctor usando la API.
   */
  const handleAddDoctor = async (doctor: Doctor) => {
    try {
      if (selectedCenter === 'USUARIO') {
        await fetch('http://localhost:4000/api/usuario/doctores',
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_doctor: (doctor as any).id || undefined,
              nombre: doctor.nombre,
              apellido: doctor.apellido,
              id_especialidad: doctor.especialidadId,
              centro_medico: Number(doctor.centroMedico),
            })
          });
      } else {
        const sedeNum = getSedeNumber(selectedCenter);
        await fetch(`http://localhost:4000/api/doctores?sede=${sedeNum}&filter=${doctoresFilter}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_doctor: (doctor as any).id || undefined,
              nombre: doctor.nombre,
              apellido: doctor.apellido,
              id_especialidad: doctor.especialidadId,
              centro_medico: Number(doctor.centroMedico) || sedeNum,
            })
          });
      }
      fetchDoctores();
    } catch (error) {}
  };

  /**
   * Edita un doctor usando la API.
   */
  const handleEditDoctor = async (id: string, doctor: Omit<Doctor, "id">) => {
    try {
      if (selectedCenter === 'USUARIO') {
        await fetch(`http://localhost:4000/api/usuario/doctores/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: doctor.nombre,
              apellido: doctor.apellido,
              id_especialidad: doctor.especialidadId,
              centro_medico: Number(doctor.centroMedico),
            })
          });
      } else {
        const sedeNum = getSedeNumber(selectedCenter);
        await fetch(`http://localhost:4000/api/doctores/${id}?sede=${sedeNum}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: doctor.nombre,
              apellido: doctor.apellido,
              id_especialidad: doctor.especialidadId,
              centro_medico: Number(doctor.centroMedico) || sedeNum,
              sede: sedeNum
            })
          });
      }
      fetchDoctores();
    } catch (error) {}
  };

  /**
   * Elimina un doctor usando la API.
   */
  const handleDeleteDoctor = async (id: string) => {
    try {
      if (selectedCenter === 'USUARIO') {
        await fetch(`http://localhost:4000/api/usuario/doctores/${id}`, { method: "DELETE" });
      } else {
        const sedeNum = getSedeNumber(selectedCenter);
        await fetch(`http://localhost:4000/api/doctores/${id}?sede=${sedeNum}`, { method: "DELETE" });
      }
      fetchDoctores();
    } catch (error) {}
  };

  const [consultorios, setConsultorios] = useState<Consultorio[]>([]);

  /**
   * Carga los consultorios desde el backend según la sede seleccionada.
   */
  const fetchConsultorios = async () => {
    try {
      let res;
      if (selectedCenter === 'USUARIO') {
        res = await fetch('http://localhost:4000/api/usuario/consultorios');
      } else {
        const sede = selectedCenter.toLowerCase();
        res = await fetch(`http://localhost:4000/api/consultorios?sede=${sede}&filter=${consultoriosFilter}`);
      }
      const data = await res.json();
      const consultoriosAdaptados = data.map((c: any) => ({
        id: c.id_consultorio?.toString() || c.id?.toString() || '',
        numero: c.numero || '',
        ubicacion: c.ubicacion || c.ubicacion_desc || '',
        centroMedico: selectedCenter === 'USUARIO' ? centroLabel(c.centro_medico || '') : centroLabel(c.centro_medico || c.centroMedico || selectedCenter),
      }));
      setConsultorios(consultoriosAdaptados);
    } catch (error) {
      setConsultorios([]);
    }
  };

  useEffect(() => {
    fetchConsultorios();
    // eslint-disable-next-line
  }, [selectedCenter, consultoriosFilter]);

  /**
   * Agrega un consultorio usando la API.
   */
  const handleAddConsultorio = async (consultorio: Consultorio) => {
    try {
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/consultorios?sede=${sede}&filter=${consultoriosFilter}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_consultorio: (consultorio as any).id || undefined,
            numero: consultorio.numero,
            ubicacion: consultorio.ubicacion,
            centro_medico: consultorio.centroMedico || selectedCenter
          })
        });
      fetchConsultorios();
    } catch (error) {}
  };

  /**
   * Edita un consultorio usando la API.
   */
  const handleEditConsultorio = async (id: string, consultorio: Omit<Consultorio, "id">) => {
    try {
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/consultorios/${id}?sede=${sede}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numero: consultorio.numero,
            ubicacion: consultorio.ubicacion,
            centro_medico: consultorio.centroMedico || selectedCenter,
          })
        });
      fetchConsultorios();
    } catch (error) {}
  };

  /**
   * Elimina un consultorio usando la API.
   */
  const handleDeleteConsultorio = async (id: string) => {
    try {
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/consultorios/${id}?sede=${sede}`, { method: "DELETE" });
      fetchConsultorios();
    } catch (error) {}
  };

  const [citas, setCitas] = useState<Cita[]>([]);

  /**
   * Carga las citas desde el backend según la sede seleccionada.
   */
  const fetchCitas = async () => {
    try {
      let res;
      if (selectedCenter === 'USUARIO') {
        res = await fetch('http://localhost:4000/api/usuario/citas');
      } else {
        const sede = selectedCenter.toLowerCase();
        res = await fetch(`http://localhost:4000/api/citas?sede=${sede}&filter=${citasFilter}`);
      }
      if (!res.ok) {
        const errBody = await res.text().catch(() => '');
        console.error(`fetchCitas: API returned ${res.status} ${res.statusText} - ${errBody}`);
        setCitas([]);
        return;
      }
      const data = await res.json();
      const citasAdaptadas = data.map((c: any) => ({
        id: c.id_cita?.toString() || c.id?.toString() || '',
        pacienteId: c.id_paciente?.toString() || '',
        consultorioId: c.id_consultorio?.toString() || '',
        doctorId: c.id_doctor?.toString() || '',
        fecha: c.fecha || '',
        motivo: c.motivo || '',
        centroMedico: selectedCenter === 'USUARIO' ? (c.centro_medico ?? '') : (c.centro_medico ?? c.centroMedico ?? selectedCenter),
      }));
      setCitas(citasAdaptadas);
    } catch (error) {
      setCitas([]);
    }
  };

  useEffect(() => {
    fetchCitas();
    // eslint-disable-next-line
  }, [selectedCenter, citasFilter]);

  /**
   * Agrega una cita usando la API.
   */
  const handleAddCita = async (cita: Omit<Cita, "id">) => {
    try {
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/citas?sede=${sede}&filter=${citasFilter}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_cita: (cita as any).id || undefined,
            id_consultorio: cita.consultorioId,
            id_paciente: cita.pacienteId,
            fecha: cita.fecha,
            motivo: cita.motivo,
            centro_medico: (cita as any).centroMedico !== undefined && (cita as any).centroMedico !== ''
              ? Number((cita as any).centroMedico)
              : (sede === 'centro' ? 1 : sede === 'sur' ? 2 : 0),
          })
        });
      fetchCitas();
    } catch (error) {}
  };

  /**
   * Edita una cita usando la API.
   */
  const handleEditCita = async (id: string, cita: Omit<Cita, "id">) => {
    try {
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/citas/${id}?sede=${sede}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_consultorio: cita.consultorioId,
            id_paciente: cita.pacienteId,
            fecha: cita.fecha,
            motivo: cita.motivo,
          })
        });
      fetchCitas();
    } catch (error) {}
  };

  /**
   * Elimina una cita usando la API.
   */
  const handleDeleteCita = async (id: string) => {
    try {
      const sede = selectedCenter.toLowerCase();
      const res = await fetch(`http://localhost:4000/api/citas/${id}?sede=${sede}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.error('handleDeleteCita failed', res.status, body);
        // still refresh list to show current server state
      }
      fetchCitas();
    } catch (error) {}
  };

  const [historiales, setHistoriales] = useState<Historial[]>([]);

  const [centros, setCentros] = useState<any[]>([]);

  /**
   * Carga los centros médicos desde el backend.
   */
  const fetchCentros = async () => {
    try {
      let res;
      if (selectedCenter === 'USUARIO') {
        res = await fetch('http://localhost:4000/api/usuario/centros');
      } else {
        const sede = selectedCenter ? selectedCenter.toLowerCase() : 'centro';
        res = await fetch(`http://localhost:4000/api/centros?sede=${sede}`);
      }
      const data = await res.json();
      console.log(`fetchCentros: received ${Array.isArray(data) ? data.length : 0} items from API`);
      const centrosAdaptados = data.map((c: any) => ({
        id: c.id_centro_medico?.toString() || c.id_centro?.toString() || c.id?.toString() || '',
        nombre: c.nombre || c.nombre_centro || '',
        direccion: c.direccion || '',
        telefono: c.telefono || '',
        email: c.email || '',
        sede: c.sede || '',
      }));
      setCentros(centrosAdaptados);
    } catch (error) {
      setCentros([]);
    }
  };

  useEffect(() => {
    fetchCentros();
  }, [selectedCenter]);

  /**
   * Carga los historiales médicos desde el backend según la sede seleccionada.
   */
  const fetchHistoriales = async () => {
    try {
      let res;
      if (selectedCenter === 'USUARIO') {
        res = await fetch('http://localhost:4000/api/usuario/historiales');
      } else {
        const sede = selectedCenter.toLowerCase();
        res = await fetch(`http://localhost:4000/api/historial?sede=${sede}&filter=${historialesFilter}`);
      }
      const data = await res.json();
      console.log(`fetchHistoriales: received ${Array.isArray(data) ? data.length : 0} items from API`);
      const historialesAdaptados = data.map((h: any) => ({
        id: h.id_historial?.toString() || h.id?.toString() || '',
        citaId: h.id_cita?.toString() || '',
        diagnostico: h.diagnostico || '',
        tratamiento: h.tratamiento || '',
        observaciones: h.observaciones || '',
        fecha: h.fecha_registro || '',
      }));
      setHistoriales(historialesAdaptados);
    } catch (error) {
      setHistoriales([]);
    }
  };

  useEffect(() => {
    fetchHistoriales();
    // eslint-disable-next-line
  }, [selectedCenter, historialesFilter]);

  /**
   * Agrega un historial médico usando la API.
   */
  const handleAddHistorial = async (historial: Omit<Historial, "id">) => {
    try {
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/historial?sede=${sede}&filter=${historialesFilter}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_cita: historial.citaId,
            observaciones: historial.observaciones,
            diagnostico: historial.diagnostico,
            tratamiento: historial.tratamiento,
            fecha_registro: historial.fecha,
          })
        });
      fetchHistoriales();
    } catch (error) {}
  };

  /**
   * Edita un historial médico usando la API.
   */
  const handleEditHistorial = async (id: string, historial: Omit<Historial, "id">) => {
    try {
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/historial/${id}?sede=${sede}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            observaciones: historial.observaciones,
            diagnostico: historial.diagnostico,
            tratamiento: historial.tratamiento,
            fecha_registro: historial.fecha,
          })
        });
      fetchHistoriales();
    } catch (error) {}
  };

  /**
   * Elimina un historial médico usando la API.
   */
  const handleDeleteHistorial = async (id: string) => {
    try {
      const sede = selectedCenter.toLowerCase();
      await fetch(`http://localhost:4000/api/historial/${id}?sede=${sede}`, { method: "DELETE" });
      fetchHistoriales();
    } catch (error) {}
  };

  const handleViewHistorial = (citaId: string) => {
    setSelectedCitaId(citaId);
    setCurrentView("historial");
  };

  // Calcular estadísticas del dashboard
  const stats = useMemo(() => {
    const pacientesCentro = pacientes.filter((p) => p.centroMedico === selectedCenter);
    const doctoresCentro = doctores.filter((d) => d.centroMedico === selectedCenter);
    const consultoriosCentro = consultorios.filter((c) => c.centroMedico === selectedCenter);

    const citasCentro = citas.filter((cita) => {
      const consultorio = consultorios.find((c) => c.id === cita.consultorioId);
      return consultorio?.centroMedico === selectedCenter;
    });

    const today = new Date().toISOString().split("T")[0];
    const citasHoy = citasCentro.filter((c) => c.fecha === today).length;

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const citasSemana = citasCentro.filter((c) => {
      const citaDate = new Date(c.fecha);
      return citaDate >= new Date() && citaDate <= nextWeek;
    }).length;

    const historialesCentro = historiales.filter((h) => {
      const cita = citas.find((c) => c.id === h.citaId);
      if (!cita) return false;
      const consultorio = consultorios.find((c) => c.id === cita.consultorioId);
      return consultorio?.centroMedico === selectedCenter;
    });

    return {
      pacientes: pacientesCentro.length,
      doctores: doctoresCentro.length,
      consultorios: consultoriosCentro.length,
      citasHoy,
      citasSemana,
      historiales: historialesCentro.length,
    };
  }, [selectedCenter, pacientes, doctores, consultorios, citas, historiales]);

  const menuItems = [
    { id: "dashboard" as Vista, label: "Dashboard", icon: LayoutDashboard },
    { id: "pacientes" as Vista, label: "Pacientes", icon: Users },
    { id: "especialidades" as Vista, label: "Especialidades", icon: FileText },
    { id: "historiales" as Vista, label: "Historiales", icon: FileText },
    { id: "doctores" as Vista, label: "Doctores", icon: UserCog },
    { id: "consultorios" as Vista, label: "Consultorios", icon: Building2 },
    { id: "citas" as Vista, label: "Citas", icon: Calendar },
    { id: "centros" as Vista, label: "Centros Médicos", icon: Building2 },
  ];

  return (
    !selectedCenter ? <Login onLogin={(sede:string) => { setSelectedCenter(sede.toUpperCase()); localStorage.setItem('sede', sede.toUpperCase()); }} /> :
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg">
                <Activity className="size-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Sistema de Gestión Hospitalaria</h1>
                <p className="text-sm text-gray-500">Base de datos distribuida</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-gray-500 mb-1">Centro Médico Activo</span>
                  <div className="w-[180px] border-2 border-blue-200 rounded px-3 py-1 text-sm font-medium">{selectedCenter}</div>
                </div>
                <div>
                  <Button variant="ghost" onClick={() => {
                    // logout: clear stored sede and reset app state
                    localStorage.removeItem('sede');
                    setSelectedCenter('');
                    setCurrentView('dashboard');
                  }}>Cerrar sesión</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-2 py-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setCurrentView(item.id)}
                  className={
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }
                >
                  <Icon className="size-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentView === "dashboard" && (
          <Dashboard selectedCenter={selectedCenter} stats={stats} />
        )}

        {currentView === "pacientes" && (
          <PacientesManager
            selectedCenter={selectedCenter}
            pacientes={pacientes}
            onAddPaciente={handleAddPaciente}
            onEditPaciente={handleEditPaciente}
            onDeletePaciente={handleDeletePaciente}
            currentFilter={pacientesFilter}
            onFilterChange={(f) => setPacientesFilter(f)}
          />
        )}

        {currentView === "doctores" && (
          <DoctoresManager
            selectedCenter={selectedCenter}
            doctores={doctores}
            especialidades={especialidades}
            onAddDoctor={handleAddDoctor}
            onEditDoctor={handleEditDoctor}
            onDeleteDoctor={handleDeleteDoctor}
            currentFilter={doctoresFilter}
            onFilterChange={(f) => setDoctoresFilter(f)}
          />
        )}

        {currentView === "consultorios" && (
          <ConsultoriosManager
            selectedCenter={selectedCenter}
            consultorios={consultorios}
            onAddConsultorio={handleAddConsultorio}
            onEditConsultorio={handleEditConsultorio}
            onDeleteConsultorio={handleDeleteConsultorio}
            currentFilter={consultoriosFilter}
            onFilterChange={(f) => setConsultoriosFilter(f)}
          />
        )}

        {currentView === "citas" && (
          <CitasManager
            selectedCenter={selectedCenter}
            citas={citas}
            pacientes={pacientes}
            doctores={doctores}
            consultorios={consultorios}
            onAddCita={handleAddCita}
            onEditCita={handleEditCita}
            onDeleteCita={handleDeleteCita}
            onViewHistorial={handleViewHistorial}
            currentFilter={citasFilter}
            onFilterChange={(f) => setCitasFilter(f)}
          />
        )}

        {currentView === "historial" && (
          <HistorialMedico
            citaId={selectedCitaId}
            citas={citas}
            historiales={historiales}
            pacientes={pacientes}
            doctores={doctores}
            consultorios={consultorios}
            onBack={() => setCurrentView("citas")}
          />
        )}

        {currentView === "historiales" && (
          <HistorialesManager
            historiales={historiales}
            onViewDetalle={(citaId) => {
              setSelectedCitaId(citaId);
              setCurrentView("historial");
            }}
            currentFilter={historialesFilter}
            onFilterChange={(f) => setHistorialesFilter(f)}
          />
        )}

        {currentView === "especialidades" && (
          <EspecialidadesManager especialidades={especialidades} onAdd={handleAddEspecialidad} onDelete={handleDeleteEspecialidad} />
        )}

        {currentView === "centros" && (
          <CentrosMedicosManager centros={centros} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <p>Sistema de Gestión Hospitalaria © 2026</p>
            <p className="flex items-center gap-2">
              <FileText className="size-4" />
              Base de datos distribuida SQL Server
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}