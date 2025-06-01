import { describe, it, expect } from "vitest";
import { ArrayOps } from "../../src/common";

describe('ArrayOps', () => {
    describe('areElementsValid', () => {
        it('should return false for non-array input', () => {
            expect(ArrayOps.areElementsValid(null as any)).toBe(false);
            expect(ArrayOps.areElementsValid(undefined as any)).toBe(false);
            expect(ArrayOps.areElementsValid({} as any)).toBe(false);
        });

        it('should return true for array with all non-empty, non-null, non-undefined elements', () => {
            expect(ArrayOps.areElementsValid(['a', 'b', 'c'])).toBe(true);
            expect(ArrayOps.areElementsValid([1, 2, 3])).toBe(true);
            expect(ArrayOps.areElementsValid([true, false, true])).toBe(true);
        });

        it('should return false if any element is undefined', () => {
            expect(ArrayOps.areElementsValid(['a', undefined, 'c'])).toBe(false);
        });

        it('should return false if any element is null', () => {
            expect(ArrayOps.areElementsValid(['a', null, 'c'])).toBe(false);
        });

        it('should return false if any element is an empty string', () => {
            expect(ArrayOps.areElementsValid(['a', '', 'c'])).toBe(false);
        });

        it('should treat 0 and false as valid values', () => {
            expect(ArrayOps.areElementsValid([0, 1, 2])).toBe(true);
            expect(ArrayOps.areElementsValid([false, true])).toBe(true);
        });
    })
});