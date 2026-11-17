import {
    createContext,
    type Dispatch,
    type ReactNode,
    type SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { App } from 'antd';

import { handleServiceError, hasServiceError } from '@domain/@shared/service.helper';
import { UnknownContextError } from '@domain/@shared/unknown-context-error';
import { listInvolvements } from '@domain/involvement/api/list-involvements.service';

import { listRecords } from './api/list-records.service';
import type { Record } from './record.type';

type AnonymityMap = { [recordId: number]: boolean };

type Value = {
    records: Record.Model[];
    record: Record.Model | null;
    recordId: Record.Model['id'] | null;
    setRecordId: Dispatch<SetStateAction<Value['recordId']>>;
    anonymityMap: AnonymityMap;
    setRecordAnonymity: (id: number, isAnonymous: boolean) => void;
    isLoading: boolean;
    isCreateModalVisible: boolean;
    setIsCreateModalVisible: Dispatch<SetStateAction<Value['isCreateModalVisible']>>;
    isEditModalVisible: boolean;
    setIsEditModalVisible: Dispatch<SetStateAction<Value['isEditModalVisible']>>;
    isInvolvementsModalVisible: boolean;
    setIsInvolvementsModalVisible: Dispatch<SetStateAction<Value['isInvolvementsModalVisible']>>;
    fetchRecords: () => Promise<void>;
};

type Props = { children: (value: Value) => ReactNode };

// eslint-disable-next-line react-refresh/only-export-components
export const RecordsContext = createContext<Value | null>(null);

/** @see https://www.youtube.com/watch?v=I7dwJxGuGYQ */
export function RecordsContextProvider({ children }: Props) {
    const [isLoading, setIsLoading] = useState<Value['isLoading']>(true);
    const [records, setRecords] = useState<Value['records']>([]);
    const [recordId, setRecordId] = useState<Record.Model['id'] | null>(null);
    const [anonymityMap, setAnonymityMap] = useState<AnonymityMap>({});
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isInvolvementsModalVisible, setIsInvolvementsModalVisible] = useState(false);

    const app = App.useApp();

    const setRecordAnonymity = useCallback((id: number, isAnonymous: boolean) => {
        setAnonymityMap(prev => ({ ...prev, [id]: isAnonymous }));
    }, []);

    const fetchRecords = useCallback(async () => {
        setIsLoading(true);

        const response = await listRecords();

        if (hasServiceError(response)) {
            setIsLoading(false);
            return handleServiceError(app, response);
        }

        const loadedRecords = response.data.records;
        setRecords(loadedRecords);

        const involvementResponses = await Promise.all(
            loadedRecords.map(r => listInvolvements(r.id)),
        );

        const nextMap: AnonymityMap = {};
        loadedRecords.forEach((r, index) => {
            const res = involvementResponses[index];
            if (!hasServiceError(res)) {
                nextMap[r.id] = res.data.is_anonymous;
            }
        });
        setAnonymityMap(nextMap);

        setIsLoading(false);
    }, [app]);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const record = useMemo(() => {
        if (!recordId) return null;

        const found = records.find(r => r.id === recordId);

        if (!found)
            throw new Error(`Could not find a record with id ${recordId}`);

        return found;
    }, [records, recordId]);

    const value: Value = {
        isLoading,
        records,
        record,
        recordId,
        setRecordId,
        anonymityMap,
        setRecordAnonymity,
        isCreateModalVisible,
        setIsCreateModalVisible,
        isEditModalVisible,
        setIsEditModalVisible,
        isInvolvementsModalVisible,
        setIsInvolvementsModalVisible,
        fetchRecords,
    };

    return (
        <RecordsContext.Provider value={value}>
            {children(value)}
        </RecordsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRecordsContext() {
    const context = useContext(RecordsContext);

    if (!context)
        throw new UnknownContextError();

    return context;
}