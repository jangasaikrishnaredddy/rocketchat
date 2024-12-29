import type { Page } from '@playwright/test';

import { createFakeVisitor } from '../../mocks/data';
import { IS_EE } from '../config/constants';
import { createAuxContext } from '../fixtures/createAuxContext';
import { Users } from '../fixtures/userStates';
import { HomeOmnichannel, OmnichannelLiveChat } from '../page-objects';
import { expect, test } from '../utils/test';

test.use({ storageState: Users.user1.state });

test.describe('OC - Room Management', () => {
	test.skip(!IS_EE, 'Enterprise Edition Only');

	let poLiveChat: OmnichannelLiveChat;
	let poHomeOmnichannel: HomeOmnichannel;
	let newVisitor: { email: string; name: string };
	let agent: { page: Page; poHomeChannel: HomeOmnichannel };

	test.beforeAll(async ({ api, browser }) => {
		await Promise.all([
			api.post('/livechat/users/agent', { username: 'user1' }).then((res) => expect(res.status()).toBe(200)),
			api.post('/settings/Livechat_Routing_Method', { value: 'Auto_Selection' }).then((res) => expect(res.status()).toBe(200)),
			api.post('/settings/Livechat_auto_close_on_hold_chats_timeout', { value: 5 }).then((res) => expect(res.status()).toBe(200)),
			api.post('/settings/Livechat_allow_manual_on_hold', { value: true }).then((res) => expect(res.status()).toBe(200)),
		]);

		const { page } = await createAuxContext(browser, Users.user1);
		agent = { page, poHomeChannel: new HomeOmnichannel(page) };
	});

	test.afterAll(async ({ api }) => {
		await agent.page.close();

		await Promise.all([
			api.delete('/livechat/users/agent/user1').then((res) => expect(res.status()).toBe(200)),
			api.post('/settings/Livechat_auto_close_on_hold_chats_timeout', { value: 3600 }).then((res) => expect(res.status()).toBe(200)),
			api.post('/settings/Livechat_allow_manual_on_hold', { value: false }).then((res) => expect(res.status()).toBe(200)),
		]);
	});

	test.beforeEach(async ({ page, api }) => {
		// make "user-1" online
		await agent.poHomeChannel.sidenav.switchStatus('online');

		// start a new chat for each test
		newVisitor = createFakeVisitor();
		poLiveChat = new OmnichannelLiveChat(page, api);
		poHomeOmnichannel = new HomeOmnichannel(page);
		await page.goto('/livechat');
		await poLiveChat.openLiveChat();
		await poLiveChat.sendMessage(newVisitor, false);
		await poLiveChat.onlineAgentMessage.fill('this_a_test_message_from_user');
		await poLiveChat.btnSendMessageToOnlineAgent.click();
	});

	test('should show toolbar items', async () => {
		await poHomeOmnichannel.page.goto('/home');
		await poHomeOmnichannel.sidenav.openChat(newVisitor.name);

		const { btnCannedResponses } = poHomeOmnichannel.content;
		await expect(btnCannedResponses).toBeVisible();

		const { btnContactInformation } = poHomeOmnichannel.content;
		await expect(btnContactInformation).toBeVisible();

		const { btnRoomInfo } = poHomeOmnichannel.content;
		await expect(btnRoomInfo).toBeVisible();

		const { btnSearchMessages } = poHomeOmnichannel.content;
		await expect(btnSearchMessages).toBeVisible();

		const { btnFiles } = poHomeOmnichannel.content;
		await expect(btnFiles).toBeVisible();
	});

	test('should only show apps actions inside `Options` menu', async () => {
		await poHomeOmnichannel.page.goto('/home');
		await poHomeOmnichannel.sidenav.openChat(newVisitor.name);

		const { btnOptions } = poHomeOmnichannel.content;
		await expect(btnOptions).toBeVisible();
		await btnOptions.click();
		await expect(poHomeOmnichannel.content.channelHeader.getByRole('group', { name: 'Apps' })).toBeVisible();
	});
});
