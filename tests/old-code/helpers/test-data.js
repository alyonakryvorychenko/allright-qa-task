// @ts-check

function generateTestEmail() {
  const now = new Date();
  const pad = (/** @type {number} */ n) => String(n).padStart(2, '0');
  const timestamp =
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds());
  return `test+${timestamp}@allright.com`;
}

function generateTestPhone() {
  const prefixes = [
    '039', '067', '068', '077', '096', '097', '098',
    '050', '066', '075', '095', '099',
    '063', '073', '093',
  ];

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const restDigits = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');

  return prefix + restDigits;
}

module.exports = { generateTestEmail, generateTestPhone };
