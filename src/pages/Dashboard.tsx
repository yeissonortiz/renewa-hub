import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, TrendingUp, FileText } from "lucide-react";
import { CreatePolicyDialog } from "@/components/CreatePolicyDialog";

interface Stats {
  totalClients: number;
  activePolicie: number;
  expiringPolicies: number;
  totalRevenue: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalClients: 0,
    activePolicie: 0,
    expiringPolicies: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: clients } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", user.id);

      const { data: policies } = await supabase
        .from("policies")
        .select("premium_amount, expire_date, status")
        .eq("user_id", user.id);

      const now = new Date();
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expiringCount = policies?.filter((p) => {
        const expireDate = new Date(p.expire_date);
        return expireDate >= now && expireDate <= thirtyDaysFromNow && p.status === "active";
      }).length || 0;

      const revenue = policies?.reduce((sum, p) => sum + Number(p.premium_amount), 0) || 0;

      setStats({
        totalClients: clients?.length || 0,
        activePolicie: policies?.filter((p) => p.status === "active").length || 0,
        expiringPolicies: expiringCount,
        totalRevenue: revenue,
      });
    };

    fetchStats();
  }, []);

  const modules = [
    {
      title: "Clientes",
      description: "Gestiona tu cartera de clientes",
      icon: Users,
      path: "/clients",
      stat: stats.totalClients,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Renovaciones",
      description: "Próximas fechas de vencimiento",
      icon: Calendar,
      path: "/renewals",
      stat: stats.expiringPolicies,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      title: "Cartera Activa",
      description: "Pólizas activas en el sistema",
      icon: TrendingUp,
      path: "/clients",
      stat: stats.activePolicie,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Reportes",
      description: "Análisis y métricas clave",
      icon: FileText,
      path: "/reports",
      stat: `$${stats.totalRevenue.toLocaleString()}`,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Bienvenido a tu sistema de gestión de pólizas
          </p>
        </div>
        <CreatePolicyDialog />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.path} to={module.path}>
              <Card className="transition-all hover:shadow-lg hover:scale-105 cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {module.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${module.bgColor}`}>
                    <Icon className={`h-5 w-5 ${module.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{module.stat}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {module.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
