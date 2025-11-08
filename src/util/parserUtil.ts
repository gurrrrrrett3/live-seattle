export function CSVNullable(value: string) {
    return value == "" ? undefined : value
}

export function CSVObjectNullable<T extends Record<string, string>>(values: T) {
    return Object.fromEntries(Object.entries(values).map(([k, v]) => [k, CSVNullable(v)])) as T
}

export function CSVEnum<E extends Record<number, any>>(value: string, e: E): keyof E | undefined {
    const v = Number(value)
    return v && e[v] ? e[v] : undefined
}
