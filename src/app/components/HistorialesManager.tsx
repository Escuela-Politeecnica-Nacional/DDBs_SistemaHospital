import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { FileText } from "lucide-react";

interface HistorialItem {
    id: string;
    citaId: string;
    diagnostico: string;
    tratamiento: string;
    observaciones: string;
    fecha: string;
}

interface Props {
    historiales: HistorialItem[];
    onViewDetalle: (citaId: string) => void;
    currentFilter?: string;
    onFilterChange?: (filter: string) => void;
}

export function HistorialesManager({ historiales = [], onViewDetalle, currentFilter, onFilterChange }: Props) {
    const localFilter = (currentFilter || "TODOS");
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-2xl font-semibold text-gray-800">Historiales Médicos</CardTitle>
                        <div className="flex items-center gap-3">
                            <select
                                value={localFilter}
                                onChange={(e) => onFilterChange && onFilterChange(e.target.value.toLowerCase())}
                                className="border rounded px-3 py-2 text-sm"
                                aria-label="Filtro sede historiales"
                            >
                                <option value={"TODOS"}>Todos</option>
                                <option value={"NORTE"}>Norte</option>
                                <option value={"CENTRO"}>Centro</option>
                                <option value={"SUR"}>Sur</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead>ID</TableHead>
                                    <TableHead>Cita</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Diagnóstico</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {historiales.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                                            No hay historiales registrados
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    historiales.map((h) => (
                                        <TableRow key={h.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium">{h.id}</TableCell>
                                            <TableCell>{h.citaId}</TableCell>
                                            <TableCell>{h.fecha}</TableCell>
                                            <TableCell>{h.diagnostico ? h.diagnostico.substring(0, 80) : ''}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" onClick={() => onViewDetalle(h.citaId)} title="Ver detalle">
                                                    <FileText className="size-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default HistorialesManager;
