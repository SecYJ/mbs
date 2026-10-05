// Builds a "contains" pattern for LIKE / ILIKE. The characters %, _ and \ have special meaning in LIKE,
// so they are escaped to make the search match them literally.
export function getContainsPattern(value: string) {
    const escapedValue = value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");

    return `%${escapedValue}%`;
}
