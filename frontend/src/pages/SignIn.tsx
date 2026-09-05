import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { TextField } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/client";

export default function SignIn() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = (location.state as { notice?: string } | null)?.notice;
  const from = (location.state as { from?: string } | null)?.from ?? "/app";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't sign in.");
      setBusy(false);
    }
  };

  const onDemoLogin = async () => {
    setError(null);
    setDemoBusy(true);
    try {
      await demoLogin();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't access demo account.");
      setDemoBusy(false);
    }
  };

  return (
    <AuthLayout
      title={
        <>
          Welcome
          <br />
          <em>back.</em>
        </>
      }
      subtitle="Sign in to reach your inventory, customers and orders."
    >
      {notice && (
        <p
          role="status"
          className="mb-6 rounded-md border border-ok/25 bg-ok-tint px-4 py-3 text-[0.85rem] text-ok"
        >
          {notice}
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@pharmacy.in"
        />
        <TextField
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />

        {error && (
          <p role="alert" className="text-[0.85rem] text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={busy} className="w-full">
          Sign in
        </Button>

        <div className="relative flex items-center gap-3 before:absolute before:inset-x-0 before:top-1/2 before:h-px before:-translate-y-1/2 before:bg-sage/20 before:content-['']">
          <span className="relative bg-white px-2 text-[0.75rem] font-semibold uppercase tracking-wide text-sage/60">
            or
          </span>
        </div>

        <Button
          type="button"
          size="lg"
          loading={demoBusy}
          variant="secondary"
          className="w-full"
          onClick={onDemoLogin}
        >
          Try the demo
        </Button>
      </form>

      <p className="mt-8 u-meta">
        No account yet?{" "}
        <Link to="/register" className="text-sage underline underline-offset-4">
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}
