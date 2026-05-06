import { createContext, useContext, useState, useEffect, ReactNode } from "react";
  import { getGetMeQueryKey, useGetMe, useLogin, useLogout } from "@/lib/api";

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
  }

  interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
  }

  const AuthContext = createContext<AuthContextType | null>(null);

  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const getMeQuery = useGetMe({
      query: {
        queryKey: getGetMeQueryKey(),
        retry: false,
      },
    });

    const loginMutation = useLogin();
    const logoutMutation = useLogout();

    useEffect(() => {
      if (getMeQuery.data) {
        setUser(getMeQuery.data as User);
      } else if (getMeQuery.isError) {
        setUser(null);
      }
    }, [getMeQuery.data, getMeQuery.isError]);

    const login = async (email: string, password: string) => {
      const result = await loginMutation.mutateAsync({ data: { email, password } });
      if ((result as any).user) {
        setUser((result as any).user as User);
      } else {
        setUser(result as unknown as User);
      }
    };

    const logout = async () => {
      await logoutMutation.mutateAsync(undefined as unknown as void);
      setUser(null);
    };

    return (
      <AuthContext.Provider value={{ user, isLoading: getMeQuery.isLoading, login, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

  export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
  }
  