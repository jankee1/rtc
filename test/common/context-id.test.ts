import { describe, it, expect } from "vitest";
import { contextId } from "../../src/common";

describe('contextId', () => {
  it('should return the correct string with given name and counter', () => {
    expect(contextId('user', 1)).toBe('user_1');
    expect(contextId('session', 42)).toBe('session_42');
    expect(contextId('test', 0)).toBe('test_0');
  });
});