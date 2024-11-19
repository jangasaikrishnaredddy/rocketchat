import type { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import UninstallGrandfatheredAppModal from './UninstallGrandfatheredAppModal';

export default {
	title: 'Marketplace/components/UninstallGrandfatheredAppModal',
	component: UninstallGrandfatheredAppModal,
	parameters: {
		layout: 'centered',
	},
} satisfies Meta<typeof UninstallGrandfatheredAppModal>;

const Template: StoryFn<typeof UninstallGrandfatheredAppModal> = (args) => <UninstallGrandfatheredAppModal {...args} />;

export const Default = Template.bind({});
