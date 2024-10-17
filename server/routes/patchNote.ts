import { ExpressRequest, ExpressResponse, NoteTitle } from '../types';
import { FieldPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import { Pool } from 'mysql2/promise';

export default async function patchNote(
    req: ExpressRequest,
    res: ExpressResponse,
) {
    const db = req.app.db;

    const uuid: unknown = req.params.uuid;

    if (typeof uuid !== 'string') {
        res.status(400).send('Uuid parameter invalid or not found');
        return;
    }

    let requestBody;
    try {
        requestBody = validateRequestBody(req.body);
    } catch (e) {
        res.status(400).send((e as Error).message);
        return;
    }

    try {
        const [queryResultArray] = await db.query<RowDataPacket[]>(
            'SELECT COUNT(note.id) as count, note.title as note_title, note.last_updated_at_timestamp as last_updated_at, note.trashed_at_timestamp as trashed_at, folder.uuid as folder_uuid FROM note LEFT JOIN folder on note.folder_id = folder.id WHERE note.uuid = ?',
            [uuid],
        );
        const queryResult = queryResultArray[0];

        if (queryResult.count !== 1) {
            res.status(404).send('No note found with the specified uuid');
            return;
        }

        if (
            requestBody._current_last_updated_at_value !==
            queryResult.last_updated_at
        ) {
            // The client's copy of the note is out of date - respond with the latest data.
            const [currentNote] = await db.query<RowDataPacket[]>(
                'SELECT note.uuid as uuid, note.title as title, note.trashed_at_timestamp as trashed_at, note.last_updated_at_timestamp as last_updated_at, folder.uuid as folder_uuid, note.contents as contents FROM note LEFT JOIN folder on note.folder_id = folder.id WHERE note.uuid = ?',
                [uuid],
            );
            res.status(400).send(currentNote);
            return;
        }

        if (
            await changeWouldCauseTitleConflict(
                db,
                uuid,
                requestBody.title ?? queryResult.note_title,
                requestBody.folder_uuid ?? queryResult.folder_uuid,
            )
        ) {
            res.status(400).send(
                'A note with that title already exists in that folder',
            );
            return;
        }

        const now = Date.now();

        const [patchResult] = await applyPatch(
            db,
            uuid,
            requestBody,
            now,
            !!queryResult.trashed_at,
        );

        if (patchResult.affectedRows === 1) {
            res.status(200).send({ last_updated_at: now });
        } else {
            res.status(500).send(`Internal error: ${patchResult.info}`);
        }
    } catch (err) {
        res.status(500).send(`Internal error: ${err}`);
    }
}

interface PatchNoteRequestBody {
    _current_last_updated_at_value: number;
    title?: string;
    contents?: string;
    in_trash?: boolean;
    folder_uuid?: string;
}

function validateRequestBody(requestBody: unknown): PatchNoteRequestBody {
    if (typeof requestBody !== 'object' || requestBody === null) {
        throw new Error('Bad request body (not an object)');
    }

    const requestBodyObj: Record<string, unknown> = requestBody as Record<
        string,
        unknown
    >;

    if (!('_current_last_updated_at_value' in requestBodyObj)) {
        throw new Error(
            'Bad request body (missing _current_last_updated_at_value)',
        );
    }

    const requirements = [
        ['title', 'string'],
        ['contents', 'string'],
        ['in_trash', 'boolean'],
        ['folder_uuid', 'string'],
    ];
    requirements.forEach((requirement) => {
        if (
            requirement[0] in requestBodyObj &&
            typeof requestBodyObj[requirement[0]] !== requirement[1]
        ) {
            throw new Error(
                `Bad request body (${requirement[0]} not a ${requirement[1]})`,
            );
        }
    });

    if ('title' in requestBodyObj && typeof requestBodyObj.title === 'string') {
        if (requestBodyObj.title.length > 100) {
            throw new Error('Title too long');
        }

        if (requestBodyObj.title.length == 0) {
            throw new Error('Title missing');
        }
    }

    return requestBodyObj as unknown as PatchNoteRequestBody;
}

// Check whether applying the requested changes would cause a title conflict (two
// notes with the same name in the same folder).
// Note that passing an empty string as the proposed_folder_uuid searches the root folder.
async function changeWouldCauseTitleConflict(
    db: Pool,
    noteUuid: string,
    noteProposedTitle: string,
    proposedFolderUuid: string,
) {
    let query;
    let args = [];
    if (proposedFolderUuid === '') {
        query =
            'SELECT title, uuid FROM note WHERE trashed_at_timestamp IS NOT NULL AND folder_id IS NULL';
    } else {
        query =
            'SELECT note.title, note.uuid FROM note LEFT JOIN folder on folder.id = note.folder_id WHERE trashed_at_timestamp IS NOT NULL AND folder.uuid = ?';
        args.push(proposedFolderUuid);
    }

    // Get the notes that are currently in the proposed folder for the note being edited.
    const [existingFolderNotes] = await db.query<NoteTitle[]>(query, args);

    return existingFolderNotes.some(
        (note) => note.title === noteProposedTitle && note.uuid !== noteUuid,
    );
}

async function applyPatch(
    db: Pool,
    uuid: string,
    requestBody: PatchNoteRequestBody,
    requestTimestamp: number,
    noteCurrentlyInTrash: boolean,
): Promise<[ResultSetHeader, FieldPacket[]]> {
    // noinspection SqlWithoutWhere
    let query = 'UPDATE note SET last_updated_at_timestamp = ?';
    let args: (string | number)[] = [requestTimestamp];

    if (requestBody.title !== undefined) {
        query += ', title = ?';
        args.push(requestBody.title);
    }
    if (requestBody.contents !== undefined) {
        query += ', contents = ?';
        args.push(requestBody.contents);
    }
    if (
        requestBody.in_trash !== undefined &&
        requestBody.in_trash !== noteCurrentlyInTrash
    ) {
        if (requestBody.in_trash) {
            query += ', trashed_at_timestamp = ?';
            args.push(requestTimestamp);
        } else {
            query += ', trashed_at_timestamp = NULL';
        }
    }
    if (requestBody.folder_uuid !== undefined) {
        query += ', folder_id = (SELECT id from folder WHERE uuid = ?)';
        args.push(requestBody.folder_uuid);
    }

    query += ' WHERE uuid = ?';
    args.push(uuid);

    return db.execute<ResultSetHeader>(query, args);
}
