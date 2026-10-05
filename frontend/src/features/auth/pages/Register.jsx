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
      <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-[#31b8c6]/15 flex items-center justify-center mb-6">
              <i className="ri-mail-send-line text-3xl text-[#31b8c6]" />
            </div>
            <h1 className="text-3xl font-bold text-[#31b8c6]">Check your inbox</h1>
            <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
              We sent a verification link to{" "}
              <span className="font-medium text-zinc-100">{email}</span>.
              Open it to activate your account — then log in.
            </p>
            <p className="mt-4 text-xs text-zinc-500">
              The link expires in 1 hour. If it doesn&apos;t arrive, you can
              request a new one from the login page.
            </p>
            <Link
              to="/login"
              className="mt-8 inline-block w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4]"
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
      <section className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-[#31b8c6]/40 bg-zinc-900/70 p-8 shadow-2xl shadow-black/50 backdrop-blur">
            <h1 className="text-3xl font-bold text-[#31b8c6]">
              Create Account
            </h1>

            <p className="mt-2 text-sm text-zinc-300">
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
                  className="mb-2 block text-sm font-medium text-zinc-200"
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
                  placeholder="Choose you username"
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-zinc-200"
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
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block  text-sm font-medium text-zinc-200"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-zinc-100 outline-none ring-0 transition focus:border-[#31b8c6] focus:shadow-[0_0_0_3px_rgba(49,184,198,0.25)]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-[#31b8c6] px-4 py-3 font-semibold text-zinc-950 transition hover:bg-[#45c7d4] focus:outline-none focus:shadow-[0_0_0_3px_rgba(49,184,198,0.35)] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-zinc-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[#31b8c6] transition hover:text-[#45c7d4]"
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
