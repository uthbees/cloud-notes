import { ExpressRequest, ExpressResponse } from '../types';

export default function postNotes(req: ExpressRequest, res: ExpressResponse) {
    res.send('stub implementation');
    // req.app.db.query
}
