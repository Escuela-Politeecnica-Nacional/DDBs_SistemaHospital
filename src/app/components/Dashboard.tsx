import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Users, UserCog, Building2, Calendar, FileText, Activity } from "lucide-react";

interface DashboardProps {
  selectedCenter: string;
  stats: {
    pacientes: number;
    doctores: number;
    consultorios: number;
    citasHoy: number;
    citasSemana: number;
    historiales: number;
  };
}

export function Dashboard({ selectedCenter, stats }: DashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-gray-800">Dashboard</h2>
          <p className="text-gray-500 mt-1">Centro Médico: {selectedCenter}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg shadow-sm">
          <Activity className="size-5" />
          <span className="font-medium">Sistema Activo</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Pacientes
            </CardTitle>
            <Users className="size-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.pacientes}</div>
            <p className="text-xs text-gray-500 mt-1">
              Registrados en {selectedCenter}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Doctores Activos
            </CardTitle>
            <UserCog className="size-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.doctores}</div>
            <p className="text-xs text-gray-500 mt-1">
              Disponibles en {selectedCenter}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Consultorios
            </CardTitle>
            <Building2 className="size-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.consultorios}</div>
            <p className="text-xs text-gray-500 mt-1">
              Operativos en {selectedCenter}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-400 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Citas Hoy
            </CardTitle>
            <Calendar className="size-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.citasHoy}</div>
            <p className="text-xs text-gray-500 mt-1">
              Programadas para hoy
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-300 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Citas Esta Semana
            </CardTitle>
            <Calendar className="size-5 text-blue-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.citasSemana}</div>
            <p className="text-xs text-gray-500 mt-1">
              Próximas 7 días
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-300 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Historiales Médicos
            </CardTitle>
            <FileText className="size-5 text-green-300" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-800">{stats.historiales}</div>
            <p className="text-xs text-gray-500 mt-1">
              Registros activos
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
