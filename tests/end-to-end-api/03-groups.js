/* eslint-env mocha */
/* globals expect */
/* eslint no-unused-vars: 0 */

import {getCredentials, api, login, request, credentials, group, log, apiPrivateChannelName } from '../data/api-data.js';
import {adminEmail, password} from '../data/user.js';
import supertest from 'supertest';

describe('groups', () => {
	before((done) => {
		request.post(api('login'))
		.send(login)
		.expect('Content-Type', 'application/json')
		.expect(200)
		.expect((res) => {
			credentials['X-Auth-Token'] = res.body.data.authToken;
			credentials['X-User-Id'] = res.body.data.userId;
		})
		.end(done);
	});

	it('/groups.create', (done) => {
		request.post(api('groups.create'))
			.set(credentials)
			.send({
				name: apiPrivateChannelName
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.deep.property('group._id');
				expect(res.body).to.have.deep.property('group.name', apiPrivateChannelName);
				expect(res.body).to.have.deep.property('group.t', 'p');
				expect(res.body).to.have.deep.property('group.msgs', 0);
				group._id = res.body.group._id;
			})
			.end(done);
	});

	it('/groups.info', (done) => {
		request.get(api('groups.info'))
			.set(credentials)
			.query({
				roomId: group._id
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.deep.property('group._id');
				expect(res.body).to.have.deep.property('group.name', apiPrivateChannelName);
				expect(res.body).to.have.deep.property('group.t', 'p');
				expect(res.body).to.have.deep.property('group.msgs', 0);
			})
			.end(done);
	});

	it('/groups.invite', (done) => {
		request.post(api('groups.invite'))
			.set(credentials)
			.send({
				roomId: group._id,
				userId: 'rocket.cat'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.deep.property('group._id');
				expect(res.body).to.have.deep.property('group.name', apiPrivateChannelName);
				expect(res.body).to.have.deep.property('group.t', 'p');
				expect(res.body).to.have.deep.property('group.msgs', 0);
			})
			.end(done);
	});

	it('/groups.addModerator', (done) => {
		request.post(api('groups.addModerator'))
			.set(credentials)
			.send({
				roomId: group._id,
				userId: 'rocket.cat'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.removeModerator', (done) => {
		request.post(api('groups.removeModerator'))
			.set(credentials)
			.send({
				roomId: group._id,
				userId: 'rocket.cat'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.addOwner', (done) => {
		request.post(api('groups.addOwner'))
			.set(credentials)
			.send({
				roomId: group._id,
				userId: 'rocket.cat'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.removeOwner', (done) => {
		request.post(api('groups.removeOwner'))
			.set(credentials)
			.send({
				roomId: group._id,
				userId: 'rocket.cat'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.kick', (done) => {
		request.post(api('groups.kick'))
			.set(credentials)
			.send({
				roomId: group._id,
				userId: 'rocket.cat'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.invite', (done) => {
		request.post(api('groups.invite'))
			.set(credentials)
			.send({
				roomId: group._id,
				userId: 'rocket.cat'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.deep.property('group._id');
				expect(res.body).to.have.deep.property('group.name', apiPrivateChannelName);
				expect(res.body).to.have.deep.property('group.t', 'p');
				expect(res.body).to.have.deep.property('group.msgs', 0);
			})
			.end(done);
	});

	it('/groups.addOwner', (done) => {
		request.post(api('groups.addOwner'))
			.set(credentials)
			.send({
				roomId: group._id,
				userId: 'rocket.cat'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.setDescription', (done) => {
		request.post(api('groups.setDescription'))
			.set(credentials)
			.send({
				roomId: group._id,
				description: 'this is a description for a channel for api tests'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.deep.property('description', 'this is a description for a channel for api tests');
			})
			.end(done);
	});

	it('/groups.setTopic', (done) => {
		request.post(api('groups.setTopic'))
			.set(credentials)
			.send({
				roomId: group._id,
				topic: 'this is a topic of a channel for api tests'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.deep.property('topic', 'this is a topic of a channel for api tests');
			})
			.end(done);
	});

	it('/groups.setPurpose', (done) => {
		request.post(api('groups.setPurpose'))
			.set(credentials)
			.send({
				roomId: group._id,
				purpose: 'this is a purpose of a channel for api tests'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.deep.property('purpose', 'this is a purpose of a channel for api tests');
			})
			.end(done);
	});

	it('/groups.history', (done) => {
		request.get(api('groups.history'))
			.set(credentials)
			.query({
				roomId: group._id
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('messages');
			})
			.end(done);
	});

	it('/groups.archive', (done) => {
		request.post(api('groups.archive'))
			.set(credentials)
			.send({
				roomId: group._id
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.unarchive', (done) => {
		request.post(api('groups.unarchive'))
			.set(credentials)
			.send({
				roomId: group._id
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.close', (done) => {
		request.post(api('groups.close'))
			.set(credentials)
			.send({
				roomId: group._id
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.open', (done) => {
		request.post(api('groups.open'))
			.set(credentials)
			.send({
				roomId: group._id
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.list', (done) => {
		request.get(api('groups.list'))
			.set(credentials)
			.query({
				roomId: group._id
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('count');
				expect(res.body).to.have.property('total');
			})
			.end(done);
	});

	it('/groups.rename', (done) => {
		request.post(api('groups.rename'))
			.set(credentials)
			.send({
				roomId: group._id,
				name: 'EDITED'+apiPrivateChannelName
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.deep.property('group._id');
				expect(res.body).to.have.deep.property('group.name', 'EDITED'+apiPrivateChannelName);
				expect(res.body).to.have.deep.property('group.t', 'p');
				expect(res.body).to.have.deep.property('group.msgs', 0);
			})
			.end(done);
	});

	it('/groups.getIntegrations', (done) => {
		request.get(api('groups.getIntegrations'))
			.set(credentials)
			.query({
				roomId: group._id
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
				expect(res.body).to.have.property('count', 0);
				expect(res.body).to.have.property('total', 0);
			})
			.end(done);
	});

	it('/groups.setReadOnly', (done) => {
		request.post(api('groups.setReadOnly'))
			.set(credentials)
			.send({
				roomId: group._id,
				readOnly: true
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it.skip('/groups.leave', (done) => {
		request.post(api('groups.leave'))
			.set(credentials)
			.send({
				roomId: group._id
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});

	it('/groups.setType', (done) => {
		request.post(api('groups.setType'))
			.set(credentials)
			.send({
				roomId: group._id,
				type: 'c'
			})
			.expect('Content-Type', 'application/json')
			.expect(200)
			.expect((res) => {
				expect(res.body).to.have.property('success', true);
			})
			.end(done);
	});
});