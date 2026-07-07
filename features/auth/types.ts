export type AuthActionState = {
  ok: boolean;
  message?: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type PasswordResetRequest = {
  email: string;
};
