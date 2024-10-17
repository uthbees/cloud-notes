import { ExpressRequest, ExpressResponse, NoteTitle } from '../types';
import { ResultSetHeader } from 'mysql2';

export default async function postNote(
    req: ExpressRequest,
    res: ExpressResponse,
) {
    const db = req.app.db;

    let requestBody;
    try {
        requestBody = validateRequestBody(req.body);
    } catch (e) {
        res.status(400).send((e as Error).message);
        return;
    }

    try {
        // Check for duplicate note titles within the folder. Since we only support
        // creating notes in the root folder right now, we just have to check there.
        const [existing_root_folder_notes] = await db.query<NoteTitle[]>(
            'SELECT title FROM note WHERE folder_id IS NULL',
        );

        if (
            existing_root_folder_notes.some(
                (note) => note.title === requestBody.title,
            )
        ) {
            res.status(400).send(
                'A note with that title already exists in that folder',
            );
            return;
        }

        const uuid = crypto.randomUUID();
        const now = Date.now();

        const [result] = await db.execute<ResultSetHeader>(
            'INSERT INTO note (uuid, last_updated_at_timestamp, title, contents) VALUES (?, ?, ?, ?)',
            [uuid, now, requestBody.title, requestBody.contents],
        );

        if (result.affectedRows === 1) {
            res.status(201).send({ uuid, last_updated_at: now });
        } else {
            res.status(500).send(`Internal error: ${result.info}`);
        }
    } catch (err) {
        res.status(500).send(`Internal error: ${err}`);
    }
}

interface PostNoteRequestBody {
    title: string;
    contents: string;
}

function validateRequestBody(requestBody: unknown): PostNoteRequestBody {
    if (typeof requestBody !== 'object' || requestBody === null) {
        throw new Error('Bad request body (not an object)');
    }

    const requestBodyObj: Record<string, unknown> = requestBody as Record<
        string,
        unknown
    >;

    if (!('contents' in requestBodyObj)) {
        requestBodyObj.contents = '';
    }

    if (
        typeof requestBodyObj.title !== 'string' ||
        typeof requestBodyObj.contents !== 'string'
    ) {
        throw new Error('Bad request body');
    }

    if (requestBodyObj.title.length > 100) {
        throw new Error('Title too long');
    }

    if (requestBodyObj.title.length == 0) {
        throw new Error('Title missing');
    }

    return requestBodyObj as unknown as PostNoteRequestBody;
}
