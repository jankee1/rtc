
import { describe, it, expect } from "vitest";
import { parseMappings } from "../../src/consumer/utils";

describe('parseMappings', () => {
    it('should return an empty object for an empty input string', () => {
        expect(parseMappings("")).toEqual({});
    });

    it('should ignore malformed entries (missing key or value)', () => {
        const input = "123:Real Madrid;:Invalid;456:Barcelona;789";
        const expectedOutput = {
            "123": "Real Madrid",
            "456": "Barcelona"
        };

        expect(parseMappings(input)).toEqual(expectedOutput);
    });

    it('should handle trailing semicolons', () => {
        const input = "111:Team A;222:Team B;";
        const expectedOutput = {
            "111": "Team A",
            "222": "Team B"
        };

        expect(parseMappings(input)).toEqual(expectedOutput);
    });

    it('should parse mapping string', () => {
        const rawMapping = `29190088-763e-4d1c-861a-d16dbfcf858c:Real Madrid;33ff69aa-c714-470c-b90d-d3883c95adce:Barcelona;7229b223-03d6-4285-afbf-243671088a20:Chelsea`;
        const expectedOutput = {
            "29190088-763e-4d1c-861a-d16dbfcf858c": "Real Madrid",
            "33ff69aa-c714-470c-b90d-d3883c95adce": "Barcelona",
            "7229b223-03d6-4285-afbf-243671088a20": "Chelsea"
        };

        expect(parseMappings(rawMapping)).toEqual(expectedOutput);
    });
});