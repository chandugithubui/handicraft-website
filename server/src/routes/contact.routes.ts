/**
 * server/src/routes/contact.routes.ts
 *
 * Contact message routes in TypeScript.
 */

import { Router, Request, Response } from 'express';
import { Contact } from '../models/contact.model';

const router = Router();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  try {
    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json(newContact);
  } catch (err) {
    res.status(400).json({ message: 'Error saving contact message', error: err });
  }
});

export default router;
