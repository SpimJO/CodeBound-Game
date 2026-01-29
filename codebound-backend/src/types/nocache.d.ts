declare module 'nocache' {
    import { RequestHandler } from 'express';
    function nocache(): RequestHandler;
    export = nocache;
}
