import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export default function LoginModal() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await apiRequest("POST", "/api/admin/login", credentials);
      
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в админ-панель",
      });
      
      // Reload page to update auth state
      window.location.reload();
    } catch (error) {
      toast({
        title: "Ошибка входа",
        description: "Неверные учетные данные",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="relative w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="text-2xl font-bold text-primary">30</div>
            <div className="w-6 h-0.5 bg-primary audio-wave"></div>
            <div className="text-2xl font-bold text-foreground">HERTZ</div>
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">
            Админ-панель
          </CardTitle>
          <p className="text-muted-foreground">
            Введите данные для входа в систему управления
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                placeholder="admin@30hertz.ru"
                required
                data-testid="admin-email-input"
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="••••••••"
                required
                data-testid="admin-password-input"
              />
            </div>
            <div className="flex space-x-4">
              <Button 
                type="submit" 
                className="flex-1 gradient-glow"
                disabled={isLoading}
                data-testid="admin-login-button"
              >
                {isLoading ? "Вход..." : "Войти"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => setLocation("/")}
                data-testid="admin-cancel-button"
              >
                Отмена
              </Button>
            </div>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}
