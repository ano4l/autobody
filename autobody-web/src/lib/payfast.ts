export type PayFastRequest = {
  ref: string;
  amount: number;
  itemName: string;
};

export function newOrderRef(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `FERR-${stamp}-${rand}`;
}

export function formatZar(value: number): string {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
  }).format(value);
}

export const PAYFAST_SANDBOX_CARD = {
  number: "4111 1111 1111 1111",
  expiry: "12/25",
  cvc: "123",
  name: "Test Customer",
};
