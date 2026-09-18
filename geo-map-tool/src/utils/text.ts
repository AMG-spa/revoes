/** Particles kept lowercase in Spanish/Catalan place names ("Aras de los Olmos", "la Pobla de Vallbona"). */
const LOWERCASE_PARTICLES = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'les', 'en', 'y', 'i', 'a', 'da', 'd', 'l']);

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** "SANGARREN" → "Sangarren", "PUENTE DE LA REINA" → "Puente de la Reina". Keeps apostrophe particles ("d'", "l'") lowercase. */
export function toTitleCase(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map((word, i) => {
      if (i > 0 && LOWERCASE_PARTICLES.has(word)) return word;
      // Handle "d'en" / "l'alqueria" style apostrophes inside a word.
      if (word.includes("'")) {
        const [head, ...rest] = word.split("'");
        if (LOWERCASE_PARTICLES.has(head)) {
          return `${head}'${rest.map((part, j) => (j === rest.length - 1 ? capitalize(part) : part)).join("'")}`;
        }
      }
      return word
        .split('-')
        .map((part) => capitalize(part))
        .join('-');
    })
    .join(' ');
}
