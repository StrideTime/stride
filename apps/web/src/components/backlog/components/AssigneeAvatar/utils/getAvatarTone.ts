export function getAvatarTone(name?: string) {
  if (!name) return undefined;

  const tones = ['berry', 'violet', 'blue', 'teal', 'amber', 'rose'] as const;
  const index = Array.from(name).reduce((sum, letter) => sum + letter.charCodeAt(0), 0);

  return tones[index % tones.length];
}
