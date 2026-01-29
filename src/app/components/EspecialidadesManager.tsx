import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";

interface Especialidad {
  id: string;
  nombre: string;
}

interface Props {
  especialidades: Especialidad[];
  onAdd?: (e: Omit<Especialidad, 'id'>) => void;
  onEdit?: (id: string, e: Omit<Especialidad, 'id'>) => void;
  onDelete?: (id: string) => void;
}

export function EspecialidadesManager({ especialidades = [] }: Props) {
  const [search, setSearch] = useState("");

  const filtered = especialidades.filter((e) => e.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800">Especialidades</CardTitle>
            <Button onClick={() => {}}>Nueva</Button>
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
                    <TableCell className="text-right">-</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default EspecialidadesManager;
