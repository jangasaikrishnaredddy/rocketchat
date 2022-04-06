import { Button, Box, ButtonGroup, Icon, Modal } from '@rocket.chat/fuselage';
import React, { FC } from 'react';

import { useTranslation } from '../../../../contexts/TranslationContext';

type OTRModalProps = {
	onCancel: () => void;
	onConfirm: () => void;
	confirmLabel: string;
};

const OTRModal: FC<OTRModalProps> = ({ onCancel, onConfirm, confirmLabel = 'Ok', ...props }) => {
	const t = useTranslation();
	return (
		<Modal {...props}>
			<Modal.Header>
				<Modal.Title>{t('Timeout')}</Modal.Title>
				<Modal.Close onClick={onCancel} />
			</Modal.Header>
			<Modal.Content>
				<Box textAlign='center' color='danger-500'>
					<Icon size='x82' name='circle-cross' />
				</Box>
			</Modal.Content>
			<Modal.Footer>
				<ButtonGroup align='end'>
					<Button primary onClick={onConfirm}>
						{confirmLabel}
					</Button>
				</ButtonGroup>
			</Modal.Footer>
		</Modal>
	);
};

export default OTRModal;
