type ValidCredentials = {
  ok: true;
  email: string;
  password: string;
};

type InvalidCredentials = {
  ok: false;
  message: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(
  email: string,
  password: string,
): ValidCredentials | InvalidCredentials {
  const normalized = email.trim().toLowerCase();

  if (!EMAIL.test(normalized)) {
    return { ok: false, message: "Informe um e-mail válido." };
  }

  if (password.length < 6) {
    return { ok: false, message: "A senha precisa ter ao menos 6 caracteres." };
  }

  return { ok: true, email: normalized, password };
}
