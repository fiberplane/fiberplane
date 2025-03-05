export function convertToKebabCase(str: string): string {
	return str
		.replace(/([a-z])([A-Z])/g, "$1-$2") // convert camelCase to kebab
		.replace(/[\s_]+/g, "-") // convert spaces and underscores to hyphens
		.toLowerCase();
} 