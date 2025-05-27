export class ArrayOps {
    static areElementsValid<T>(arr: T[]): boolean {
        if (!Array.isArray(arr) || arr.length === 0) {
            return false;
        }

        return arr.every(value => value !== undefined && value !== null && value !== '');
    }
}