import { useState } from 'react';

import { App, Divider, Form, Modal } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { sleep } from '@domain/@shared/sleep';

import { createPerson } from '../api/create-person.service';
import { usePeopleContext } from '../Person.context';
import { PersonFields, type Values } from './PersonFields';

export function CreatePersonModal() {
    const [isSending, setIsSending] = useState(false);

    const { setIsCreateModalVisible, fetchPeople } = usePeopleContext();

    const [form] = Form.useForm<Values>();

    const app = App.useApp();

    const close = () => setIsCreateModalVisible(false);

    const onFinish = async (values: Values) => {
        setIsSending(true);

        const response = await createPerson({
            ...values,
            birth_date: values.birth_date.format('YYYY-MM-DD'),
        });

        /* Tempo para aparecer o loading */
        await sleep(1000);

        setIsSending(false);

        if (hasServiceError(response)) {
            return handleServiceError(app, response, err => {

                if (err.statusCode === 409)
                    return 'Já existe uma pessoa cadastrada com este CPF.';
                if (err.statusCode === 500 && err.error.description.includes('Duplicate entry'))
                    return 'Este CPF pertence a um cadastro excluído anteriormente e não pode ser reutilizado.';
                return null;
                
            });
        }

        close();
        fetchPeople();
    };

    return (
        <Modal
            open
            title="Cadastrar pessoa"
            confirmLoading={isSending}
            onOk={form.submit}
            okText="Cadastrar"
            onCancel={close}
            cancelText="Cancelar"
        >
            <Divider />

            <Form
                form={form}
                onFinish={onFinish}
                name="createPerson"
                layout="vertical"
                autoComplete="off"
            >
                <PersonFields />
            </Form>
        </Modal>
    );
}
