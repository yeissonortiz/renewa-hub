import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CalendarClock } from "lucide-react";

interface PolicyWithClient {
  id: string;
  policy_number: string;
  policy_type: string;
  expire_date: string;
  premium_amount: number;
  client: {
    name: string;
    email: string;
  };
}

const Renewals = () => {
  const [policies, setPolicies] = useState<PolicyWithClient[]>([]);

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date();
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("policies")
      .select(`
        id,
        policy_number,
        policy_type,
        expire_date,
        premium_amount,
        clients!inner(name, email)
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expire_date", now.toISOString())
      .lte("expire_date", sixtyDaysFromNow.toISOString())
      .order("expire_date", { ascending: true });

    if (!error && data) {
      const formatted = data.map((p: any) => ({
        id: p.id,
        policy_number: p.policy_number,
        policy_type: p.policy_type,
        expire_date: p.expire_date,
        premium_amount: p.premium_amount,
        client: {
          name: p.clients.name,
          email: p.clients.email,
        },
      }));
      setPolicies(formatted);
    }
  };

  const getDaysUntilExpiration = (expireDate: string) => {
    const now = new Date();
    const expire = new Date(expireDate);
    const diffTime = expire.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (expireDate: string) => {
    const days = getDaysUntilExpiration(expireDate);
    
    if (days <= 7) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Urgente - {days}d
        </Badge>
      );
    } else if (days <= 30) {
      return (
        <Badge className="flex items-center gap-1 bg-warning text-warning-foreground">
          <CalendarClock className="h-3 w-3" />
          Próximo - {days}d
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <CalendarClock className="h-3 w-3" />
          {days} días
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Renovaciones Próximas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Pólizas que vencen en los próximos 60 días
          </p>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay renovaciones próximas en los siguientes 60 días
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Póliza</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Prima</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{policy.client.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {policy.client.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {policy.policy_number}
                    </TableCell>
                    <TableCell>{policy.policy_type}</TableCell>
                    <TableCell>
                      {new Date(policy.expire_date).toLocaleDateString("es-ES")}
                    </TableCell>
                    <TableCell>${policy.premium_amount.toLocaleString()}</TableCell>
                    <TableCell>{getStatusBadge(policy.expire_date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Renewals;
