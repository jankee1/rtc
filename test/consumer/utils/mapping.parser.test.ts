import { describe, it, expect } from "vitest";
import { parseMappings } from "../../../src/consumer/utils";


describe('parseMappings', () => {
    it('should parse valid key:value pairs separated by ";"', () => {
        const input = 'abc:Alpha;def:Delta;ghi:Gamma';
        const expected = {
            abc: 'Alpha',
            def: 'Delta',
            ghi: 'Gamma'
        };

        expect(parseMappings(input)).toEqual(expected);
    });

    it('should skip entries without ":"', () => {
        const input = 'abc:Alpha;invalid;def:Delta';
        const expected = {
            abc: 'Alpha',
            def: 'Delta'
        };

        expect(parseMappings(input)).toEqual(expected);
    });

    it('should skip entries with empty key or value', () => {
        const input = ':value1;key2:;key3:value3';
        const expected = {
            key3: 'value3'
        };

        expect(parseMappings(input)).toEqual(expected);
    });

    it('should return empty object for empty string', () => {
        expect(parseMappings('')).toEqual({});
    });

    it('should handle extra semicolons gracefully', () => {
        const input = 'key1:val1;;key2:val2;';
        const expected = {
            key1: 'val1',
            key2: 'val2'
        };

        expect(parseMappings(input)).toEqual(expected);
    });

    it('should handle whitespace around keys and values (not trimmed)', () => {
        const input = ' key1 : val1 ;key2:val2';
        const expected = {
            ' key1 ': ' val1 ',
            key2: 'val2'
        };

        expect(parseMappings(input)).toEqual(expected);
    });
});