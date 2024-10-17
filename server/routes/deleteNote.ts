import { ExpressRequest, ExpressResponse } from '../types';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export default async function deleteNote(
    req: ExpressRequest,
    res: ExpressResponse,
) {
    const db = req.app.db;

    const uuid: unknown = req.params.uuid;

    if (typeof uuid !== 'string') {
        res.status(400).send('Uuid parameter invalid or not found');
    }

    try {
        const [queryResult] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(*) as count FROM note WHERE uuid = ?',
            [uuid],
        );

        if (queryResult[0].count !== 1) {
            res.status(404).send('No note found with the specified uuid');
            return;
        }

        const [deleteResult] = await db.execute<ResultSetHeader>(
            'DELETE FROM note WHERE uuid = ?',
            [uuid],
        );

        if (deleteResult.affectedRows === 1) {
            res.status(204).send();
        } else {
            res.status(500).send(`Internal error: ${deleteResult.info}`);
        }
    } catch (err) {
        res.status(500).send(`Internal error: ${err}`);
    }
}
