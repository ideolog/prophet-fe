export function validateClaim(claim: string): string {
    const trimmedClaim = claim.trim();

    // Rule 1: No negations
    if (/\b(not|no|neither|nor)\b/i.test(trimmedClaim)) {
        return "Claims should not contain negations like 'not', 'no', 'neither', or 'nor'. Please rephrase positively.";
    }

    // Rule 2: At least 3 words
    const words = trimmedClaim.split(/\s+/);
    if (words.length < 3) {
        return "Claims must contain at least 3 words. Please elaborate further.";
    }

    // Rule 3: No ending with incomplete words
    const stopWords = [
        "a", "an", "the", "is", "was", "were", "be",
        "in", "on", "at", "by", "with", "to", "for", "of", "about"
    ];
    const lastWord = words[words.length - 1]?.toLowerCase();
    if (stopWords.includes(lastWord)) {
        return `Claims should not end with words like '${lastWord}'. Please complete the sentence.`;
    }

    // Rule 4: Maximum character limit
    if (trimmedClaim.length > 200) {
        return "Claims should not exceed 200 characters. Please shorten your claim.";
    }

    // Rule 5: No numeric-only claims
    if (/^\d+$/.test(trimmedClaim)) {
        return "Claims should not contain numbers only. Please provide more context.";
    }

    // Rule 6: Prohibit punctuation except for "."
    if (/[!?,;:]/.test(trimmedClaim)) {
        return "Claims should not contain punctuation other than a period (.).";
    }

    // Rule 7: No future tense
    if (/\b(will|shall|going to|'ll|would)\b/i.test(trimmedClaim)) {
        return "Claims should not use future tense like 'will', 'shall', or 'going to'. Please rephrase.";
    }

    return ""; // No error
}
