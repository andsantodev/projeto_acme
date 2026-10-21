"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { loginAction, type LoginState } from "./actions";

const INITIAL_STATE: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    INITIAL_STATE,
  );

  return (
    <form action={formAction} className="mt-8 grid gap-4" noValidate>
      <Field id="email" label="E-mail">
        <Input
          autoComplete="username"
          name="email"
          placeholder="nome@acme.demo"
          type="email"
        />
      </Field>

      <Field id="password" label="Senha">
        <Input
          autoComplete="current-password"
          name="password"
          type="password"
        />
      </Field>

      {state.error ? (
        <p className="text-sm text-negative" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button className="w-full" loading={pending} type="submit" variant="primary">
        Entrar
      </Button>
    </form>
  );
}
