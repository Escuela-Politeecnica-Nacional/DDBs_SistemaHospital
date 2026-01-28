import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Doctor {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
  especialidadId: string;
  telefono: string;
  email: string;
  centroMedico: string;
}

interface Especialidad {
  id: string;
  nombre: string;
}

interface DoctoresManagerProps {
  selectedCenter: string;
  doctores: Doctor[];
  especialidades: Especialidad[];
  onAddDoctor: (doctor: Omit<Doctor, "id">) => void;
  onEditDoctor: (id: string, doctor: Omit<Doctor, "id">) => void;
  onDeleteDoctor: (id: string) => void;
}

export function DoctoresManager({
  selectedCenter,
  doctores,
  especialidades,
  onAddDoctor,
  onEditDoctor,
  onDeleteDoctor,
}: DoctoresManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    especialidadId: "",
    telefono: "",
    email: "",
  });

  const filteredDoctores = doctores.filter(
    (d) =>
      d.centroMedico === selectedCenter &&
      (d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.cedula.includes(searchTerm))
  );

  const getEspecialidadNombre = (especialidadId: string) => {
    return especialidades.find((e) => e.id === especialidadId)?.nombre || "N/A";
  };

  const handleOpenDialog = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        nombre: doctor.nombre,
        apellido: doctor.apellido,
        cedula: doctor.cedula,
        especialidadId: doctor.especialidadId,
        telefono: doctor.telefono,
        email: doctor.email,
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        nombre: "",
        apellido: "",
        cedula: "",
        especialidadId: "",
        telefono: "",
        email: "",
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDoctor(null);
  };

  const handleSubmit = () => {
    const doctorData = { ...formData, centroMedico: selectedCenter };
    if (editingDoctor) {
      onEditDoctor(editingDoctor.id, doctorData);
    } else {
      onAddDoctor(doctorData);
    }
    handleCloseDialog();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Gestión de Doctores - {selectedCenter}
            </CardTitle>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Plus className="size-4 mr-2" />
              Nuevo Doctor
            </Button>
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
                  <TableHead>Especialidad</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      No hay doctores registrados en {selectedCenter}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDoctores.map((doctor) => (
                    <TableRow key={doctor.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{doctor.cedula}</TableCell>
                      <TableCell>{doctor.nombre}</TableCell>
                      <TableCell>{doctor.apellido}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                          {getEspecialidadNombre(doctor.especialidadId)}
                        </Badge>
                      </TableCell>
                      <TableCell>{doctor.telefono}</TableCell>
                      <TableCell>{doctor.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(doctor)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteDoctor(doctor.id)}
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
              {editingDoctor ? "Editar Doctor" : "Nuevo Doctor"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
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
              <Label htmlFor="especialidad">Especialidad</Label>
              <Select
                value={formData.especialidadId}
                onValueChange={(value) =>
                  setFormData({ ...formData, especialidadId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map((esp) => (
                    <SelectItem key={esp.id} value={esp.id}>
                      {esp.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              {editingDoctor ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
