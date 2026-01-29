import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Plus, Edit, Trash2, Search, FileText } from "lucide-react";

interface Cita {
  id: string;
  pacienteId: string;
  doctorId: string;
  consultorioId: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: "Programada" | "Completada" | "Cancelada";
}

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  centroMedico: string;
}

interface Doctor {
  id: string;
  nombre: string;
  apellido: string;
  centroMedico: string;
}

interface Consultorio {
  id: string;
  numero: string;
  centroMedico: string;
}

interface CitasManagerProps {
  selectedCenter: string;
  citas: Cita[];
  pacientes: Paciente[];
  doctores: Doctor[];
  consultorios: Consultorio[];
  onAddCita: (cita: Omit<Cita, "id">) => void;
  onEditCita: (id: string, cita: Omit<Cita, "id">) => void;
  onDeleteCita: (id: string) => void;
  onViewHistorial: (citaId: string) => void;
  currentFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function CitasManager({
  selectedCenter,
  citas,
  pacientes,
  doctores,
  consultorios,
  onAddCita,
  onEditCita,
  onDeleteCita,
  onViewHistorial,
  currentFilter,
  onFilterChange,
}: CitasManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    pacienteId: "",
    doctorId: "",
    consultorioId: "",
    fecha: "",
    hora: "",
    motivo: "",
    estado: "Programada" as "Programada" | "Completada" | "Cancelada",
  });

  // Filtrar datos por centro médico
  const pacientesCentro = pacientes.filter((p) => p.centroMedico === selectedCenter);
  const doctoresCentro = doctores.filter((d) => d.centroMedico === selectedCenter);
  const consultoriosCentro = consultorios.filter((c) => c.centroMedico === selectedCenter);

  // Filtrar citas por centro médico (derivada de consultorios)
  const citasCentro = citas.filter((cita) => {
    const consultorio = consultorios.find((c) => c.id === cita.consultorioId);
    return consultorio?.centroMedico === selectedCenter;
  });

  const filteredCitas = citasCentro.filter((cita) => {
    const paciente = pacientes.find((p) => p.id === cita.pacienteId);
    const doctor = doctores.find((d) => d.id === cita.doctorId);
    const searchLower = searchTerm.toLowerCase();
    return (
      paciente?.nombre.toLowerCase().includes(searchLower) ||
      paciente?.apellido.toLowerCase().includes(searchLower) ||
      doctor?.nombre.toLowerCase().includes(searchLower) ||
      doctor?.apellido.toLowerCase().includes(searchLower) ||
      cita.motivo.toLowerCase().includes(searchLower)
    );
  });

  const getPacienteNombre = (id: string) => {
    const paciente = pacientes.find((p) => p.id === id);
    return paciente ? `${paciente.nombre} ${paciente.apellido}` : "N/A";
  };

  const getDoctorNombre = (id: string) => {
    const doctor = doctores.find((d) => d.id === id);
    return doctor ? `Dr. ${doctor.nombre} ${doctor.apellido}` : "N/A";
  };

  const getConsultorioNumero = (id: string) => {
    return consultorios.find((c) => c.id === id)?.numero || "N/A";
  };

  const handleOpenDialog = (cita?: Cita) => {
    if (cita) {
      setEditingCita(cita);
      setFormData({
        pacienteId: cita.pacienteId,
        doctorId: cita.doctorId,
        consultorioId: cita.consultorioId,
        fecha: cita.fecha,
        hora: cita.hora,
        motivo: cita.motivo,
        estado: cita.estado,
      });
    } else {
      setEditingCita(null);
      setFormData({
        pacienteId: "",
        doctorId: "",
        consultorioId: "",
        fecha: "",
        hora: "",
        motivo: "",
        estado: "Programada",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCita(null);
  };

  const handleSubmit = () => {
    if (editingCita) {
      onEditCita(editingCita.id, formData);
    } else {
      onAddCita(formData);
    }
    handleCloseDialog();
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Programada":
        return "bg-blue-100 text-blue-700";
      case "Completada":
        return "bg-green-100 text-green-700";
      case "Cancelada":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Gestión de Citas - {selectedCenter}
            </CardTitle>
            <div className="flex items-center gap-3">
              <select
                value={(currentFilter || selectedCenter).toUpperCase()}
                onChange={(e) => onFilterChange && onFilterChange(e.target.value.toLowerCase())}
                className="border rounded px-3 py-2 text-sm"
                aria-label="Filtro sede citas"
              >
                <option value={"TODOS"}>Todos</option>
                <option value={"NORTE"}>Norte</option>
                <option value={"CENTRO"}>Centro</option>
                <option value={"SUR"}>Sur</option>
              </select>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="size-4 mr-2" />
                Nueva Cita
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Buscar por paciente, doctor o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Consultorio</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCitas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                      No hay citas registradas en {selectedCenter}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCitas.map((cita) => (
                    <TableRow key={cita.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{cita.fecha}</TableCell>
                      <TableCell>{cita.hora}</TableCell>
                      <TableCell>{getPacienteNombre(cita.pacienteId)}</TableCell>
                      <TableCell>{getDoctorNombre(cita.doctorId)}</TableCell>
                      <TableCell>{getConsultorioNumero(cita.consultorioId)}</TableCell>
                      <TableCell>{cita.motivo}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={getEstadoColor(cita.estado)}>
                          {cita.estado}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewHistorial(cita.id)}
                            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                            title="Ver Historial Médico"
                          >
                            <FileText className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(cita)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteCita(cita.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCita ? "Editar Cita" : "Nueva Cita"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="paciente">Paciente</Label>
              <Select
                value={formData.pacienteId}
                onValueChange={(value) => setFormData({ ...formData, pacienteId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientesCentro.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nombre} {paciente.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Select
                value={formData.doctorId}
                onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctoresCentro.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr. {doctor.nombre} {doctor.apellido}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="consultorio">Consultorio</Label>
              <Select
                value={formData.consultorioId}
                onValueChange={(value) =>
                  setFormData({ ...formData, consultorioId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar consultorio" />
                </SelectTrigger>
                <SelectContent>
                  {consultoriosCentro.map((consultorio) => (
                    <SelectItem key={consultorio.id} value={consultorio.id}>
                      {consultorio.numero}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value: any) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Programada">Programada</SelectItem>
                  <SelectItem value="Completada">Completada</SelectItem>
                  <SelectItem value="Cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={formData.fecha}
                onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <Input
                id="hora"
                type="time"
                value={formData.hora}
                onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="motivo">Motivo de la Cita</Label>
              <Input
                id="motivo"
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Ej: Consulta general, Chequeo, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {editingCita ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
