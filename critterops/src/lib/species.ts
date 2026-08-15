export const OKLAHOMA_NWCO_SPECIES = [
  "armadillo",
  "badger",
  "bat",
  "beaver",
  "bobcat",
  "coyote",
  "cottontail rabbit",
  "fox squirrel",
  "gray squirrel",
  "red fox",
  "gray fox",
  "mink",
  "muskrat",
  "nutria",
  "opossum",
  "raccoon",
  "river otter",
  "snake",
  "striped skunk",
  "weasel",
  "woodchuck",
] as const;

export const RESTRICTED_SPECIES = [
  "deer",
  "elk",
  "turkey",
  "bear",
  "alligator",
  "mountain lion",
  "endangered species",
] as const;

export const DISPOSITIONS = [
  "relocated",
  "euthanized",
  "released_on_site",
  "left_in_place",
  "transferred",
] as const;

export const CONTROL_METHODS = [
  "box or live trap",
  "leg-hold trap",
  "body-grip trap",
  "snare",
  "one-way door",
  "exclusion",
  "shooting",
  "enclosed trigger trap",
] as const;

export function isAuthorizedSpecies(species: string) {
  const key = species.trim().toLowerCase();
  return (OKLAHOMA_NWCO_SPECIES as readonly string[]).includes(key);
}
