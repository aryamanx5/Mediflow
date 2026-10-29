import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { TextField } from "../components/ui/Field";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../services/client";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (key: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [key]: v }));

  // The backend requires at least 8 characters; catching it here means a
  // clear message instead of a raw Mongoose validation string.
  const passwordTooShort = form.password.length > 0 && form.password.length < 8;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordTooShort) return;
    setError(null);
    setBusy(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      // Registration returns no token, so the user signs in next.
      navigate("/signin", {
        replace: true,
        state: { notice: "Account created. Sign in to continue." },
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't create the account.");
      setBusy(false);
    }
  };

  return (
    <AuthLayout
      title={
        <>
          Start with
          <br />
          <em>one</em> record.
        </>
      }
      subtitle="Create an account for your pharmacy's operations."
    >
      <form onSubmit={onSubmit} className="space-y-6" noValidate>
        <TextField
          label="Full name"
          required
          autoComplete="name"
          value={form.name}
          onChange={(e) => set("name")(e.target.value)}
        />
        <TextField
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => set("email")(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          hint="At least 8 characters."
          error={passwordTooShort ? "Passwords must be at least 8 characters." : undefined}
          value={form.password}
          onChange={(e) => set("password")(e.target.value)}
        />

        {error && (
          <p role="alert" className="text-[0.85rem] text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={busy} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-8 u-meta">
        Already have an account?{" "}
        <Link to="/signin" className="text-sage underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
