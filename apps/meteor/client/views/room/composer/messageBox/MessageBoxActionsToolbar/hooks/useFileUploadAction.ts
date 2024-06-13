import { useTranslation, useSetting } from '@rocket.chat/ui-contexts';
import { useEffect } from 'react';

import type { GenericMenuItemProps } from '../../../../../../components/GenericMenu/GenericMenuItem';
import { useFileInput } from '../../../../../../hooks/useFileInput';
import { useChat } from '../../../../contexts/ChatContext';

const fileInputProps = { type: 'file', multiple: true };

export const useFileUploadAction = (disabled: boolean): GenericMenuItemProps => {
	const t = useTranslation();
	const fileUploadEnabled = useSetting<boolean>('FileUpload_Enabled');
	const fileInputRef = useFileInput(fileInputProps);
	const chat = useChat();

	useEffect(() => {
		const resetFileInput = () => {
			if (!fileInputRef?.current) {
				return;
			}

			fileInputRef.current.value = '';
		};

		const handleUploadChange = async () => {
			const { mime } = await import('../../../../../../../app/utils/lib/mimeTypes');
			const filesToUpload = Array.from(fileInputRef?.current?.files ?? []).map((file) => {
				const fileMimeType = mime.lookup(file.name);
				Object.defineProperty(file, 'type', {
					value: typeof fileMimeType === 'string' ? fileMimeType : 'application/octet-stream',
				});
				return file;
			});
			chat?.flows.uploadFiles(filesToUpload, resetFileInput);
		};

		fileInputRef.current?.addEventListener('change', handleUploadChange);
		return () => fileInputRef?.current?.removeEventListener('change', handleUploadChange);
	}, [chat, fileInputRef]);

	const handleUpload = () => {
		fileInputRef?.current?.click();
	};

	return {
		id: 'file-upload',
		content: t('Upload_file'),
		icon: 'clip',
		onClick: handleUpload,
		disabled: !fileUploadEnabled || disabled,
	};
};
