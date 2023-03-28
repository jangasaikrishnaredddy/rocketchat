import { useEndpoint, useSetModal, useToastMessageDispatch, useTranslation } from '@rocket.chat/ui-contexts';
import { useMutation } from '@tanstack/react-query';
import React from 'react';

import GenericModal from '../../../../components/GenericModal';

const useDeleteMessage = (mid: string, rid: string, onChange: () => void, onReload: () => void) => {
	const t = useTranslation();
	const deleteMessage = useEndpoint('POST', '/v1/chat.delete');
	const dismissMessage = useEndpoint('POST', '/v1/moderation.markChecked');
	const dispatchToastMessage = useToastMessageDispatch();
	const setModal = useSetModal();

	const handleDeleteMessages = useMutation({
		mutationFn: deleteMessage,
		onError: (error) => {
			dispatchToastMessage({ type: 'error', message: error });
		},
		onSuccess: () => {
			dispatchToastMessage({ type: 'success', message: t('Deleted') });
		},
	});

	const handleDismissMessage = useMutation({
		mutationFn: dismissMessage,
		onError: (error) => {
			dispatchToastMessage({ type: 'error', message: error });
		},
		onSuccess: () => {
			dispatchToastMessage({ type: 'success', message: t('Approved') });
		},
	});

	const onDeleteAll = async () => {
		await handleDeleteMessages.mutateAsync({ msgId: mid, roomId: rid, asUser: true });
		await handleDismissMessage.mutateAsync({ msgId: mid });
		onChange();
		onReload();
		setModal();
	};

	const confirmDeletMessage = (): void => {
		setModal(
			<GenericModal title={t('Delete_message')} variant='danger' onConfirm={() => onDeleteAll()} onCancel={() => setModal()}>
				Are you sure you want to delete this message? The message will be deleted from the message history and no onw will be able to see
				it. This action cannot be undone.
			</GenericModal>,
		);
	};

	return confirmDeletMessage;
};

export default useDeleteMessage;
