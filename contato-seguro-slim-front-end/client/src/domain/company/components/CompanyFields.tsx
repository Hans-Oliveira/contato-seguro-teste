import { Fragment } from 'react';

import { Form, Input } from 'antd';

import { isValidCNPJ } from '@brazilian-utils/brazilian-utils';

export type Values = {
    name: string;
    cnpj: string;
    email: string;
};

export function CompanyFields() {
    return (
        <Fragment>
            <Form.Item<Values>
                name="name"
                label="Nome"
                rules={[{ required: true, message: 'Por favor, digite um nome.' }]}
            >
                <Input placeholder="Nome da empresa" />
            </Form.Item>

            <Form.Item<Values>
                name="cnpj"
                label="CNPJ"
                normalize={(value: string) => value.replace(/\D/g, '').slice(0, 14)}
                rules={[
                    { required: true, message: 'Por favor, digite um CNPJ.' },
                    { len: 14, message: 'O CNPJ deve ter 14 dígitos.' },
                    { pattern: /^\d{14}$/, message: 'O CNPJ deve conter apenas números.' },
                    {
                        validator: (_, value) =>
                            !value || value.length !== 14 || isValidCNPJ(value)
                                ? Promise.resolve()
                                : Promise.reject(new Error('CNPJ inválido.')),
                    },
                ]}
            >
                <Input placeholder="Somente números, sem pontuação" />
            </Form.Item>

            <Form.Item<Values>
                name="email"
                label="E-mail"
                rules={[
                    { required: true, message: 'Por favor, digite um e-mail.' },
                    { type: 'email', message: 'Por favor, digite um e-mail válido.' },
                ]}
            >
                <Input placeholder="E-mail de contato" />
            </Form.Item>
        </Fragment>
    );
}
