import React, {useEffect, useState} from 'react';

import {useTranslation} from 'react-i18next';

import {useDebounce} from '@os/phone/hooks/useDebounce';
import {useSetContactFilterInput} from '../../hooks/state';
import {NPWDInput, NPWDSearchInput} from '@ui/components';
import {Search} from "lucide-react";

export const SearchContacts: React.FC = () => {
    const [t] = useTranslation();
    const setFilterVal = useSetContactFilterInput();
    const [inputVal, setInputVal] = useState('');

    const debouncedVal = useDebounce<string>(inputVal, 500);

    useEffect(() => {
        setFilterVal(debouncedVal);
    }, [debouncedVal, setFilterVal]);

    // No box of its own -- ContactList supplies the floating pill this sits
    // inside, matching the Control Center/dock glass convention.
    return (
        <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 shrink-0 text-neutral-400"/>
            <NPWDInput
                className="flex-1 bg-transparent"
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={t('CONTACTS.PLACEHOLDER_SEARCH_CONTACTS')}
                value={inputVal}
            />
        </div>
    );
};
