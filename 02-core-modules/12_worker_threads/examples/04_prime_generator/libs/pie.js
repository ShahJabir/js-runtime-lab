export const pie = () => {
  const S = 10n ** 3730n;
  const a = (x) => {
    const x2 = BigInt(x) * BigInt(x);
    let t = S / BigInt(x),
      s = t,
      n = 1n;
    while (t > 0n) {
      t = t / x2;
      n += 2n;
      (n / 2n) % 2n === 0n ? (s += t / n) : (s -= t / n);
    }
    return s;
  };
  return 4n * (4n * a(5) - a(239));
};
