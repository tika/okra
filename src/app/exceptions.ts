export class HTTPError extends Error {
    constructor(public readonly code = 400, message: string) {
        super(message);
    }
}
