import { createCrudRouter } from './crudFactory';
import { Certification } from '../entities/Certification';
import { certificationCreateSchema, certificationUpdateSchema } from '../schemas/validation';

export default createCrudRouter(Certification, {
    entityName: 'Certification',
    order: {
        issueDate: 'DESC'
    },
    createSchema: certificationCreateSchema,
    updateSchema: certificationUpdateSchema
});
