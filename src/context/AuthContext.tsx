import React, { createContext, useContext, useEffect, useState } from "react";
import auth from "@react-native-firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = { uid: string; email?: string | null; name?: string | null; photoURL?: string | null };
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth().onAuthStateChanged(async (fbUser) => {
      if (fbUser) {
        const u: User = {
          uid: fbUser.uid,
          email: fbUser.email,
          name: fbUser.displayName,
          photoURL: fbUser.photoURL,
        };
        setUser(u);
        await AsyncStorage.setItem("@auth_user", JSON.stringify(u));
      } else {
        setUser(null);
        await AsyncStorage.removeItem("@auth_user");
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signOut = async () => {
    try {
      await auth().signOut();
      setUser(null);
      await AsyncStorage.removeItem("@auth_user");
    } catch {}
  };

  return <AuthContext.Provider value={{ user, loading, signOut }}>{children}</AuthContext.Provider>;
};
