import { Box, TextInput, Icon } from '@rocket.chat/fuselage';
import { useTranslation } from '@rocket.chat/ui-contexts';
import React, { useCallback, useState, useEffect, memo } from 'react';

import { isValidRegex } from '../../../lib/utils/validateRegex';

const FilterByTypeAndText = ({ setFilter, ...props }) => {
	const t = useTranslation();

	const [text, setText] = useState('');

	const handleChange = useCallback((event) => setText(event.currentTarget.value), []);

	useEffect(() => {
		setFilter({ text });
	}, [setFilter, text]);

	return (
		<Box mb='x16' is='form' onSubmit={useCallback((e) => e.preventDefault(), [])} display='flex' flexDirection='column' {...props}>
			<TextInput placeholder={t('Search_Integrations')} addon={<Icon name='magnifier' size='x20' />} onChange={handleChange} value={text} />
			{!isValidRegex(text) && (
				<Box mbs='x4' color='danger'>
					{t('Invalid_search_terms')}
				</Box>
			)}
		</Box>
	);
};

export default memo(FilterByTypeAndText);
