// Eingebaute Avatare – keine Fotos, keine personenbezogenen Daten.
export const AVATARS = [
  { id: "fern", label: "Farn", icon: "Leaf", from: "#3f6b4f", to: "#8fae7a" },
  { id: "mountain", label: "Gipfel", icon: "Mountain", from: "#3d6a73", to: "#9cc0c2" },
  { id: "wave", label: "Welle", icon: "Waves", from: "#2f5d74", to: "#8bb6c9" },
  { id: "owl", label: "Eule", icon: "Bird", from: "#6b5a3e", to: "#c8b08a" },
  { id: "pine", label: "Kiefer", icon: "TreePine", from: "#264232", to: "#6f9a74" },
  { id: "sun", label: "Sonne", icon: "Sun", from: "#9a6a2e", to: "#e2c27a" },
  { id: "moon", label: "Mond", icon: "Moon", from: "#353a52", to: "#9aa0bf" },
  { id: "feather", label: "Feder", icon: "Feather", from: "#7d5a6a", to: "#d4b3c0" },
  { id: "compass", label: "Kompass", icon: "Compass", from: "#5c4a3a", to: "#bba489" },
  { id: "sprout", label: "Spross", icon: "Sprout", from: "#55603f", to: "#b6c08c" },
  { id: "shell", label: "Muschel", icon: "Shell", from: "#8a6f4a", to: "#e6d2b0" },
  { id: "snow", label: "Schnee", icon: "Snowflake", from: "#4f5b62", to: "#c3ced3" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];
