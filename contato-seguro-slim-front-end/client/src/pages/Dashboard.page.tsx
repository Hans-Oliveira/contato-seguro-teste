import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
    Alert,
    App,
    Button,
    Card,
    Col,
    List,
    Progress,
    Row,
    Space,
    Spin,
    Statistic,
    Tag,
    Typography,
} from 'antd';

import {
    AuditOutlined,
    BuildOutlined,
    SafetyCertificateOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { listCompanies } from '@domain/company/api/list-companies.service';
import { listInvolvements } from '@domain/involvement/api/list-involvements.service';
import { listPeople } from '@domain/person/api/list-people.service';
import { listRecords } from '@domain/record/api/list-records.service';
import type { Record } from '@domain/record/record.type';

const STATUS_META: { key: Record.Status; label: string; color: string }[] = [
    { key: 'awaiting_investigation', label: 'Aguardando investigação', color: '#1677ff' },
    { key: 'investigation_in_progress', label: 'Investigação em andamento', color: '#faad14' },
    { key: 'resolved', label: 'Resolvido', color: '#52c41a' },
    { key: 'archived', label: 'Arquivado', color: '#8c8c8c' },
];

export function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [companiesCount, setCompaniesCount] = useState(0);
    const [peopleCount, setPeopleCount] = useState(0);
    const [records, setRecords] = useState<Record.Model[]>([]);
    const [anonymityMap, setAnonymityMap] = useState<{ [id: number]: boolean }>({});

    const navigate = useNavigate();
    const app = App.useApp();

    useEffect(() => {
        async function loadDashboard() {
            setIsLoading(true);

            const [companiesRes, peopleRes, recordsRes] = await Promise.all([
                listCompanies(),
                listPeople(),
                listRecords(),
            ]);

            if (hasServiceError(companiesRes)) {
                setIsLoading(false);
                return handleServiceError(app, companiesRes);
            }
            if (hasServiceError(peopleRes)) {
                setIsLoading(false);
                return handleServiceError(app, peopleRes);
            }
            if (hasServiceError(recordsRes)) {
                setIsLoading(false);
                return handleServiceError(app, recordsRes);
            }

            const loadedRecords = recordsRes.data.records;
            setCompaniesCount(companiesRes.data.companies.length);
            setPeopleCount(peopleRes.data.people.length);
            setRecords(loadedRecords);

            const involvementResponses = await Promise.all(
                loadedRecords.map(r => listInvolvements(r.id)),
            );

            const map: { [id: number]: boolean } = {};
            loadedRecords.forEach((r, index) => {
                const res = involvementResponses[index];
                if (!hasServiceError(res)) {
                    map[r.id] = res.data.is_anonymous;
                }
            });

            setAnonymityMap(map);
            setIsLoading(false);
        }

        loadDashboard();
    }, [app]);

    const totalRecords = records.length;
    const anonymousCount = records.filter(r => anonymityMap[r.id]).length;
    const identifiedCount = totalRecords - anonymousCount;
    const anonymousPercent = totalRecords > 0
        ? Math.round((anonymousCount / totalRecords) * 100)
        : 0;

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
                <Typography.Title level={3} style={{ marginBottom: 12 }}>
                    Bem-vindo(a) ao Contato Seguro Slim!
                </Typography.Title>

                <Alert
                    type="warning"
                    showIcon
                    message="Aviso sobre os dados de exemplo"
                    description="Os dados cadastrados neste ambiente são meramente ilustrativos e foram gerados para fins de desenvolvimento e teste. Empresas, relatos e demais informações são fictícios. Qualquer semelhança com pessoas, empresas ou situações reais é mera coincidência."
                />
            </div>

            <Spin spinning={isLoading}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} lg={6}>
                            <Card hoverable onClick={() => navigate('/companies')}>
                                <Statistic
                                    title="Empresas"
                                    value={companiesCount}
                                    prefix={<BuildOutlined style={{ color: '#1677ff' }} />}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card hoverable onClick={() => navigate('/people')}>
                                <Statistic
                                    title="Pessoas"
                                    value={peopleCount}
                                    prefix={<UserOutlined style={{ color: '#722ed1' }} />}
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card hoverable onClick={() => navigate('/records')}>
                                <Statistic
                                    title="Total de Relatos"
                                    value={totalRecords}
                                    prefix={<AuditOutlined style={{ color: '#52c41a' }} />}
                                    suffix={
                                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                            ({identifiedCount} ident. / {anonymousCount} anôn.)
                                        </Typography.Text>
                                    }
                                />
                            </Card>
                        </Col>

                        <Col xs={24} sm={12} lg={6}>
                            <Card>
                                <Statistic
                                    title="Taxa de Anonimato"
                                    value={anonymousPercent}
                                    suffix="%"
                                    prefix={<SafetyCertificateOutlined style={{ color: '#faad14' }} />}
                                />
                                <Progress
                                    percent={anonymousPercent}
                                    showInfo={false}
                                    strokeColor="#faad14"
                                    size="small"
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <Card title="Relatos por Status">
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                    {STATUS_META.map(status => {
                                        const count = records.filter(r => r.status === status.key).length;
                                        const percent = totalRecords > 0
                                            ? Math.round((count / totalRecords) * 100)
                                            : 0;

                                        return (
                                            <div key={status.key}>
                                                <Row justify="space-between">
                                                    <Typography.Text>{status.label}</Typography.Text>
                                                    <Typography.Text strong>
                                                        {count} ({percent}%)
                                                    </Typography.Text>
                                                </Row>
                                                <Progress
                                                    percent={percent}
                                                    showInfo={false}
                                                    strokeColor={status.color}
                                                />
                                            </div>
                                        );
                                    })}
                                </Space>
                            </Card>
                        </Col>

                        <Col xs={24} lg={12}>
                            <Card
                                title="Relatos Recentes"
                                extra={(
                                    <Button type="link" size="small" onClick={() => navigate('/records')}>
                                        Ver todos
                                    </Button>
                                )}
                            >
                                <List
                                    dataSource={[...records].reverse().slice(0, 5)}
                                    locale={{ emptyText: 'Nenhum relato cadastrado.' }}
                                    renderItem={item => {
                                        const isAnonymous = anonymityMap[item.id];

                                        return (
                                            <List.Item
                                                extra={
                                                    isAnonymous !== undefined && (
                                                        <Tag color={isAnonymous ? 'orange' : 'green'}>
                                                            {isAnonymous ? 'Anônimo' : 'Identificado'}
                                                        </Tag>
                                                    )
                                                }
                                            >
                                                <Typography.Text ellipsis>
                                                    #{item.id} {item.title}
                                                </Typography.Text>
                                            </List.Item>
                                        );
                                    }}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Space>
            </Spin>
        </Space>
    );
}
