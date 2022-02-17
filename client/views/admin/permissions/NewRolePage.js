import { Box, ButtonGroup, Button, Margins } from '@rocket.chat/fuselage';
import { useMutableCallback } from '@rocket.chat/fuselage-hooks';
import React from 'react';

import VerticalBar from '../../../components/VerticalBar';
import { useRoute } from '../../../contexts/RouterContext';
import { useEndpoint } from '../../../contexts/ServerContext';
import { useToastMessageDispatch } from '../../../contexts/ToastMessagesContext';
import { useTranslation } from '../../../contexts/TranslationContext';
import { useForm } from '../../../hooks/useForm';
import RoleForm from './RoleForm';

const NewRolePage = () => {
	const t = useTranslation();
	const router = useRoute('admin-permissions');
	const dispatchToastMessage = useToastMessageDispatch();

	const { values, handlers } = useForm({
		name: '',
		description: '',
		scope: 'Users',
		mandatory2fa: false,
		error: { name: '' },
	});
	const errorExists = () => Object.keys(values.error).length > 0;

	const saveRole = useEndpoint('POST', 'roles.create');

	const handleSave = useMutableCallback(async () => {
		try {
			if (!errorExists()) {
				const newValues = { ...values };
				delete newValues.error;
				await saveRole(newValues);
				dispatchToastMessage({ type: 'success', message: t('Saved') });
				router.push({});
			}
		} catch (error) {
			dispatchToastMessage({ type: 'error', message: error });
		}
	});

	const validator = () => {
		if (!values.name) {
			const newError = { ...values.error, name: 'Role cannot be empty' };
			handlers.handleError(newError);
		} else {
			const newError = { ...values.error, name: '' };
			delete newError.name;
			handlers.handleError(newError);
		}
	};

	return (
		<>
			<VerticalBar.ScrollableContent>
				<Box w='full' alignSelf='center' mb='neg-x8'>
					<Margins block='x8'>
						<RoleForm values={values} handlers={handlers} validators={validator} />
					</Margins>
				</Box>
			</VerticalBar.ScrollableContent>
			<VerticalBar.Footer>
				<ButtonGroup stretch w='full'>
					<Button disabled={errorExists()} primary onClick={handleSave}>
						{t('Save')}
					</Button>
				</ButtonGroup>
			</VerticalBar.Footer>
		</>
	);
};

export default NewRolePage;
