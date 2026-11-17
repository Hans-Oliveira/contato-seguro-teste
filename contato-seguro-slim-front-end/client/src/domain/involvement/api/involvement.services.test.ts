import { afterEach, describe, expect, it, vi } from 'vitest';

import { Request } from '@domain/@shared/request';

import { createInvolvement } from './create-involvement.service';
import { deleteInvolvement } from './delete-involvement.service';
import { listInvolvements } from './list-involvements.service';

describe('Involvement API services', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('listInvolvements chama GET /records/:recordId/involvements', async () => {
        const spy = vi.spyOn(Request, 'get').mockResolvedValue({
            statusCode: 200,
            data: { involvements: [], is_anonymous: true },
        });

        await listInvolvements(1);

        expect(spy).toHaveBeenCalledWith('/records/1/involvements');
    });

    it('createInvolvement chama POST /records/:recordId/involvements com o body correto', async () => {
        const spy = vi.spyOn(Request, 'post').mockResolvedValue({
            statusCode: 201,
            data: { involvement: {} },
        });
        const body = { person_id: 2, type: 'whistleblower' as const };

        await createInvolvement(1, body);

        expect(spy).toHaveBeenCalledWith('/records/1/involvements', body);
    });

    it('deleteInvolvement chama DELETE /records/:recordId/involvements/:id', async () => {
        const spy = vi.spyOn(Request, 'delete').mockResolvedValue({
            statusCode: 200,
            data: {},
        });

        await deleteInvolvement(1, 10);

        expect(spy).toHaveBeenCalledWith('/records/1/involvements/10');
    });
});