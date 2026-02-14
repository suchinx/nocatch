import crypto from "crypto";

export const US_STATES = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
  ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
  ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
  ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
  ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
  ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"]
];

const ADJ = ["Cosmic","Lucky","Neon","Gentle","Chaotic","Electric","Golden","Quiet","Wild","Tiny","Brave","Midnight","Sunny","Mischief","Mellow","Rapid","Fuzzy","Atomic","Glitchy","Velvet"];
const NOUN = ["Cactus","Ferret","Toast","Comet","Otter","Pigeon","Robot","Biscuit","Lantern","Sandal","Penguin","Walrus","Kite","Marble","Tangerine","Raccoon","Hammock","Pinecone","Mushroom","Compass"];

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function emailHash(email: string) {
  return crypto.createHash("sha256").update(normalizeEmail(email)).digest();
}

export function generateDisplayName(email: string) {
  const h = emailHash(email);
  const a = h[0] % ADJ.length;
  const n = h[1] % NOUN.length;
  return `${ADJ[a]} ${NOUN[n]}`;
}

export function generateDisplayState(email: string) {
  const h = emailHash(email);
  const idx = (h[2] << 8 | h[3]) % US_STATES.length;
  return US_STATES[idx][1];
}

export function stateCodeToName(code?: string | null) {
  if (!code) return null;
  const c = code.toUpperCase();
  const found = US_STATES.find(([abbr]) => abbr === c);
  return found ? found[1] : null;
}
