const HOME_ROW = "asdfghjkl";
const NON_HOME_ROW = "qwertyuiopzxcvbnm";
const DIGITS = 3;

export function encode(input: string): string {
  if (!input) return "sk";

  let encoded = "";
  for (const char of input) {
    let code = char.codePointAt(0) ?? 0;
    let base9 = "";
    if (code === 0) {
      base9 = HOME_ROW[0];
    } else {
      while (code > 0) {
        base9 = HOME_ROW[code % 9] + base9;
        code = Math.floor(code / 9);
      }
    }
    base9 = base9.padStart(DIGITS, HOME_ROW[0]);
    encoded += base9;
  }

  let result = "";
  let run = 0;
  let prev = "";
  for (let i = 0; i < encoded.length; i++) {
    const ch = encoded[i];
    if (ch === prev && HOME_ROW.includes(ch)) {
      run++;
      if (run === 2) {
        result += NON_HOME_ROW[i % NON_HOME_ROW.length];
        run = 0;
      }
    } else {
      run = 0;
      prev = ch;
    }
    result += ch;
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

  let result = "";
  for (let i = 0; i < filtered.length; i += DIGITS) {
    const chunk = filtered.slice(i, i + DIGITS);
    if (chunk.length < DIGITS) break;

    let code = 0;
    for (const ch of chunk) {
      code = code * 9 + HOME_ROW.indexOf(ch);
    }
    result += String.fromCodePoint(code);
  }

  return result;
}
