declare function ga(command: string, args: Record<string, any>);
declare function ga(command: string, ...args: string[]);
declare function ga(cb: (tracker: { get: (key: string) => string }) => void);
