import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { register, login, getMe, logout as logoutApi } from "../services/auth.api";
import { setError, setLoading, setUser } from "../slice/auth.slice";

export const useAuth = () => {
  const dispatch = useDispatch();

  async function handleRegister({ email, username, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await register({ email, username, password });

      // The backend registers WITHOUT setting a session cookie (verified:false)
      // — the user must confirm their email first. Do NOT call setUser here:
      // treating the 201 as a login lands the user on DashBoard with no cookie,
      // and the next authed request 401s them straight back out.
      return { success: true, verified: data.verified !== false, user: data.user ?? null };
    } catch (error) {
      dispatch(
        setError(error.response?.data?.message || "Registration failed"),
      );
      return { success: false, verified: false, user: null };
    } finally {
      dispatch(setLoading(false));
    }
  }

  async function handleLogin({ email, password }) {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const data = await login({ email, password });
      dispatch(setUser(data.user));
      return true;
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Login failed"));
      return false;
    } finally {
      dispatch(setLoading(false));
    }
  }

  // Memoized: App.jsx depends on it for its getMe-on-mount effect —
  // useCallback keeps the identity stable so the effect doesn't re-run
  // on every render.
  const handleGetMe = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const data = await getMe()
      dispatch(setUser(data.user));
    } catch {
      dispatch(setUser(null));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  async function handleLogout() {
    try {
      dispatch(setLoading(true));
      await logoutApi();
      dispatch(setUser(null));
    } catch (error) {
      dispatch(setError(error.response?.data?.message || "Logout failed"));
    } finally {
      dispatch(setLoading(false));
    }
  }

  return {
    handleRegister,
    handleLogin,
    handleGetMe,
    handleLogout,
  };
};
