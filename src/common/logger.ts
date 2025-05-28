export function logger(severity: 'log' | 'error', contextId: string, message: string): void {
    console[severity](`[${new Date().toISOString()}]    [${contextId}]    ${message}`);
}