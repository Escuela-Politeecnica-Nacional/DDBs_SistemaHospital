import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { ArrowLeft, FileText, Calendar, User, Stethoscope } from "lucide-react";

interface Historial {
  id: string;
  citaId: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  fecha: string;
}

interface Cita {
  id: string;
  pacienteId: string;
  doctorId: string;
  consultorioId: string;
  fecha: string;
  hora: string;
  motivo: string;
  estado: string;
}

interface Paciente {
  id: string;
  nombre: string;
  apellido: string;
  cedula: string;
}

interface Doctor {
  id: string;
  nombre: string;
  apellido: string;
}

interface Consultorio {
  id: string;
  numero: string;
}

interface HistorialMedicoProps {
  citaId: string;
  citas: Cita[];
  historiales: Historial[];
  pacientes: Paciente[];
  doctores: Doctor[];
  consultorios: Consultorio[];
  onBack: () => void;
}

export function HistorialMedico({
  citaId,
  citas,
  historiales,
  pacientes,
  doctores,
  consultorios,
  onBack,
}: HistorialMedicoProps) {
  const cita = citas.find((c) => c.id === citaId);
  const historial = historiales.find((h) => h.citaId === citaId);
  const paciente = cita ? pacientes.find((p) => p.id === cita.pacienteId) : null;
  const doctor = cita ? doctores.find((d) => d.id === cita.doctorId) : null;
  const consultorio = cita ? consultorios.find((c) => c.id === cita.consultorioId) : null;

  if (!cita) {
    return (
      <div className="space-y-6">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="size-4 mr-2" />
          Volver
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Cita no encontrada
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="size-4 mr-2" />
          Volver a Citas
        </Button>
        <Badge
          variant="secondary"
          className="bg-purple-100 text-purple-700 px-4 py-2"
        >
          <FileText className="size-4 mr-2" />
          Historial Médico
        </Badge>
      </div>

      {/* Información de la Cita */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Información de la Cita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Paciente</p>
                <p className="font-medium text-gray-800">
                  {paciente ? `${paciente.nombre} ${paciente.apellido}` : "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  Cédula: {paciente?.cedula || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Stethoscope className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Doctor</p>
                <p className="font-medium text-gray-800">
                  {doctor ? `Dr. ${doctor.nombre} ${doctor.apellido}` : "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="size-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha y Hora</p>
                <p className="font-medium text-gray-800">
                  {cita.fecha} - {cita.hora}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Consultorio</p>
                <p className="font-medium text-gray-800">
                  {consultorio?.numero || "N/A"}
                </p>
              </div>
            </div>

            <div className="col-span-2">
              <p className="text-sm text-gray-500">Motivo de la Cita</p>
              <p className="font-medium text-gray-800">{cita.motivo}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial Médico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">
            Historial Médico de la Cita
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historial ? (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Diagnóstico</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{historial.diagnostico}</p>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-semibold text-gray-700 mb-2">Tratamiento</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{historial.tratamiento}</p>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-semibold text-gray-700 mb-2">Observaciones</h4>
                  <p className="text-gray-600 whitespace-pre-wrap">{historial.observaciones}</p>
                </div>

                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500">
                    Registrado el: {historial.fecha}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="size-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No hay historial médico registrado para esta cita
              </p>
              <p className="text-sm text-gray-400 mt-2">
                El historial se registrará después de la consulta
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
