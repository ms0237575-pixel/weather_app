// Turns a failed fetch into a message that is safe to show to users.
export function toErrorMessage(error: unknown, { service, fallback }: { service: string; fallback: string }): string {
    if (error instanceof DOMException && error.name === "TimeoutError") {
        return `The ${service} took too long to respond.`;
    }
    if (error instanceof TypeError) {
        return `Couldn't reach the ${service}. Check your connection.`;
    }
    return fallback;
}
