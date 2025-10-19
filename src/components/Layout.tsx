import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Calendar, BarChart3, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Clientes", path: "/clients" },
  { icon: Calendar, label: "Renovaciones", path: "/renewals" },
  { icon: BarChart3, label: "Reportes", path: "/reports" },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();
        
        if (profile?.full_name) {
          setUserName(profile.full_name);
        }
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error al cerrar sesión");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-6">
          <h1 className="text-xl font-bold text-primary">Sistema de Gestión</h1>
        </div>
        
        <nav className="space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 border-t p-4">
          {userName && (
            <p className="mb-2 text-sm text-muted-foreground">
              Bienvenido, {userName}
            </p>
          )}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start"
          >
            <LogOut className="mr-3 h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      <main className="flex-1">
        <div className="border-b bg-card">
          <div className="flex h-16 items-center px-6">
            <h2 className="text-lg font-semibold">
              {navItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>
        </div>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};
