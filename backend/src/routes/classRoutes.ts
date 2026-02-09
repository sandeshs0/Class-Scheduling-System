import { Router } from 'express';
import {
    createClass,
    getAllClasses,
    getClassById,
    getCalendar,
    updateClass,
    deleteClass,
    cancelInstance,
} from '../controllers/classController';
import { validateBody } from '../middlewares/validateRequests';
import { createClassSchema, updateClassSchema } from '../validators/classValidator';

const router = Router();

router.get('/calendar', getCalendar);

router.route('/')
    .post(validateBody(createClassSchema), createClass)
    .get(getAllClasses);

router.route('/:id')
    .get(getClassById)
    .put(validateBody(updateClassSchema), updateClass)
    .delete(deleteClass);

router.put('/instances/:instanceId/cancel', cancelInstance);

export default router;