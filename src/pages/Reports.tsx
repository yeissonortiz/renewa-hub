import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, FileCheck, DollarSign } from "lucide-react";
import { CreatePolicyDialog } from "@/components/CreatePolicyDialog";

interface ReportData {
  totalClients: number;
  activePolicies: number;
  totalRevenue: number;
  renewedPolicies: number;
  policiesByType: { name: string; value: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

const COLORS = ["#0891b2", "#14b8a6", "#06b6d4", "#22d3ee"];

const Reports = () => {
  const [data, setData] = useState<ReportData>({
    totalClients: 0,
    activePolicies: 0,
    totalRevenue: 0,
    renewedPolicies: 0,
    policiesByType: [],
    revenueByMonth: [],
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: clients } = await supabase
      .from("clients")
      .select("id")
      .eq("user_id", user.id);

    const { data: policies } = await supabase
      .from("policies")
      .select("*")
      .eq("user_id", user.id);

    if (!policies) return;

    const typeCount = policies.reduce((acc: any, policy) => {
      acc[policy.policy_type] = (acc[policy.policy_type] || 0) + 1;
      return acc;
    }, {});

    const policiesByType = Object.entries(typeCount).map(([name, value]) => ({
      name,
      value: value as number,
    }));

    const monthlyRevenue = policies.reduce((acc: any, policy) => {
      const month = new Date(policy.start_date).toLocaleString("es-ES", { month: "short" });
      if (!acc[month]) acc[month] = 0;
      acc[month] += Number(policy.premium_amount);
      return acc;
    }, {});

    const revenueByMonth = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
      month,
      revenue: revenue as number,
    }));

    const totalRevenue = policies.reduce((sum, p) => sum + Number(p.premium_amount), 0);
    const activePolicies = policies.filter(p => p.status === "active").length;

    setData({
      totalClients: clients?.length || 0,
      activePolicies,
      totalRevenue,
      renewedPolicies: activePolicies,
      policiesByType,
      revenueByMonth,
    });
  };

  const stats = [
    {
      title: "Total Clientes",
      value: data.totalClients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pólizas Activas",
      value: data.activePolicies,
      icon: FileCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Ingresos Totales",
      value: `$${data.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Renovaciones",
      value: data.renewedPolicies,
      icon: TrendingUp,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        <CreatePolicyDialog onSuccess={fetchReportData} />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pólizas por Tipo</CardTitle>
            <CardDescription>Distribución de pólizas activas</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.policiesByType}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.policiesByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ingresos por Mes</CardTitle>
            <CardDescription>Primas totales por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
