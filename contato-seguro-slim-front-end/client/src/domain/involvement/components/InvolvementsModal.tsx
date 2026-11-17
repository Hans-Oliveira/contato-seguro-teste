import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
    App,
    Button,
    Divider,
    Form,
    List,
    Modal,
    Popconfirm,
    Select,
    Space,
    Tag,
    Typography,
} from 'antd';

import { DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { formatCPF } from '@brazilian-utils/brazilian-utils';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { listPeople } from '@domain/person/api/list-people.service';
import type { Person } from '@domain/person/person.type';
import type { Record } from '@domain/record/record.type';

import { createInvolvement } from '../api/create-involvement.service';
import { deleteInvolvement } from '../api/delete-involvement.service';
import { listInvolvements } from '../api/list-involvements.service';
import type { Involvement } from '../involvement.type';
import { InvolvementTypeTag } from './InvolvementTypeTag';

type Props = {
    record: Record.Model;
    onClose: () => void;
    onChange?: (isAnonymous: boolean) => void;
};

type FormValues = {
    person_id: number;
    type: Involvement.Type;
};

const TYPE_OPTIONS: { label: string; value: Involvement.Type }[] = [
    { label: 'Relatante', value: 'whistleblower' },
    { label: 'Testemunha', value: 'witness' },
    { label: 'Vítima', value: 'victim' },
    { label: 'Denunciado', value: 'denounced' },
];

export function InvolvementsModal({ record, onClose, onChange }: Props) {
    const [involvements, setInvolvements] = useState<Involvement.Model[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(true);
    const [people, setPeople] = useState<Person.Model[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [form] = Form.useForm<FormValues>();
    const app = App.useApp();
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    const loadData = useCallback(async () => {
        setIsLoading(true);

        const [involvementsRes, peopleRes] = await Promise.all([
            listInvolvements(record.id),
            listPeople(),
        ]);

        setIsLoading(false);

        if (hasServiceError(involvementsRes))
            return handleServiceError(app, involvementsRes);

        if (hasServiceError(peopleRes))
            return handleServiceError(app, peopleRes);

        setInvolvements(involvementsRes.data.involvements);
        setIsAnonymous(involvementsRes.data.is_anonymous);
        setPeople(peopleRes.data.people);
        onChangeRef.current?.(involvementsRes.data.is_anonymous);
    }, [app, record.id]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const linkedPersonIds = useMemo(
        () => new Set(involvements.map(item => item.person_id)),
        [involvements],
    );

    const handleAdd = async (values: FormValues) => {
        setIsSubmitting(true);

        const response = await createInvolvement(record.id, values);

        setIsSubmitting(false);

        if (hasServiceError(response)) {
            return handleServiceError(app, response, err => {
                if (err.statusCode === 409)
                    return 'Esta pessoa já está vinculada a este relato.';
                if (err.statusCode === 500 && err.error.description.includes('Duplicate entry'))
                    return 'Esta pessoa já foi vinculada e removida anteriormente deste relato, não podendo ser revinculada.';
                return null;
            });
        }

        form.resetFields();
        loadData();
    };

    const handleDelete = async (id: number) => {
        const response = await deleteInvolvement(record.id, id);

        if (hasServiceError(response))
            return handleServiceError(app, response);

        loadData();
    };

    return (
        <Modal
            open
            width={680}
            onCancel={onClose}
            footer={null}
            title={(
                <Space>
                    <span>Envolvidos — {record.title}</span>
                    <Tag color={isAnonymous ? 'orange' : 'green'}>
                        {isAnonymous ? 'Anônimo' : 'Identificado'}
                    </Tag>
                </Space>
            )}
        >
            <Divider />

            <List
                loading={isLoading}
                dataSource={involvements}
                locale={{ emptyText: 'Nenhum envolvido vinculado a este relato.' }}
                renderItem={item => (
                    <List.Item
                        actions={[
                            <Popconfirm
                                key="delete"
                                title="Desvincular pessoa"
                                description="Deseja remover este envolvimento do relato?"
                                okText="Sim"
                                cancelText="Não"
                                okType="danger"
                                onConfirm={() => handleDelete(item.id)}
                            >
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    title="Desvincular"
                                />
                            </Popconfirm>,
                        ]}
                    >
                        <List.Item.Meta
                            title={item.person.name}
                            description={`CPF: ${formatCPF(item.person.cpf)} • ${item.person.email}`}
                        />
                        <InvolvementTypeTag type={item.type} />
                    </List.Item>
                )}
            />

            <Divider orientation="left" orientationMargin="0" plain>
                <Typography.Text strong>Vincular nova pessoa</Typography.Text>
            </Divider>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleAdd}
                autoComplete="off"
            >
                <Space align="start" style={{ display: 'flex', width: '100%' }}>
                    <Form.Item<FormValues>
                        name="person_id"
                        label="Pessoa"
                        rules={[{ required: true, message: 'Selecione uma pessoa.' }]}
                        style={{ minWidth: 320 }}
                    >
                        <Select
                            showSearch
                            placeholder="Selecione uma pessoa"
                            optionFilterProp="label"
                            options={people.map(person => ({
                                value: person.id,
                                label: `${person.name} (${formatCPF(person.cpf)})`,
                                disabled: linkedPersonIds.has(person.id),
                            }))}
                        />
                    </Form.Item>

                    <Form.Item<FormValues>
                        name="type"
                        label="Papel"
                        rules={[{ required: true, message: 'Selecione o papel.' }]}
                        style={{ minWidth: 160 }}
                    >
                        <Select placeholder="Tipo" options={TYPE_OPTIONS} />
                    </Form.Item>

                    <Form.Item label=" ">
                        <Button
                            type="primary"
                            htmlType="submit"
                            icon={<UserAddOutlined />}
                            loading={isSubmitting}
                        >
                            Vincular
                        </Button>
                    </Form.Item>
                </Space>
            </Form>
        </Modal>
    );
}