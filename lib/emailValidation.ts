import { blockedEmailDomains } from "@/constants/blockedEmailDomains";

export interface BusinessEmailValidationResult {
  valid: boolean;
  message: string | null;
}

/**
 * Returns true when an email uses a personal/blocked domain.
 */
export function isPersonalEmailDomain(email: string): boolean {
  const trimmedEmail = email.trim().toLowerCase();
  const domain = trimmedEmail.split("@")[1];

  if (!domain) {
    return false;
  }

  return blockedEmailDomains.includes(domain);
}

/**
 * Validates whether an email string follows a common email format.
 */
export function isValidEmailFormat(email: string): boolean {
  const trimmedEmail = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(trimmedEmail);
}

/**
 * Validates business email input and returns UI-friendly state and message.
 */
export function validateBusinessEmail(email: string): BusinessEmailValidationResult {
  if (email.trim() === "") {
    return { valid: false, message: null };
  }

  if (!isValidEmailFormat(email)) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  if (isPersonalEmailDomain(email)) {
    return {
      valid: false,
      message:
        "This looks like a personal email address. Please use your work email so we can send your personalised ROI report.",
    };
  }

  return { valid: true, message: null };
}
