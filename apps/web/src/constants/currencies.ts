export interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: "INR", symbol: "₹", name: "INR — Indian Rupee (₹)", flag: "🇮🇳" },
  { code: "USD", symbol: "$", name: "USD — US Dollar ($)", flag: "🇺🇸" },
  { code: "EUR", symbol: "€", name: "EUR — Euro (€)", flag: "🇪🇺" },
  { code: "GBP", symbol: "£", name: "GBP — British Pound (£)", flag: "🇬🇧" },
  { code: "JPY", symbol: "¥", name: "JPY — Japanese Yen (¥)", flag: "🇯🇵" },
  { code: "CAD", symbol: "$", name: "CAD — Canadian Dollar ($)", flag: "🇨🇦" },
  { code: "AUD", symbol: "$", name: "AUD — Australian Dollar ($)", flag: "🇦🇺" },
  { code: "AED", symbol: "AED", name: "AED — UAE Dirham (AED)", flag: "🇦🇪" },
  { code: "SAR", symbol: "SAR", name: "SAR — Saudi Riyal (SAR)", flag: "🇸🇦" },
  {
    code: "SGD",
    symbol: "S$",
    name: "SGD — Singapore Dollar (S$)",
    flag: "🇸🇬",
  },
  { code: "CHF", symbol: "Fr", name: "CHF — Swiss Franc (Fr)", flag: "🇨🇭" },
  { code: "CNY", symbol: "¥", name: "CNY — Chinese Yuan (¥)", flag: "🇨🇳" },
  { code: "BRL", symbol: "R$", name: "BRL — Brazilian Real (R$)", flag: "🇧🇷" },
  {
    code: "ZAR",
    symbol: "R",
    name: "ZAR — South African Rand (R)",
    flag: "🇿🇦",
  },
  { code: "KRW", symbol: "₩", name: "KRW — South Korean Won (₩)", flag: "🇰🇷" },
  { code: "RUB", symbol: "₽", name: "RUB — Russian Ruble (₽)", flag: "🇷🇺" },
  { code: "MXN", symbol: "$", name: "MXN — Mexican Peso ($)", flag: "🇲🇽" },
  {
    code: "NZD",
    symbol: "$",
    name: "NZD — New Zealand Dollar ($)",
    flag: "🇳🇿",
  },
];
