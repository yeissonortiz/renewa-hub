import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthGuard } from "./components/AuthGuard";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Clients from "./pages/Clients";
import Renewals from "./pages/Renewals";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <Layout>
                  <Dashboard />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/clients"
            element={
              <AuthGuard>
                <Layout>
                  <Clients />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/renewals"
            element={
              <AuthGuard>
                <Layout>
                  <Renewals />
                </Layout>
              </AuthGuard>
            }
          />
          <Route
            path="/reports"
            element={
              <AuthGuard>
                <Layout>
                  <Reports />
                </Layout>
              </AuthGuard>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
