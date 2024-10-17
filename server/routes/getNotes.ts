import { ExpressRequest, ExpressResponse } from '../types';
import { RowDataPacket } from 'mysql2';

export default async function getNotes(
    req: ExpressRequest,
    res: ExpressResponse,
) {
    const db = req.app.db;

    try {
        const [results] = await db.query<RowDataPacket[]>(
            'SELECT note.uuid, note.title, note.trashed_at_timestamp AS trashed_at, note.last_updated_at_timestamp AS last_updated_at, folder.uuid AS folder_uuid FROM note LEFT JOIN cloud_notes.folder folder on folder.id = note.folder_id',
        );

        res.status(200).send(results);
    } catch (err) {
        res.status(500).send(`Internal error: ${err}`);
    }
}
