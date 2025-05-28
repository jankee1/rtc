import { describe, it, expect, vi } from "vitest";
import { logger } from "../../src/common";

function format(context: string, message: string): RegExp {
    return new RegExp(`^\\[.*\\]    \\[${context}\\]    ${message}$`)
}

describe('logger', () => {
  it('prints logs correctly', () => {
    const contextId = 'test-context-id';
    const logMessage = 'Test log message';
    const errorMessage = 'Test error message';
    const testCases = [
      { severity: 'log' as const, contextId, message: logMessage },
      { severity: 'error' as const, contextId, message: errorMessage }
    ];

    const mockLog = vi.spyOn(console, 'log').mockImplementation(() => {});
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    for (const { severity, contextId, message } of testCases) {
      logger(severity, contextId, message);
    }

    expect(mockLog).toHaveBeenCalledOnce();
    expect(mockLog.mock.calls[0][0]).toMatch(format(contextId, logMessage));

    expect(mockError).toHaveBeenCalledOnce();
    expect(mockError.mock.calls[0][0]).toMatch(format(contextId, errorMessage));

    mockLog.mockRestore();
    mockError.mockRestore();
  });
});