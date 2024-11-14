import type { BaseTest } from '../test';

export const makeAgentAvailable = async (api: BaseTest['api'], agentId: string) => {
	await api.post('/users.setStatus', {
		userId: agentId,
		message: '',
		status: 'online',
	});

	return api.post('/livechat/agent.status', {
		agentId,
		status: 'available',
	});
};

export const deleteAgent = async (api: BaseTest['api'], agentId: string) => {
	const response = await api.delete(`/livechat/users/agent/${agentId}`);

	if (response.status() !== 200) {
		throw new Error(`Failed to delete agent [http status: ${response.status()}]`);
	}

	return response;
};

export const createAgent = async (api: BaseTest['api'], username: string) => {
	const response = await api.post('/livechat/users/agent', { username });

	if (response.status() !== 200) {
		throw new Error(`Failed to create agent [http status: ${response.status()}]`);
	}

	const { user: agent } = await response.json();

	return {
		response,
		data: agent,
		delete: () => deleteAgent(api, agent._id),
	};
};
