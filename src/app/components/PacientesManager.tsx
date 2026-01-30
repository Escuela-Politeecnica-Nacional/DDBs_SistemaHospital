import { useState } from "react";
import type { Paciente } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Plus, Edit, Trash2, Search } from "lucide-react";

// using shared `Paciente` type from @/app/types

interface PacientesManagerProps {
  selectedCenter: string;
  pacientes: Paciente[];
  onAddPaciente: (paciente: Omit<Paciente, "id">) => void | Promise<void>;
  onEditPaciente: (id: string, paciente: Omit<Paciente, "id">) => void | Promise<void>;
  onDeletePaciente: (id: string) => void;
  currentFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function PacientesManager({
  selectedCenter,
  pacientes,
  onAddPaciente,
  onEditPaciente,
  onDeletePaciente,
  currentFilter,
  onFilterChange,
}: PacientesManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    id: "",
    nombre: "",
    apellido: "",
    cedula: "",
    fechaNacimiento: "",
    genero: "",
    centroMedico: selectedCenter === 'CENTRO' ? '1' : selectedCenter === 'SUR' ? '2' : '0',
  });

  const filteredPacientes = pacientes.filter((p) =>
    (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cedula.includes(searchTerm) ||
      p.id.includes(searchTerm))
  );

  console.log('Filtered Pacientes:', filteredPacientes);

  const handleOpenDialog = async (paciente?: Paciente) => {
    if (paciente) {
      setEditingPaciente(paciente);

      // Asegurar que centroMedico sea código numérico en string
      const centroStr = paciente.centroMedico !== undefined && paciente.centroMedico !== null
        ? (isNaN(Number(paciente.centroMedico))
            ? (paciente.centroMedico.toString().toUpperCase() === 'CENTRO' ? '1' : paciente.centroMedico.toString().toUpperCase() === 'SUR' ? '2' : '0')
            : String(Number(paciente.centroMedico)))
        : (selectedCenter === 'CENTRO' ? '1' : selectedCenter === 'SUR' ? '2' : '0');

      // Prefill inmediato usando el objeto de la lista para evitar campos vacíos
      const idVal = paciente.id ? paciente.id.toString() : "";
      let fechaVal = "";
      if (paciente.fechaNacimiento) {
        try {
          const d = new Date(paciente.fechaNacimiento);
          if (!isNaN(d.getTime())) fechaVal = d.toISOString().split('T')[0];
          else if (typeof paciente.fechaNacimiento === 'string') fechaVal = paciente.fechaNacimiento.split('T')[0] || paciente.fechaNacimiento;
        } catch (e) {
          fechaVal = paciente.fechaNacimiento as unknown as string;
        }
      }

      setFormData({
        id: idVal,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        cedula: paciente.cedula,
        fechaNacimiento: fechaVal,
        genero: paciente.genero || "",
        centroMedico: centroStr,
      });

      // Luego intentar obtener datos completos del backend y actualizar el formulario
      try {
        const sede = selectedCenter.toLowerCase();
        if (paciente.id) {
          const res = await fetch(`http://localhost:4000/api/pacientes/${paciente.id}?sede=${sede}`);
          if (res.ok) {
            const full = await res.json();
            const idFull = full.id_paciente?.toString() || full.id?.toString() || idVal;
            let fechaFull = fechaVal;
            if (full.fecha_nacimiento) {
              try {
                const d2 = new Date(full.fecha_nacimiento);
                if (!isNaN(d2.getTime())) fechaFull = d2.toISOString().split('T')[0];
                else if (typeof full.fecha_nacimiento === 'string') fechaFull = full.fecha_nacimiento.split('T')[0] || full.fecha_nacimiento;
              } catch (e) {
                fechaFull = full.fecha_nacimiento;
              }
            }
            setFormData(prev => ({ ...prev, id: idFull, nombre: full.nombre || prev.nombre, apellido: full.apellido || prev.apellido, cedula: full.cedula || prev.cedula, fechaNacimiento: fechaFull, genero: full.genero || prev.genero, centroMedico: (full.centro_medico !== undefined ? String(full.centro_medico) : prev.centroMedico) }));
          }
        }
      } catch (e) {
        console.warn('No se pudo obtener paciente completo, usando datos de la lista', e);
      }
    } else {
      setEditingPaciente(null);
      setFormData({
        id: "",
        nombre: "",
        apellido: "",
        cedula: "",
        fechaNacimiento: "",
        genero: "",
        centroMedico: selectedCenter === 'CENTRO' ? '1' : selectedCenter === 'SUR' ? '2' : '0',
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPaciente(null);
  };

  const handleSubmit = () => {
    const pacienteData = { ...formData };
    if (editingPaciente) {
      const idToUse = (editingPaciente.id && editingPaciente.id.toString()) || (formData.id && formData.id.toString()) || "";
      if (!idToUse) {
        console.error('PacientesManager: id vacío al intentar actualizar paciente, operación cancelada');
        return;
      }
      onEditPaciente(idToUse, pacienteData);
    } else {
      onAddPaciente(pacienteData);
    }
    handleCloseDialog();
  };

  // Filtering removed: the UI will not change sede. Backend selection remains server-side.

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Gestión de Pacientes - {selectedCenter}
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium px-3 py-2">{selectedCenter}</div>
              <Button
                onClick={() => handleOpenDialog()}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Plus className="size-4 mr-2" />
                Nuevo Paciente
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Buscar por nombre, apellido o cédula..."
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
                    <TableHead>ID</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Apellido</TableHead>
                    <TableHead>Fecha Nac.</TableHead>
                    <TableHead>Género</TableHead>
                    <TableHead>Centro Médico</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacientes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No hay pacientes registrados en {selectedCenter}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPacientes.map((paciente) => (
                    <TableRow key={paciente.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{paciente.id}</TableCell>
                      <TableCell className="font-medium">{paciente.cedula}</TableCell>
                      <TableCell>{paciente.nombre}</TableCell>
                      <TableCell>{paciente.apellido}</TableCell>
                      <TableCell>{paciente.fechaNacimiento}</TableCell>
                      <TableCell>{paciente.genero}</TableCell>
                      <TableCell>{paciente.centroMedico}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(paciente)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeletePaciente(paciente.id)}
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
            <DialogTitle>
              {editingPaciente ? "Editar Paciente" : "Nuevo Paciente"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="id">ID Paciente</Label>
                          <Input
                            id="id"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            readOnly={!!editingPaciente}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="genero">Género</Label>
                          <select
                            id="genero"
                            value={formData.genero}
                            onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                          >
                            <option value="">Selecciona género</option>
                            <option value="M">Masculino</option>
                            <option value="F">Femenino</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="centroMedico">Centro Médico</Label>
                          <select
                            id="centroMedico"
                            value={formData.centroMedico}
                            onChange={(e) => setFormData({ ...formData, centroMedico: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                            required
                          >
                            <option value="">Selecciona centro</option>
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                          </select>
                        </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apellido">Apellido</Label>
              <Input
                id="apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                value={formData.cedula}
                onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) =>
                  setFormData({ ...formData, fechaNacimiento: e.target.value })
                }
              />
            </div>
            
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {editingPaciente ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
