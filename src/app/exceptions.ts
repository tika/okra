export class HTTPError extends Error {
    constructor(public readonly code = 400, message: string) {
        super(message);
    }
}

export class NotFoundError extends HTTPError {
    constructor(resource: string) {
        super(404, `${resource} not found`);
    }
}

export class ConflictError extends HTTPError {
    constructor(resource: string, sameProperty: string) {
        super(409, `${resource} with the same ${sameProperty} already exists`);
    }
}

export class AuthorizationError extends HTTPError {
    constructor(resource: string) {
        super(409, `Unauthorized ${resource}`);
    }
}

export class InvalidDataError extends HTTPError {
    constructor(resource: string, field: "body" | "query") {
        super(422, `Required fields (${resource}) not provided in ${field}`);
    }
}
