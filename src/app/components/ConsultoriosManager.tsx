import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Plus, Edit, Trash2, Search } from "lucide-react";

interface Consultorio {
  id: string;
  numero: string;
  piso: string;
  disponible: boolean;
  centroMedico: string;
}

interface ConsultoriosManagerProps {
  selectedCenter: string;
  consultorios: Consultorio[];
  onAddConsultorio: (consultorio: Omit<Consultorio, "id">) => void;
  onEditConsultorio: (id: string, consultorio: Omit<Consultorio, "id">) => void;
  onDeleteConsultorio: (id: string) => void;
}

export function ConsultoriosManager({
  selectedCenter,
  consultorios,
  onAddConsultorio,
  onEditConsultorio,
  onDeleteConsultorio,
}: ConsultoriosManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConsultorio, setEditingConsultorio] = useState<Consultorio | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    numero: "",
    piso: "",
    disponible: true,
  });

  const filteredConsultorios = consultorios.filter(
    (c) =>
      c.centroMedico === selectedCenter &&
      (c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.piso.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenDialog = (consultorio?: Consultorio) => {
    if (consultorio) {
      setEditingConsultorio(consultorio);
      setFormData({
        numero: consultorio.numero,
        piso: consultorio.piso,
        disponible: consultorio.disponible,
      });
    } else {
      setEditingConsultorio(null);
      setFormData({
        numero: "",
        piso: "",
        disponible: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingConsultorio(null);
  };

  const handleSubmit = () => {
    const consultorioData = { ...formData, centroMedico: selectedCenter };
    if (editingConsultorio) {
      onEditConsultorio(editingConsultorio.id, consultorioData);
    } else {
      onAddConsultorio(consultorioData);
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
                  <TableHead>Número</TableHead>
                  <TableHead>Piso</TableHead>
                  <TableHead>Estado</TableHead>
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
                      <TableCell className="font-medium">{consultorio.numero}</TableCell>
                      <TableCell>{consultorio.piso}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            consultorio.disponible
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {consultorio.disponible ? "Disponible" : "Ocupado"}
                        </Badge>
                      </TableCell>
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
              <Label htmlFor="numero">Número de Consultorio</Label>
              <Input
                id="numero"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                placeholder="Ej: C-101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piso">Piso</Label>
              <Input
                id="piso"
                value={formData.piso}
                onChange={(e) => setFormData({ ...formData, piso: e.target.value })}
                placeholder="Ej: 1, 2, 3..."
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="disponible"
                checked={formData.disponible}
                onChange={(e) =>
                  setFormData({ ...formData, disponible: e.target.checked })
                }
                className="rounded border-gray-300"
              />
              <Label htmlFor="disponible" className="cursor-pointer">
                Consultorio disponible
              </Label>
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
