import { useState, useEffect, useCallback } from "react";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

interface User {
  userId: number;
  username: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Carrega token do localStorage ao montar
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setAuthState({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (e) {
        // Se houver erro ao parsear, limpa o storage
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setAuthState({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = "Erro ao fazer login";
        try {
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          }
        } catch (e) {
          errorMessage = responseText || `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      if (!responseText) {
        throw new Error("Resposta vazia do servidor");
      }

      const data = JSON.parse(responseText);

      if (data.success && data.token) {
        const user = {
          userId: data.userId,
          username: data.username,
        };

        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));

        setAuthState({
          token: data.token,
          user,
          isAuthenticated: true,
          isLoading: false,
        });

        return { success: true };
      } else {
        throw new Error(data.message || "Erro ao fazer login");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const responseText = await response.text();
      
      if (!response.ok) {
        let errorMessage = "Erro ao criar conta";
        try {
          if (responseText) {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          }
        } catch (e) {
          errorMessage = responseText || `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      if (!responseText) {
        throw new Error("Resposta vazia do servidor");
      }

      const data = JSON.parse(responseText);

      if (data.success) {
        return { success: true };
      } else {
        throw new Error(data.message || "Erro ao criar conta");
      }
    } catch (error) {
      console.error("Erro no registro:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuthState({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const getAuthHeaders = useCallback(() => {
    const token = authState.token || localStorage.getItem(TOKEN_KEY);
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
    return {
      "Content-Type": "application/json",
    };
  }, [authState.token]);

  return {
    ...authState,
    login,
    register,
    logout,
    getAuthHeaders,
  };
}

