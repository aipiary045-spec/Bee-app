export type SignupDetailsInput = {
  keeperName: string;
  yardName: string;
  location: string;
};

export type SignupDetailsResult =
  | { ok: true; keeperName: string; yardName: string; location: string }
  | { ok: false; error: string };

export function cleanSignupDetails(
  input: SignupDetailsInput
): SignupDetailsResult {
  const keeperName = input.keeperName.trim();
  const yardName = input.yardName.trim();
  const location = input.location.trim();

  if (!keeperName) return { ok: false, error: "Tell us your name." };
  if (keeperName.length > 80) {
    return { ok: false, error: "Name must be 80 characters or fewer." };
  }
  if (!yardName) return { ok: false, error: "Give the yard a name." };
  if (yardName.length > 80) {
    return { ok: false, error: "Yard name must be 80 characters or fewer." };
  }
  if (!location) {
    return { ok: false, error: "Add the town so weather can follow this stand." };
  }
  if (location.length > 80) {
    return { ok: false, error: "Location must be 80 characters or fewer." };
  }

  return { ok: true, keeperName, yardName, location };
}
