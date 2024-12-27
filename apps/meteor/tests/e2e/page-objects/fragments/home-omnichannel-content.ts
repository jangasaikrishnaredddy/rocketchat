import type { Locator, Page } from '@playwright/test';

import { OmnichannelTransferChatModal } from '../omnichannel-transfer-chat-modal';
import { HomeContent } from './home-content';
import { OmnichannelCloseChatModal } from './omnichannel-close-chat-modal';

export class HomeOmnichannelContent extends HomeContent {
	readonly closeChatModal: OmnichannelCloseChatModal;

	readonly forwardChatModal: OmnichannelTransferChatModal;

	constructor(page: Page) {
		super(page);
		this.closeChatModal = new OmnichannelCloseChatModal(page);
		this.forwardChatModal = new OmnichannelTransferChatModal(page);
	}

	get btnReturnToQueue(): Locator {
		return this.page.locator('role=button[name="Move to the queue"]');
	}

	get modalReturnToQueue(): Locator {
		return this.page.locator('[data-qa-id="return-to-queue-modal"]');
	}

	get btnReturnToQueueConfirm(): Locator {
		return this.modalReturnToQueue.locator('role=button[name="Confirm"]');
	}

	get btnReturnToQueueCancel(): Locator {
		return this.modalReturnToQueue.locator('role=button[name="Cancel"]');
	}

	get btnTakeChat(): Locator {
		return this.page.locator('role=button[name="Take it!"]');
	}

	get inputMessage(): Locator {
		return this.page.locator('[name="msg"]');
	}

	get toolbarActions(): Locator {
		return this.channelHeader.getByRole('toolbar', { name: 'Omnichannel Quick Actions', exact: true });
	}

	get primaryRoomActions(): Locator {
		return this.channelHeader.getByRole('toolbar', { name: 'Primary Room actions', exact: true });
	}

	get btnEndConversation(): Locator {
		return this.toolbarActions.getByRole('button', { name: 'End conversation', exact: true });
	}

	get btnForwardChat(): Locator {
		return this.toolbarActions.getByRole('button', { name: 'Forward chat', exact: true });
	}

	get btnCloseChat(): Locator {
		return this.page.locator('[data-qa-id="ToolBoxAction-balloon-close-top-right"]');
	}

	get btnGuestInfo(): Locator {
		return this.page.locator('[data-qa-id="ToolBoxAction-user"]');
	}

	get infoContactEmail(): Locator {
		return this.page.getByRole('dialog').locator('p[data-type="email"]');
	}

	get btnRoomInfo(): Locator {
		return this.primaryRoomActions.getByRole('button', { name: 'Room Information', exact: true });
	}

	get btnSearchMessages(): Locator {
		return this.primaryRoomActions.getByRole('button', { name: 'Search Messages', exact: true });
	}

	get btnFiles(): Locator {
		return this.primaryRoomActions.getByRole('button', { name: 'Files', exact: true });
	}

	get btnCannedResponses(): Locator {
		return this.primaryRoomActions.getByRole('button', { name: 'Canned Responses', exact: true });
	}

	get btnContactInformation(): Locator {
		return this.primaryRoomActions.getByRole('button', { name: 'Contact Information', exact: true });
	}

	get infoContactName(): Locator {
		return this.page.locator('[data-qa-id="contactInfo-name"]');
	}

	get btnReturn(): Locator {
		return this.page.locator('[data-qa-id="ToolBoxAction-back"]');
	}

	get btnResume(): Locator {
		return this.page.locator('role=button[name="Resume"]');
	}

	get modalOnHold(): Locator {
		return this.page.locator('[data-qa-id="on-hold-modal"]');
	}

	get btnEditRoomInfo(): Locator {
		return this.page.locator('button[data-qa-id="room-info-edit"]');
	}

	get btnOnHoldConfirm(): Locator {
		return this.modalOnHold.locator('role=button[name="Place chat On-Hold"]');
	}

	get infoHeaderName(): Locator {
		return this.page.locator('.rcx-room-header').getByRole('heading');
	}
}
