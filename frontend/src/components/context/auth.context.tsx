/* eslint-disable react-refresh/only-export-components */

import { createContext, useState } from "react";
import type { ReactNode } from "react";

// Định nghĩa kiểu user
interface User {
  email: string;
  name: string;
}

// Kiểu cho auth state
interface AuthState {
  isAuthenticated: boolean;
  user: User;
}

// Kiểu cho context
interface AuthContextType extends AuthState {
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
  appLoading: boolean;
  setAppLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// Giá trị mặc định (placeholder)
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: { email: "", name: "" },
  setAuth: () => {},
  appLoading: true,
  setAppLoading: () => {},
});

// Props cho AuthWrapper
interface AuthWrapperProps {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    user: { email: "", name: "" },
  });

  const [appLoading, setAppLoading] = useState(true);

  return (
    <AuthContext.Provider
      value={{ ...auth, setAuth, appLoading, setAppLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
