// Döner im Brot (variant "sandwich"), Vienna, status=active — pulled from the HOW MUCH?! database on 2026-10-08.
export type PricePoint = { name: string; plz: string; price: number };

export const KEBAB_VIENNA: PricePoint[] = [
  { name: "Gasthaus zur Grünen Laterne", plz: "1160", price: 3.9 },
  { name: "Varto's Döner", plz: "1200", price: 4.3 },
  { name: "Cukur Döner", plz: "1200", price: 4.5 },
  { name: "Der Döner", plz: "1200", price: 4.5 },
  { name: "Fried Chicken", plz: "1160", price: 4.5 },
  { name: "WEST Würstelstand & Kebap", plz: "1150", price: 4.5 },
  { name: "WURSTELSTAND", plz: "1160", price: 4.5 },
  { name: "PINAR Pizza und Kebap", plz: "1160", price: 5.0 },
  { name: "Nesil", plz: "1160", price: 5.0 },
  { name: "Dunyam Döner", plz: "1160", price: 5.0 },
  { name: "King Döner", plz: "1160", price: 5.0 },
  { name: "Kurze Pause", plz: "1200", price: 5.2 },
  { name: "Alaturka Mahü", plz: "1150", price: 5.5 },
  { name: "Anadolu Backshop", plz: "1050", price: 5.9 },
  { name: "Dönermeister Neubaugürtel", plz: "1070", price: 5.9 },
  { name: "Kent Restaurant Fünfhaus", plz: "1150", price: 5.9 },
  { name: "Kent Restaurant Brigittenau", plz: "1200", price: 5.9 },
  { name: "Flamm", plz: "1160", price: 6.0 },
  { name: "Kult Kebap", plz: "1150", price: 6.5 },
  { name: "Aras Mediterranean Food", plz: "1010", price: 6.9 },
  { name: "FERHAT DÖNER", plz: "1100", price: 8.5 },
];

export const stats = (points: PricePoint[]) => {
  const sorted = [...points].sort((a, b) => a.price - b.price);
  const n = sorted.length;
  const mid = Math.floor(n / 2);
  const median = n % 2 ? sorted[mid].price : (sorted[mid - 1].price + sorted[mid].price) / 2;
  const min = sorted[0];
  const max = sorted[n - 1];
  const pct = Math.round((max.price / min.price - 1) * 100);
  return { sorted, n, median, min, max, pct };
};
