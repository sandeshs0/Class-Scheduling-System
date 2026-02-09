import { Router } from 'express';
import { 
    createInstructor, 
    getAllInstructors, 
    getInstructorById, 
    updateInstructor, 
    deleteInstructor 
} from '../controllers/instructorController';
import { validateBody } from '../middlewares/validateRequests';
import { createInstructorSchema, updateInstructorSchema } from '../validators/instructorValidator';

const router = Router();

router.route('/')
    .post(validateBody(createInstructorSchema), createInstructor)
    .get(getAllInstructors);

router.route('/:id')
    .get(getInstructorById)
    .put(validateBody(updateInstructorSchema), updateInstructor)
    .delete(deleteInstructor);

export default router;