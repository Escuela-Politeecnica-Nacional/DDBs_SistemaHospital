import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Edit, Trash2, Plus } from "lucide-react";

interface Especialidad {
  id: string;
  nombre: string;
}

interface Props {
  especialidades: Especialidad[];
  onAdd?: (e: Especialidad) => void;
  onEdit?: (id: string, e: Omit<Especialidad, 'id'>) => void;
  onDelete?: (id: string) => void;
}

export function EspecialidadesManager({ especialidades = [], onAdd, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Especialidad | null>(null);
  const [name, setName] = useState("");
  const [idValue, setIdValue] = useState("");

  const filtered = especialidades.filter((e) => e.nombre.toLowerCase().includes(search.toLowerCase()));

  const openNew = () => {
    setEditing(null);
    setName("");
    setIdValue("");
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!name || name.trim() === '') return;
    const payload: Especialidad = { id: idValue?.toString() || '', nombre: name.trim() };
    onAdd && onAdd(payload);
    setIsDialogOpen(false);
    setName('');
    setIdValue('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800">Especialidades</CardTitle>
            <Button onClick={openNew}><Plus className="size-4 mr-2"/>Nueva</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((e) => (
                  <TableRow key={e.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{e.id}</TableCell>
                    <TableCell>{e.nombre}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => onDelete && onDelete(e.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50"><Trash2 className="size-4"/></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Editar Especialidad' : 'Nueva Especialidad'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="id_especialidad">ID</Label>
              <Input id="id_especialidad" value={idValue} onChange={(e) => setIdValue(e.target.value)} placeholder="Dejar vacío para autogenerar" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white">{editing ? 'Actualizar' : 'Crear'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EspecialidadesManager;
