import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";

interface Centro {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  sede: string;
}

interface Props {
  centros: Centro[];
}

export function CentrosMedicosManager({ centros = [] }: Props) {
  const [search, setSearch] = useState("");
  const filtered = centros.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-800">Centros Médicos</CardTitle>
            <Button onClick={() => {}}>Nuevo Centro</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Sede</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{c.id}</TableCell>
                    <TableCell>{c.nombre}</TableCell>
                    <TableCell>{c.direccion}</TableCell>
                    <TableCell>{c.telefono}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>{c.sede}</TableCell>
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

export default CentrosMedicosManager;
