import { createCrudRouter } from './crudFactory';
import { Skill } from '../entities/Skill';
import { skillCreateSchema, skillUpdateSchema } from '../schemas/validation';

export default createCrudRouter(Skill, {
    entityName: 'Skill',
    order: {
        order: 'ASC',
        name: 'ASC'
    },
    createSchema: skillCreateSchema,
    updateSchema: skillUpdateSchema
});
