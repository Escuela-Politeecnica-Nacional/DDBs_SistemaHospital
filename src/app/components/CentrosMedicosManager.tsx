import { useState } from "react";
import type { Centro } from "@/app/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";

interface Props {
  centros: Centro[];
}

export function CentrosMedicosManager({ centros = [] }: Props) {
  const [search, setSearch] = useState("");
  console.log('CentrosMedicosManager centros:', centros);
  // Si no hay campo nombre (por ejemplo, para USUARIO), mostrar todos los centros sin filtrar
  const filtered = centros.length > 0 && centros[0].nombre
    ? centros.filter((c) => c.nombre.toLowerCase().includes(search.toLowerCase()))
    : centros;

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
                  <TableRow key={c.id_centro_medico ?? c.id ?? c.id_centro} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{c.id_centro_medico ?? c.id ?? c.id_centro ?? '—'}</TableCell>
                    <TableCell>{c.nombre ?? c.nombre_centro ?? '—'}</TableCell>
                    <TableCell>{c.direccion ?? '—'}</TableCell>
                    <TableCell>{c.telefono ?? '—'}</TableCell>
                    <TableCell>{c.email ?? '—'}</TableCell>
                    <TableCell>{c.sede ?? '—'}</TableCell>
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
