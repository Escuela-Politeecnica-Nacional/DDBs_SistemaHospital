import { useState } from "react";
import type { Consultorio } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";

// using shared `Consultorio` type from @/app/types

interface ConsultoriosManagerProps {
  selectedCenter: string;
  consultorios: Consultorio[];
  onAddConsultorio: (consultorio: Consultorio) => void; // create: provide id + fields
  onEditConsultorio: (id: string, consultorio: Omit<Consultorio, "id">) => void; // edit: only numero, ubicacion, centroMedico
  onDeleteConsultorio: (id: string) => void;
  currentFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function ConsultoriosManager({
  selectedCenter,
  consultorios,
  onAddConsultorio,
  onEditConsultorio,
  onDeleteConsultorio,
  currentFilter,
  onFilterChange,
}: ConsultoriosManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConsultorio, setEditingConsultorio] = useState<Consultorio | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    numero: "",
    ubicacion: "",
    centroMedico: selectedCenter,
  });
  const [idValue, setIdValue] = useState("");

  const filteredConsultorios = consultorios.filter((c) =>
    (c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenDialog = (consultorio?: Consultorio) => {
    if (consultorio) {
      setEditingConsultorio(consultorio);
      setIdValue(consultorio.id);
      setFormData({
        numero: consultorio.numero,
        ubicacion: consultorio.ubicacion,
        centroMedico: consultorio.centroMedico || selectedCenter,
      });
    } else {
      setEditingConsultorio(null);
      setFormData({
        numero: "",
        ubicacion: "",
        centroMedico: selectedCenter,
      });
      setIdValue("");
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingConsultorio(null);
  };

  const handleSubmit = () => {
    const consultorioData = { ...formData, centroMedico: formData.centroMedico || selectedCenter } as any;
    if (editingConsultorio) {
      onEditConsultorio(editingConsultorio.id, { numero: consultorioData.numero, ubicacion: consultorioData.ubicacion, centroMedico: consultorioData.centroMedico });
    } else {
      // create expects an id provided (or empty string to let backend decide)
      const payload: Consultorio = { id: idValue?.toString() || '', numero: consultorioData.numero, ubicacion: consultorioData.ubicacion, centroMedico: consultorioData.centroMedico };
      onAddConsultorio(payload);
    }
    handleCloseDialog();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800">
              Gestión de Consultorios - {selectedCenter}
            </CardTitle>
            <Button
              onClick={() => handleOpenDialog()}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="size-4 mr-2" />
              Nuevo Consultorio
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
              <Input
                placeholder="Buscar por número o piso..."
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
                    <TableHead>Número</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Centro Médico</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConsultorios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No hay consultorios registrados en {selectedCenter}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredConsultorios.map((consultorio) => (
                    <TableRow key={consultorio.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{consultorio.id}</TableCell>
                      <TableCell className="font-medium">{consultorio.numero}</TableCell>
                      <TableCell>{consultorio.ubicacion}</TableCell>
                      <TableCell>{consultorio.centroMedico}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(consultorio)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onDeleteConsultorio(consultorio.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingConsultorio ? "Editar Consultorio" : "Nuevo Consultorio"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="id_consultorio">ID Consultorio</Label>
              <Input id="id_consultorio" value={idValue} onChange={(e) => setIdValue(e.target.value)} placeholder="Dejar vacío para autogenerar" readOnly={!!editingConsultorio} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero">Número de Consultorio</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="Ej: C-101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                value={formData.ubicacion}
                onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                placeholder="Ej: Ala Norte, Pasillo 3"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="centroMedico">Centro Médico</Label>
              <select id="centroMedico" value={formData.centroMedico} onChange={(e) => setFormData({ ...formData, centroMedico: e.target.value })} className="border rounded px-3 py-2 text-sm">
                <option value={selectedCenter}>{selectedCenter}</option>
                <option value={"NORTE"}>Norte</option>
                <option value={"CENTRO"}>Centro</option>
                <option value={"SUR"}>Sur</option>
              </select>
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
              {editingConsultorio ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
