import React, { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const user = useSelector((state) => state.auth.user);
  const loading = useSelector((state) => state.auth.loading);
  const error = useSelector((state) => state.auth.error);

  const { handleLogin } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      email,
      password,
    };

    const success = await handleLogin(payload);
    if (success) navigate("/");
  };

  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <section className="min-h-screen bg-app px-4 py-10 text-text-primary sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
          <div className="w-full max-w-md rounded-lg border border-border-default bg-surface-primary p-6 shadow-2xl shadow-black/30 sm:p-8">
            <h1 className="text-3xl font-bold text-text-primary">Welcome Back</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Sign in with your email and password.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <p role="alert" className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-text-secondary"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-border-default bg-app px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-text-secondary focus:ring-2 focus:ring-text-secondary/30"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-text-secondary"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                  className="w-full rounded-lg border border-border-default bg-app px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-text-secondary focus:ring-2 focus:ring-text-secondary/30"
                />
              </div>

              <button
                type="submit"
                className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-semibold text-primary-fg transition hover:bg-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary active:scale-[0.98]"
              >
                Login
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-text-secondary">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-text-primary underline underline-offset-4 transition hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
              >
                Register
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;
