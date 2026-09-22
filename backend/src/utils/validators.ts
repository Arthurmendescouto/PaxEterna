// Aceita CPF no formato 000.000.000-00 (conforme mensagem de erro do RF001)
export function isValidCpfFormat(cpf: string): boolean {
  return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
}

// Validação dos dígitos verificadores do CPF
export function isValidCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const calcDigit = (base: string, factor: number) => {
    let total = 0;
    for (const char of base) {
      total += parseInt(char, 10) * factor--;
    }
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  const d1 = calcDigit(digits.substring(0, 9), 10);
  const d2 = calcDigit(digits.substring(0, 10), 11);

  return d1 === parseInt(digits[9]) && d2 === parseInt(digits[10]);
}

export function isValidDate(value: string): boolean {
  return !isNaN(Date.parse(value));
}
