import { Request, Response } from 'express';
import { Pool } from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';

export type ExpressRequest = Request;
export type ExpressResponse = Response;

declare module 'express-serve-static-core' {
    // noinspection JSUnusedGlobalSymbols
    interface Application {
        db: Pool;
    }
}

export interface NoteTitle extends RowDataPacket {
    title: string;
}
