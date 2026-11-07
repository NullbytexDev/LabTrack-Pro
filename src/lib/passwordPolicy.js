export const MIN_PASSWORD_LENGTH = 12;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

/** Returns the individual password rules and whether all of them pass. */
export function checkPassword(value) {
  const password = value || '';
  const rules = [
    {
      key: 'length',
      label: `At least ${MIN_PASSWORD_LENGTH} characters`,
      ok: password.length >= MIN_PASSWORD_LENGTH,
    },
    { key: 'letter', label: 'Contains a letter', ok: /[A-Za-z]/.test(password) },
    { key: 'number', label: 'Contains a number', ok: /[0-9]/.test(password) },
    { key: 'symbol', label: 'Contains a symbol (! @ # $ …)', ok: /[^A-Za-z0-9]/.test(password) },
  ];

  return { rules, ok: rules.every((rule) => rule.ok) };
}

export function passwordProblem(value) {
  const { rules } = checkPassword(value);
  const missing = rules.filter((rule) => !rule.ok).map((rule) => rule.label.toLowerCase());
  if (!missing.length) return '';
  return `Your password needs: ${missing.join(', ')}.`;
}

/** Live email check — empty input is not yet an error. */
export function checkEmail(value) {
  const email = (value || '').trim();
  if (!email) return { state: 'empty', message: '' };
  if (!EMAIL_PATTERN.test(email)) {
    return {
      state: 'invalid',
      message: 'Enter a valid email address — it needs an @ and a domain, like you@fci.edu.',
    };
  }
  return { state: 'valid', message: '' };
}