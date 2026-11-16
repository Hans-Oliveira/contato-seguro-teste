import { Fragment } from 'react';

import { DatePicker, Form, Input } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';

import { isValidCPF } from '@brazilian-utils/brazilian-utils';

export type Values = {
    name: string;
    cpf: string;
    email: string;
    birth_date: Dayjs;
};

export function PersonFields() {
    return (
        <Fragment>
            <Form.Item<Values>
                name="name"
                label="Nome completo"
                rules={[{ required: true, message: 'Por favor, digite um nome.' }]}
            >
                <Input placeholder="Nome completo" />
            </Form.Item>

            <Form.Item<Values>
                name="cpf"
                label="CPF"
                normalize={(value: string) => value.replace(/\D/g, '').slice(0, 11)}
                rules={[
                    { required: true, message: 'Por favor, digite um CPF.' },
                    { len: 11, message: 'O CPF deve ter 11 dígitos.' },
                    { pattern: /^\d{11}$/, message: 'O CPF deve conter apenas números.' },
                    {
                        validator: (_, value) =>
                            !value || value.length !== 11 || isValidCPF(value)
                                ? Promise.resolve()
                                : Promise.reject(new Error('CPF inválido.')),
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

            <Form.Item<Values>
                name="birth_date"
                label="Data de Nascimento"
                rules={[
                    { required: true, message: 'Por favor, informe a data de nascimento completa.' },
                    {
                        validator: (_, value: Dayjs) =>
                            !value || !value.isAfter(dayjs(), 'day')
                                ? Promise.resolve()
                                : Promise.reject(new Error('A data de nascimento não pode ser no futuro.')),
                    },
                ]}
            >
                <DatePicker
                    format={['DD/MM/YYYY', 'DDMMYYYY']}
                    placeholder="DD/MM/AAAA"
                    disabledDate={current => current && current.isAfter(dayjs(), 'day')}
                    style={{ width: '100%' }}
                />
            </Form.Item>
        </Fragment>
    );
}
