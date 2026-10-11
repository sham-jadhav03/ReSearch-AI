import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useSelector } from "react-redux";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registered, setRegistered] = useState(false);

  const { handleRegister } = useAuth();
  const error = useSelector((state) => state.auth.error);
  const loading = useSelector((state) => state.auth.loading);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = { username, email, password };
    const result = await handleRegister(payload);

    // verified:false + no cookie → show the "check your inbox" screen;
    // only error-free registrations reach the dashboard silently if already verified.
    if (result?.success && result?.verified === false) {
      setRegistered(true);
      return;
    }
    if (result?.success && result?.verified) {
      navigate("/");
    }
  };

  if (registered) {
    return (
      <section className="min-h-screen bg-app px-4 py-10 text-text-primary sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
          <div className="w-full max-w-md rounded-lg border border-border-default bg-surface-primary p-6 text-center shadow-2xl shadow-black/30 sm:p-8">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg border border-border-strong bg-surface-secondary">
              <i className="ri-mail-send-line text-3xl text-text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-text-primary">Check your inbox</h1>
            <p className="mt-3 text-sm leading-relaxed text-text-secondary">
              We sent a verification link to{" "}
              <span className="font-medium text-text-primary">{email}</span>.
              Open it to activate your account — then log in.
            </p>
            <p className="mt-4 text-xs text-text-muted">
              The link expires in 1 hour. If it doesn&apos;t arrive, you can
              request a new one from the login page.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-block w-full rounded-lg bg-primary px-4 py-3 font-semibold text-primary-fg transition hover:bg-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="min-h-screen bg-app px-4 py-10 text-text-primary sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
          <div className="w-full max-w-md rounded-lg border border-border-default bg-surface-primary p-6 shadow-2xl shadow-black/30 sm:p-8">
            <h1 className="text-3xl font-bold text-text-primary">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-text-secondary">
              Register with your username, email, and password.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <p role="alert" className="rounded-lg border border-red-800 bg-red-950/50 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-text-secondary"
                >
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                  }}
                  placeholder="Choose your username"
                  required
                  className="w-full rounded-lg border border-border-default bg-app px-4 py-3 text-text-primary outline-none transition placeholder:text-text-muted focus:border-text-secondary focus:ring-2 focus:ring-text-secondary/30"
                />
              </div>
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
                  placeholder="Enter your email address"
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
                disabled={loading}
                className="w-full cursor-pointer rounded-lg bg-primary px-4 py-3 font-semibold text-primary-fg transition hover:bg-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-text-primary underline underline-offset-4 transition hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
};

export default Register;
