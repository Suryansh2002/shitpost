import type {Session}  from './session';

declare global {
    namespace Express {
        interface Request {
            session?: Session;
        }
        interface Response {
            htmxRedirect: (url: string) => void;
        }
    }
}