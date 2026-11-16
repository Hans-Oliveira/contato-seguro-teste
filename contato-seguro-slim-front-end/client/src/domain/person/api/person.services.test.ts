import { afterEach, describe, expect, it, vi } from 'vitest';

import { Request } from '@domain/@shared/request';

import { createPerson } from './create-person.service';
import { deletePerson } from './delete-person.service';
import { findPerson } from './find-person.service';
import { listPeople } from './list-people.service';
import { updatePerson } from './update-person.service';

describe('Person API services', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('listPeople chama GET /people', async () => {
        const spy = vi.spyOn(Request, 'get').mockResolvedValue({ statusCode: 200, data: { people: [] } });

        await listPeople();

        expect(spy).toHaveBeenCalledWith('/people');
    });

    it('findPerson chama GET /people/:id', async () => {
        const spy = vi.spyOn(Request, 'get').mockResolvedValue({ statusCode: 200, data: { person: {} } });

        await findPerson(1);

        expect(spy).toHaveBeenCalledWith('/people/1');
    });

    it('createPerson chama POST /people com o body correto', async () => {
        const spy = vi.spyOn(Request, 'post').mockResolvedValue({ statusCode: 201, data: { person: {} } });
        const body = {
            name: 'Ana Silva',
            cpf: '12345678901',
            email: 'ana@example.com',
            birth_date: '1990-03-15',
        };

        await createPerson(body);

        expect(spy).toHaveBeenCalledWith('/people', body);
    });

    it('updatePerson chama PUT /people/:id com o body correto', async () => {
        const spy = vi.spyOn(Request, 'put').mockResolvedValue({ statusCode: 200, data: { person: {} } });
        const body = {
            name: 'Ana Silva Editada',
            cpf: '12345678901',
            email: 'ana@example.com',
            birth_date: '1990-03-15',
        };

        await updatePerson(5, body);

        expect(spy).toHaveBeenCalledWith('/people/5', body);
    });

    it('deletePerson chama DELETE /people/:id', async () => {
        const spy = vi.spyOn(Request, 'delete').mockResolvedValue({ statusCode: 200, data: {} });

        await deletePerson(5);

        expect(spy).toHaveBeenCalledWith('/people/5');
    });
});