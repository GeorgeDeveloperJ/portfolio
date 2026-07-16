import { createCrudRouter } from './crudFactory';
import { Project } from '../entities/Project';
import { projectCreateSchema, projectUpdateSchema } from '../schemas/validation';

export default createCrudRouter(Project, {
    entityName: 'Project',
    order: {
        order: 'ASC',
        createdAt: 'DESC'
    },
    createSchema: projectCreateSchema,
    updateSchema: projectUpdateSchema
});
