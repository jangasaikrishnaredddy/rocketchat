crypto = Npm.require 'crypto'

logger = new Logger 'NGPresence'


class AmqpConnection
	currentTry: 0
	stopTrying: false

	constructor: ({@host, @vhost, @user, @password, @exclusiveQueue, @routingKey, @exchange, @queuePrefix}) ->
		@exclusiveQueue = @exclusiveQueue or false
		@exchange = @exchange or 'eventbus'
		@queuePrefix = @queuePrefix or ''
		@url = "amqp://#{@user}:#{@password}@#{@host}/#{@vhost}?heartbeat=30"

	connect: ->
		@currentTry += 1
		@stopTrying = false
		logger.info("connecting to amqp://#{@host}/#{@vhost}")
		amqpClient.connect(@url).then(@onConnected, @onError)

	onConnected: (conn) =>
		@currentTry = 0
		@conn = conn
		conn.on 'error', @reconnect
		conn.createChannel().then(@onChannelCreated, @onError)

	reconnect: =>
		attempt = if @currentTry > 0 then @currentTry else 0
		random_delay = Math.floor(Math.random() * (30 - 1)) + 1
		max_delay = 120
		delay = Math.min(random_delay + Math.pow(2, attempt-1), max_delay)
		logger.warn "disconnected. Attempt #{attempt}. Trying reconnect in #{delay}s"
		setTimeout (=> @connect(@url)), delay * 1000

	onError: (e) =>
		logger.error('error', e)
		if @conn
			@conn.close()
			@conn = null
			@chan = null
			@qid = null
		@reconnect(e)

	disconnect: =>
		@stopTrying = true
		if @conn
			logger.info "disconnecting from amqp host #{@host}"
			@conn.close()
			@conn = null
			@chan = null
			@qid = null

	onChannelCreated: (chan) =>
		@chan = chan
		chan.assertExchange(@exchange, 'topic', durable: false).then(@declareQueue)

	declareQueue: =>
		queueopts =
			autoDelete: true,
			durable: false,
			'arguments': 'x-message-ttl': 0
		if @exclusiveQueue
			queueopts['exclusive'] = true
			qid = Random.id(32)
		else
			queueopts['exclusive'] = false
			qid = CryptoJS.MD5(@queuePrefix + @routingKey).toString()
		@qid = qid
		ok = @chan.assertQueue(qid, queueopts)
		ok = ok.then(=> @chan.bindQueue(@qid, @exchange, @routingKey))
		ok = ok.then(=> @chan.consume(@qid, @onMessage))

	onMessage: (msg) =>
		payload = JSON.parse(msg.content.toString('utf8'))['payload']
		logger.debug "received", payload


Meteor.startup ->
	if not RocketChat.settings.get('OrchestraIntegration_PresenceEnabled')
		return

	broker_host = RocketChat.settings.get('OrchestraIntegration_BrokerHost')
	broker_user = RocketChat.settings.get('OrchestraIntegration_BrokerUser')
	broker_password = RocketChat.settings.get('OrchestraIntegration_BrokerPassword')
	if not (broker_host and broker_user and broker_password)
		logger.error('no broker credentials supplied')
		return

	ng_host = RocketChat.settings.get('OrchestraIntegration_Server')
	ng_user = RocketChat.settings.get('OrchestraIntegration_APIUser')
	ng_passwd = RocketChat.settings.get('OrchestraIntegration_APIPassword')
	ng_domain = RocketChat.settings.get('OrchestraIntegration_Domain')
	ng = new NGApi(ng_host)
	try
		if ng_user and ng_passwd
			# use username/password login
			res = ng.login ng_user, ng_passwd
		else if ng_user
			# use trusted auth
			res = ng.trustedLogin "#{ng_user}@#{ng_domain}"
		else
			logger.error('no credentials supplied')
			return

		token = res.token
		if not (res and res.token)
			logger.error "invalid response from server: #{res}"
			return

		user = ng.getUser token
		if user.success is false
			logger.error "invalid user"
			return
		domain_id = user.domain_id
	catch e
		logger.error "error getting domain: \"#{e}\""
		return

	c = new AmqpConnection
		host: broker_host
		vhost: '/ydin_evb'
		user: broker_user
		password: broker_password
		exclusiveQueue: false
		routingKey: "ydin.presence.event.#{domain_id}"
	c.connect()
