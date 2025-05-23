import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const LoginForm: React.FC = () => {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o token de acesso.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate token validation
      await new Promise((resolve) => setTimeout(resolve, 1000));
      login(token);
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Token inválido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">TE</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-green-500">
            Calendario.tech Manager
          </CardTitle>
          <CardDescription>
            Insira seu token de acesso para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Token de acesso"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                O token expira em 24 horas
              </p>
            </div>
            <Button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Acessar Sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
