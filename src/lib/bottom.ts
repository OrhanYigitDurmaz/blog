const HOME_ROW = "asdfghjkl";
const NON_HOME_ROW = "qwertyuiopzxcvbnm";

export function encode(input: string): string {
  if (!input) return "sk";

  const bytes = new TextEncoder().encode(input);

  let n = 0n;
  for (const byte of bytes) {
    n = (n << 8n) | BigInt(byte);
  }

  if (n === 0n) return "ska";

  const digits: number[] = [];
  let temp = n;
  while (temp > 0n) {
    digits.push(Number(temp % 9n));
    temp /= 9n;
  }
  digits.reverse();

  const raw = digits.map((d) => HOME_ROW[d]).join("");

  let result = "";
  for (let i = 0; i < raw.length; i++) {
    if (result.length > 0 && raw[i] === result[result.length - 1]) {
      result += NON_HOME_ROW[i % NON_HOME_ROW.length];
    }
    result += raw[i];
  }

  return "sk" + result;
}

export function decode(input: string): string {
  if (!input.startsWith("sk")) return "";

  let filtered = "";
  for (const ch of input.slice(2)) {
    if (HOME_ROW.includes(ch)) {
      filtered += ch;
    }
  }

  if (filtered.length === 0) return "";

  let n = 0n;
  for (const ch of filtered) {
    n = n * 9n + BigInt(HOME_ROW.indexOf(ch));
  }

  const bytes: number[] = [];
  let temp = n;
  while (temp > 0n) {
    bytes.push(Number(temp & 0xffn));
    temp >>= 8n;
  }
  bytes.reverse();

  return new TextDecoder().decode(new Uint8Array(bytes));
}
