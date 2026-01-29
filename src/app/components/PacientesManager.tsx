import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  fechaNacimiento: string;
  telefono: string;
  email: string;
  direccion: string;
  centroMedico: string;
  genero: string;
}

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
    telefono: "",
    email: "",
    direccion: "",
    genero: "",
    centroMedico: selectedCenter === 'CENTRO' ? '1' : selectedCenter === 'SUR' ? '2' : '0',
  });

  const filteredPacientes = pacientes.filter((p) =>
    (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cedula.includes(searchTerm))
  );

  const handleOpenDialog = (paciente?: Paciente) => {
    if (paciente) {
      setEditingPaciente(paciente);
      // Asegurar que centroMedico sea código numérico en string
      const centroStr = paciente.centroMedico !== undefined && paciente.centroMedico !== null
        ? (isNaN(Number(paciente.centroMedico))
            ? (paciente.centroMedico.toString().toUpperCase() === 'CENTRO' ? '1' : paciente.centroMedico.toString().toUpperCase() === 'SUR' ? '2' : '0')
            : String(Number(paciente.centroMedico)))
        : (selectedCenter === 'CENTRO' ? '1' : selectedCenter === 'SUR' ? '2' : '0');

      setFormData({
        id: paciente.id || "",
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        cedula: paciente.cedula,
        fechaNacimiento: paciente.fechaNacimiento,
        telefono: paciente.telefono,
        email: paciente.email,
        direccion: paciente.direccion,
        genero: paciente.genero || "",
        centroMedico: centroStr,
      });
    } else {
      setEditingPaciente(null);
      setFormData({
        id: "",
        nombre: "",
        apellido: "",
        cedula: "",
        fechaNacimiento: "",
        telefono: "",
        email: "",
        direccion: "",
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

  const localFilter = (currentFilter || selectedCenter).toUpperCase();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Gestión de Pacientes - {selectedCenter}
            </CardTitle>
            <div className="flex items-center gap-3">
              <select
                value={localFilter}
                onChange={(e) => onFilterChange && onFilterChange(e.target.value.toLowerCase())}
                className="border rounded px-3 py-2 text-sm"
                aria-label="Filtro sede"
              >
                <option value={"TODOS"}>Todos</option>
                <option value={"NORTE"}>Norte</option>
                <option value={"CENTRO"}>Centro</option>
                <option value={"SUR"}>Sur</option>
              </select>
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
                  <TableHead>Cédula</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apellido</TableHead>
                  <TableHead>Fecha Nac.</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
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
                      <TableCell className="font-medium">{paciente.cedula}</TableCell>
                      <TableCell>{paciente.nombre}</TableCell>
                      <TableCell>{paciente.apellido}</TableCell>
                      <TableCell>{paciente.fechaNacimiento}</TableCell>
                      <TableCell>{paciente.telefono}</TableCell>
                      <TableCell>{paciente.email}</TableCell>
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
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
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
