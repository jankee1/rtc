export function parseMappings(rawMapping: string): Record<string, string> {
    const result: Record<string, string> = {};

    for(const chunk of rawMapping.split(';')) {
        const [key, value] = chunk.split(':')
        if (key && value) {
            result[key] = value;
        }
    }

    return result;
}