export const somenteDigitos = (valor: string) => valor.replace(/\D/g, '')

// 12345678901 -> 123.456.789-01 (também serve como máscara ao digitar)
export function formatarCpf(valor: string) {
  const d = somenteDigitos(valor).slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

// RG: aceita apenas números, ponto e traço, e um "X" opcional no final
// (alguns estados, como SP, usam X como dígito verificador).
export function formatarRg(valor: string) {
  const limpo = valor.toUpperCase().replace(/[^\d.\-X]/g, '')
  const semX = limpo.replace(/X/g, '').replace(/^[.-]+/, '')
  const terminaComX = limpo.endsWith('X') && /\d/.test(semX)
  return (semX + (terminaComX ? 'X' : '')).slice(0, 20)
}

// RG válido: de 5 a 14 dígitos (o X final conta como dígito).
export function rgValido(rg: string) {
  const digitos = rg.replace(/[.-]/g, '')
  return /^\d[\d.-]*[\dX]$/i.test(rg) && /^\d{4,13}[\dX]$/i.test(digitos)
}

// 77981234567 -> (77) 98123-4567 | 7732345678 -> (77) 3234-5678
export function formatarTelefone(valor: string) {
  const d = somenteDigitos(valor).slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  }
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

// 45000000 -> 45000-000
export function formatarCep(valor: string) {
  const d = somenteDigitos(valor).slice(0, 8)
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d
}

// 1990-02-14 -> 14/02/1990
export function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return ano && mes && dia ? `${dia}/${mes}/${ano}` : data
}
