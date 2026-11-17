// Eingebaute Avatare – keine Fotos, keine personenbezogenen Daten.
export const AVATARS = [
  { id: "fern", label: "Farn", icon: "Leaf", from: "#ff7a45", to: "#ff4f8b" },
  { id: "mountain", label: "Gipfel", icon: "Mountain", from: "#1b5f9e", to: "#2fa9d6" },
  { id: "wave", label: "Welle", icon: "Waves", from: "#2fa9d6", to: "#2fd6c6" },
  { id: "owl", label: "Eule", icon: "Bird", from: "#8a4fff", to: "#ff5d73" },
  { id: "pine", label: "Kiefer", icon: "TreePine", from: "#2fbf8f", to: "#1b5f9e" },
  { id: "sun", label: "Sonne", icon: "Sun", from: "#ffb347", to: "#ff7a45" },
  { id: "moon", label: "Mond", icon: "Moon", from: "#2a1745", to: "#6b5bd6" },
  { id: "feather", label: "Feder", icon: "Feather", from: "#ff5d73", to: "#c04dff" },
  { id: "compass", label: "Kompass", icon: "Compass", from: "#f2c14e", to: "#ff7a45" },
  { id: "sprout", label: "Spross", icon: "Sprout", from: "#2fbf8f", to: "#f2c14e" },
  { id: "shell", label: "Muschel", icon: "Shell", from: "#ffb38a", to: "#ff5d73" },
  { id: "snow", label: "Schnee", icon: "Snowflake", from: "#5b9dff", to: "#ad7bff" },
] as const;

export type AvatarId = (typeof AVATARS)[number]["id"];
