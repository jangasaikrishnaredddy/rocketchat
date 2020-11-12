import React from 'react';
import { Box, Divider } from '@rocket.chat/fuselage';

import { useTranslation } from '../../contexts/TranslationContext';
import VerticalBar from './VerticalBar';

const ShortcutSection = ({ title, command }) =>
	<Box is='section' mb='x16'>
		<Box fontSize='x16' fontWeight='700'>{title}</Box>
		<Divider />
		<Box dangerouslySetInnerHTML={{ __html: command }} />
	</Box>;

const KeyboardShortcuts = () => {
	const t = useTranslation();

	return (
		<>
			<VerticalBar.Header>
				<VerticalBar.Icon name='keyboard'/>
				<VerticalBar.Text>{t('Keyboard_Shortcuts_Title')}</VerticalBar.Text>
				<VerticalBar.Close />
			</VerticalBar.Header>
			<VerticalBar.ScrollableContent>
				<ShortcutSection
					title={t('Keyboard_Shortcuts_Open_Channel_Slash_User_Search')}
					command={t('Keyboard_Shortcuts_Keys_1')}
				/>
				<ShortcutSection
					title={t('Keyboard_Shortcuts_Mark_all_as_read')}
					command={t('Keyboard_Shortcuts_Keys_8')}
				/>
				<ShortcutSection
					title={t('Keyboard_Shortcuts_Edit_Previous_Message')}
					command={t('Keyboard_Shortcuts_Keys_2')}
				/>
				<ShortcutSection
					title={t('Keyboard_Shortcuts_Move_To_Beginning_Of_Message')}
					command={t('Keyboard_Shortcuts_Keys_3')}
				/>
				<ShortcutSection
					title={t('Keyboard_Shortcuts_Move_To_Beginning_Of_Message')}
					command={t('Keyboard_Shortcuts_Keys_4')}
				/>
				<ShortcutSection
					title={t('Keyboard_Shortcuts_Move_To_End_Of_Message')}
					command={t('Keyboard_Shortcuts_Keys_5')}
				/>
				<ShortcutSection
					title={t('Keyboard_Shortcuts_Move_To_End_Of_Message')}
					command={t('Keyboard_Shortcuts_Keys_6')}
				/>
				<ShortcutSection
					title={t('Keyboard_Shortcuts_New_Line_In_Message')}
					command={t('Keyboard_Shortcuts_Keys_7')}
				/>
			</VerticalBar.ScrollableContent>
		</>
	);
};

export default React.memo(KeyboardShortcuts);
