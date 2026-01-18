export class Scope<T> {
    private symbols: Map<string, T> = new Map();
    public parent: Scope<T> | null = null;

    constructor(parent: Scope<T> | null = null) {
        this.parent = parent;
    }

    define(name: string, value: T): boolean {
        if (this.symbols.has(name)) return false;
        this.symbols.set(name, value);
        return true;
    }

    lookup(name: string): T | null {
        let current: Scope<T> | null = this;
        while (current) {
            const sym = current.symbols.get(name);
            if (sym !== undefined) return sym;
            current = current.parent;
        }
        return null;
    }

    enterChild(): Scope<T> {
        return new Scope<T>(this);
    }
}
