/* eslint-disable no-restricted-properties */
import type { ILivechatDepartment, IUser } from '@rocket.chat/core-typings';
import { expect } from 'chai';
import { before, describe, it } from 'mocha';
import moment from 'moment';
import type { Response } from 'supertest';

import { getCredentials, api, request, credentials } from '../../../data/api-data';
import { createDepartmentWithAnOnlineAgent } from '../../../data/livechat/department';
import { startANewLivechatRoomAndTakeIt } from '../../../data/livechat/rooms';
import { createAnOnlineAgent } from '../../../data/livechat/users';
import { updatePermission, updateSetting } from '../../../data/permissions.helper';
import type { IUserCredentialsHeader } from '../../../data/user';
import { IS_EE } from '../../../e2e/config/constants';

describe('LIVECHAT - dashboards', function () {
	this.retries(0);

	before((done) => getCredentials(done));

	before(async () => {
		await updateSetting('Livechat_enabled', true);
	});

	let department: ILivechatDepartment;
	const agents: {
		credentials: IUserCredentialsHeader;
		user: IUser;
	}[] = [];

	before(async () => {
		if (!IS_EE) {
			return;
		}

		// create dummy test data for further tests
		const { department: createdDept, agent: agent1 } = await createDepartmentWithAnOnlineAgent();
		department = createdDept;

		const agent2 = await createAnOnlineAgent();
		agents.push(agent1);
		agents.push(agent2);

		// agent 1 is serving 1 chat
		// agent 2 is serving 2 chats
		await startANewLivechatRoomAndTakeIt({ departmentId: department._id, agent: agent1.credentials });
		await startANewLivechatRoomAndTakeIt({ departmentId: department._id, agent: agent2.credentials });
		await startANewLivechatRoomAndTakeIt({ departmentId: department._id, agent: agent2.credentials });
	});

	describe('livechat/analytics/dashboards/conversation-totalizers', () => {
		const expectedMetrics = [
			'Total_conversations',
			'Open_conversations',
			'On_Hold_conversations',
			'Total_messages',
			'Busiest_time',
			'Total_abandoned_chats',
			'Total_visitors',
		];
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/dashboards/conversation-totalizers?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an array of conversation totalizers', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/dashboards/conversation-totalizers?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body.totalizers).to.be.an('array');
					(res.body.totalizers as { title: string; value: string }[]).forEach(
						(prop) => expect(expectedMetrics.includes(prop.title)).to.be.true,
					);
				});
		});
	});

	describe('livechat/analytics/dashboards/productivity-totalizers', () => {
		const expectedMetrics = ['Avg_response_time', 'Avg_first_response_time', 'Avg_reaction_time', 'Avg_of_waiting_time'];
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/dashboards/productivity-totalizers?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an array of productivity totalizers', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/dashboards/productivity-totalizers?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body.totalizers).to.be.an('array');
					(res.body.totalizers as { title: string; value: string }[]).forEach(
						(prop) => expect(expectedMetrics.includes(prop.title)).to.be.true,
					);
				});
		});
	});

	describe('livechat/analytics/dashboards/chats-totalizers', () => {
		const expectedMetrics = ['Total_abandoned_chats', 'Avg_of_abandoned_chats', 'Avg_of_chat_duration_time'];
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/dashboards/chats-totalizers?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an array of chats totalizers', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/dashboards/chats-totalizers?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body.totalizers).to.be.an('array');
					(res.body.totalizers as { title: string; value: string }[]).forEach(
						(prop) => expect(expectedMetrics.includes(prop.title)).to.be.true,
					);
				});
		});
	});

	describe('livechat/analytics/dashboards/agents-productivity-totalizers', () => {
		const expectedMetrics = ['Busiest_time', 'Avg_of_available_service_time', 'Avg_of_service_time'];
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(
					api('livechat/analytics/dashboards/agents-productivity-totalizers?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'),
				)
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an array of agents productivity totalizers', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(
					api('livechat/analytics/dashboards/agents-productivity-totalizers?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'),
				)
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body.totalizers).to.be.an('array');
					(res.body.totalizers as { title: string; value: string }[]).forEach(
						(prop) => expect(expectedMetrics.includes(prop.title)).to.be.true,
					);
				});
		});
	});

	describe('livechat/analytics/dashboards/charts/chats', () => {
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/dashboards/charts/chats?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an array of productivity totalizers', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/dashboards/charts/chats?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('open');
					expect(res.body).to.have.property('closed');
					expect(res.body).to.have.property('queued');
				});
		});
	});

	describe('livechat/analytics/dashboards/charts/chats-per-agent', () => {
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/dashboards/charts/chats-per-agent?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an object with open and closed chats by agent', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/dashboards/charts/chats-per-agent?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
				});
		});
	});

	describe('livechat/analytics/dashboards/charts/agents-status', () => {
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/dashboards/charts/agents-status'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an object with agents status metrics', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/dashboards/charts/agents-status'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('offline');
					expect(res.body).to.have.property('away');
					expect(res.body).to.have.property('busy');
					expect(res.body).to.have.property('available');
				});
		});
	});

	describe('livechat/analytics/dashboards/charts/chats-per-department', () => {
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/dashboards/charts/chats-per-department?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an object with open and closed chats by department', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/dashboards/charts/chats-per-department?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
				});
		});
	});

	describe('livechat/analytics/dashboards/charts/timings', () => {
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/dashboards/charts/timings?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an object with open and closed chats by department', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/dashboards/charts/timings?start=2019-10-25T15:08:17.248Z&end=2019-12-08T15:08:17.248Z'))
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(res.body).to.have.property('response');
					expect(res.body).to.have.property('reaction');
					expect(res.body).to.have.property('chatDuration');
					expect(res.body.response).to.have.property('avg');
					expect(res.body.response).to.have.property('longest');
					expect(res.body.reaction).to.have.property('avg');
					expect(res.body.reaction).to.have.property('longest');
					expect(res.body.chatDuration).to.have.property('avg');
					expect(res.body.chatDuration).to.have.property('longest');
				});
		});
	});

	describe('livechat/analytics/agent-overview', () => {
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/agent-overview'))
				.query({ from: '2020-01-01', to: '2020-01-02', name: 'Total_conversations' })
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an "invalid-chart-name error" when the chart name is empty', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/agent-overview'))
				.query({ from: '2020-01-01', to: '2020-01-02', name: '' })
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should return empty when chart name is invalid', async () => {
			await request
				.get(api('livechat/analytics/agent-overview'))
				.query({ from: '2020-01-01', to: '2020-01-02', name: 'invalid-chart-name' })
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(Object.keys(res.body)).to.have.lengthOf(1);
				});
		});
		it('should return an array of agent overview data', async () => {
			const result = await request
				.get(api('livechat/analytics/agent-overview'))
				.query({ from: '2020-01-01', to: '2020-01-02', name: 'Total_conversations' })
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(result.body).to.have.property('success', true);
			expect(result.body).to.have.property('head');
			expect(result.body).to.have.property('data');
			expect(result.body.head).to.be.an('array');
			expect(result.body.data).to.be.an('array');
		});
		(IS_EE ? it : it.skip)('should return agent overview data with correct values', async () => {
			const yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
			const today = moment().startOf('day').format('YYYY-MM-DD');

			const result = await request
				.get(api('livechat/analytics/agent-overview'))
				.query({ from: yesterday, to: today, name: 'Total_conversations', departmentId: department._id })
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(result.body).to.have.property('success', true);
			expect(result.body).to.have.property('head');
			expect(result.body).to.have.property('data');
			expect(result.body.data).to.be.an('array');
			expect(result.body.data).to.have.lengthOf(2);

			const data1 = result.body.data.find((data: any) => data.name === agents[0].user.username);
			const data2 = result.body.data.find((data: any) => data.name === agents[1].user.username);

			expect(data1).to.not.be.undefined;
			expect(data2).to.not.be.undefined;

			expect(data1).to.have.property('value', '33.33%');
			expect(data2).to.have.property('value', '66.67%');
		});
	});

	describe('livechat/analytics/overview', () => {
		it('should return an "unauthorized error" when the user does not have the necessary permission', async () => {
			await updatePermission('view-livechat-manager', []);
			await request
				.get(api('livechat/analytics/overview'))
				.query({ from: '2020-01-01', to: '2020-01-02', name: 'Conversations' })
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(403);
		});
		it('should return an "invalid-chart-name error" when the chart name is empty', async () => {
			await updatePermission('view-livechat-manager', ['admin']);
			await request
				.get(api('livechat/analytics/overview'))
				.query({ from: '2020-01-01', to: '2020-01-02', name: '' })
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(400);
		});
		it('should return empty when chart name is invalid', async () => {
			await request
				.get(api('livechat/analytics/overview'))
				.query({ from: '2020-01-01', to: '2020-01-02', name: 'invalid-chart-name' })
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200)
				.expect((res: Response) => {
					expect(res.body).to.have.property('success', true);
					expect(Object.keys(res.body)).to.have.lengthOf(1);
				});
		});
		it('should return an array of analytics overview data', async () => {
			const result = await request
				.get(api('livechat/analytics/overview'))
				.query({ from: '2020-01-01', to: '2020-01-02', name: 'Conversations' })
				.set(credentials)
				.expect('Content-Type', 'application/json')
				.expect(200);

			expect(result.body).to.be.an('array');
			expect(result.body).to.have.lengthOf(7);
			expect(result.body[0]).to.have.property('title', 'Total_conversations');
			expect(result.body[0]).to.have.property('value', 0);
		});
	});
});
