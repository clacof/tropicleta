/** Emociones de Tropi (compartidas por el endpoint y el widget). */
export const EMOTIONS = ["feliz", "emocionado", "pensando", "curioso", "apenado", "guino"] as const;
export type Emotion = (typeof EMOTIONS)[number];

export const EMOTION_LABEL: Record<Emotion, string> = {
  feliz: "feliz",
  emocionado: "¡emocionado!",
  pensando: "pensando…",
  curioso: "curioso",
  apenado: "apenado",
  guino: "te guiña un ojo",
};
