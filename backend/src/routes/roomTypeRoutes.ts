import { Router } from 'express';
import { 
    createRoomType, 
    getAllRoomTypes, 
    getRoomTypeById, 
    updateRoomType, 
    deleteRoomType 
} from '../controllers/roomTypeController';
import { validateBody } from '../middlewares/validateRequests';
import { createRoomTypeSchema, updateRoomTypeSchema } from '../validators/roomTypeValidator';

const router = Router();

router.route('/')
    .post(validateBody(createRoomTypeSchema), createRoomType)
    .get(getAllRoomTypes);

router.route('/:id')
    .get(getRoomTypeById)
    .put(validateBody(updateRoomTypeSchema), updateRoomType)
    .delete(deleteRoomType);

export default router;