import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "motion/react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (formData.username.length < 3) {
      setError("O usuário deve ter no mínimo 3 caracteres");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(
        formData.username,
        formData.email,
        formData.password
      );

      if (result.success) {
        // Redireciona para a página de login após registro
        navigate("/login", { state: { message: "Conta criada com sucesso! Faça login para continuar." } });
      } else {
        setError(result.error || "Erro ao criar conta");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black relative">
      {/* Header */}
      <header className="w-full border-b border-gray-200 relative z-10 bg-white">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/">
              <div className="text-xl font-semibold">
                View:<span className="text-blue-500">in</span>
              </div>
            </Link>

            {/* User Actions */}
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="outline" className="rounded-full border-black text-black hover:bg-gray-50">
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-20 relative z-10">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Crie sua conta
              </h1>
              <p className="text-lg text-gray-700">
                Comece sua jornada conosco
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  minLength={3}
                  placeholder="Digite seu usuário (mín. 3 caracteres)"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Digite seu email"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  placeholder="Digite sua senha (mín. 6 caracteres)"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirme sua senha"
                  className="w-full"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-full bg-black text-white hover:bg-gray-900"
              >
                {isSubmitting ? "Criando conta..." : "Criar conta"}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600">
              <p>
                Já tem uma conta?{" "}
                <Link
                  to="/login"
                  className="text-blue-500 hover:text-blue-700 font-medium"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

