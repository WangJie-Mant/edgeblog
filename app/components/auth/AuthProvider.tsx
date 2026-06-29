"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
const TOKEN_KEY = "token";
const USER_KEY = "user";
const USER_SNAPSHOT_KEY = "user_snapshot";

export type AuthUser = {
  id: string;
  email?: string;
  nickname: string;
  avatar_data?: string | null;
  role?: string;
};

export type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(token: string): Promise<AuthUser> {
  const resp = await fetch(`/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    throw new Error(`auth me failed: ${resp.status}`);
  }
  return resp.json();
}

type AuthProviderProps = {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
  initialToken?: string | null;
};

function setTokenCookie(tokenValue: string | null) {
  if (typeof window === "undefined") return;
  if (!tokenValue) {
    document.cookie = `${TOKEN_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
    return;
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${TOKEN_KEY}=${tokenValue}; Path=/; Max-Age=2592000; SameSite=Lax${secure}`;
}

type UserSnapshot = {
  id: string;
  nickname: string;
  role?: string;
  avatar_data?: string | null;
};

function buildSnapshot(user: AuthUser): UserSnapshot {
  const avatar = user.avatar_data || null;
  const safeAvatar =
    avatar && avatar.startsWith("data:")
      ? null
      : avatar && avatar.length > 512
        ? null
        : avatar;
  return {
    id: user.id,
    nickname: user.nickname,
    role: user.role,
    avatar_data: safeAvatar,
  };
}

function sanitizeUserForStorage(user: AuthUser): AuthUser {
  const avatar = user.avatar_data || null;
  const safeAvatar =
    avatar && avatar.startsWith("data:")
      ? null
      : avatar && avatar.length > 512
        ? null
        : avatar;
  return { ...user, avatar_data: safeAvatar };
}

function minimalUserForStorage(user: AuthUser): AuthUser {
  return {
    id: user.id,
    nickname: user.nickname,
    role: user.role,
    avatar_data: null,
  };
}

function setUserStorage(user: AuthUser) {
  if (typeof window === "undefined") return;
  try {
    const safeUser = sanitizeUserForStorage(user);
    localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
  } catch {
    try {
      const minimal = minimalUserForStorage(user);
      localStorage.setItem(USER_KEY, JSON.stringify(minimal));
    } catch {
      localStorage.removeItem(USER_KEY);
    }
  }
}

function setUserSnapshotCookie(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    document.cookie = `${USER_SNAPSHOT_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
    return;
  }
  const snapshot = buildSnapshot(user);
  let encoded = encodeURIComponent(JSON.stringify(snapshot));
  if (encoded.length > 3500) {
    encoded = encodeURIComponent(
      JSON.stringify({ ...snapshot, avatar_data: null }),
    );
  }
  if (encoded.length > 3500) return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${USER_SNAPSHOT_KEY}=${encoded}; Path=/; Max-Age=2592000; SameSite=Lax${secure}`;
}

export function AuthProvider({
  children,
  initialUser = null,
  initialToken = null,
}: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(initialToken);
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser && !initialToken);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    setTokenCookie(null);
    setUserSnapshotCookie(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const me = await fetchMe(token);
      setUser(me);
      setUserStorage(me);
      setUserSnapshotCookie(me);
    } catch (e) {
      console.error(e);
      logout();
    }
  }, [token, logout]);

  const login = useCallback(
    async (newToken: string) => {
      setToken(newToken);
      if (typeof window !== "undefined") {
        localStorage.setItem(TOKEN_KEY, newToken);
      }
      setTokenCookie(newToken);
      try {
        const me = await fetchMe(newToken);
        setUser(me);
        setUserStorage(me);
        setUserSnapshotCookie(me);
      } catch (e) {
        console.error(e);
        logout();
      }
    },
    [logout],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (token) {
      setLoading(false);
      fetchMe(token)
        .then((me) => {
          setUser(me);
          setUserStorage(me);
          setUserSnapshotCookie(me);
        })
        .catch((e) => {
          console.error(e);
          logout();
        });
      return;
    }
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    setToken(stored);
    const cachedUser = localStorage.getItem(USER_KEY);
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser) as AuthUser);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    fetchMe(stored)
      .then((me) => setUser(me))
      .catch((e) => {
        console.error(e);
        logout();
      })
      .finally(() => setLoading(false));
  }, [logout, token]);

  const value = useMemo(
    () => ({ user, token, loading, login, logout, refresh }),
    [user, token, loading, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
