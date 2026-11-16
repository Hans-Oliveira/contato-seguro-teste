import { Fragment } from 'react';

import { Button, Row, type TableColumnsType, Typography } from 'antd';
import dayjs from 'dayjs';

import { formatCPF } from '@brazilian-utils/brazilian-utils';
import { Show } from '@domain/@shared/Show';
import { Table } from '@domain/@shared/Table';
import { CreatePersonModal } from '@domain/person/components/CreatePersonModal';
import { EditPersonModal } from '@domain/person/components/EditPersonModal';
import { PeopleActionsCell } from '@domain/person/components/PeopleActionsCell';
import { PeopleContextProvider } from '@domain/person/Person.context';
import type { Person } from '@domain/person/person.type';

const COLUMNS: TableColumnsType<Person.Model> = [
    {
        title: 'ID',
        dataIndex: 'id',
        render: value => `#${value}`,
    },
    {
        title: 'Nome',
        dataIndex: 'name',
    },
    {   
        title: 'CPF',
        dataIndex: 'cpf',
        render: (value: string) => formatCPF(value),
    },
    {
        title: 'E-mail',
        dataIndex: 'email',
    },
    {
        title: 'Data de Nascimento',
        dataIndex: 'birth_date',
        render: (value: string) => dayjs(value).format('DD/MM/YYYY'),
    },
    {
        render: (_, person) => <PeopleActionsCell person={person} />,
    },
];

export function People() {
    return (
        <PeopleContextProvider>
            {({
                isLoading,
                people,
                setIsCreateModalVisible,
                isCreateModalVisible,
                isEditModalVisible,
            }) => (
                <Fragment>
                    <main>
                        <Row justify="space-between" align="middle">
                            <Typography.Title level={3}>
                                Pessoas
                            </Typography.Title>

                            <Button
                                type="primary"
                                onClick={() => setIsCreateModalVisible(true)}
                            >
                                Cadastrar
                            </Button>
                        </Row>

                        <Table
                            columns={COLUMNS}
                            dataSource={people}
                            loading={isLoading}
                        />
                    </main>

                    <Show when={isCreateModalVisible}>
                        <CreatePersonModal />
                    </Show>

                    <Show when={isEditModalVisible}>
                        <EditPersonModal />
                    </Show>
                </Fragment>
            )}
        </PeopleContextProvider>
    );
}
