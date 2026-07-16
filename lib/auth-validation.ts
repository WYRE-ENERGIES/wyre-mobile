/** Auth form validation helpers — aligned with admin_frontend_v2 login/reset rules. */

export function validateUsername(value: string): string | undefined {
  const username = value.trim();
  if (!username) return 'Please enter your username.';
  if (username.length < 3) return 'Username must be at least 3 characters.';
  if (username.length > 40) return 'Username cannot be more than 40 characters.';
  return undefined;
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Please enter your password.';
  if (value.length < 4) return 'Password must be at least 4 characters.';
  if (value.length > 60) return 'Password cannot be more than 60 characters.';
  return undefined;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'Please enter your email address.';
  if (!EMAIL_REGEX.test(email)) return 'Enter a valid email address.';
  if (email.length > 100) return 'Email cannot be more than 100 characters.';
  return undefined;
}
