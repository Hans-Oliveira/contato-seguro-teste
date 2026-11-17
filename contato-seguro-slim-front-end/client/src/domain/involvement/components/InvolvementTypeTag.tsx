import { Tag } from 'antd';

import type { Involvement } from '../involvement.type';

const CONFIG: Record<Involvement.Type, { label: string; color: string }> = {
    whistleblower: { label: 'Relatante', color: 'blue' },
    witness: { label: 'Testemunha', color: 'green' },
    victim: { label: 'Vítima', color: 'orange' },
    denounced: { label: 'Denunciado', color: 'red' },
};

type Props = {
    type: Involvement.Type;
};

export function InvolvementTypeTag({ type }: Props) {
    const { label, color } = CONFIG[type];

    return <Tag color={color}>{label}</Tag>;
}