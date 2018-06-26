Template.setupWizard.onCreated(function() {
	this.state = new ReactiveDict();
	this.wizardSettings = new ReactiveVar([]);

	if (localStorage.getItem('wizardFinal')) {
		FlowRouter.go('setup-wizard-final');
		return;
	}

	this.registerAdminUser = () => {
		const usernameValue = this.state.get('registration-username');
		const usernameRegex = new RegExp(`^${ RocketChat.settings.get('UTF8_Names_Validation') }$`);
		this.state.set('invalidUsername', !usernameRegex.test(usernameValue));

		const emailValue = this.state.get('registration-email');
		const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]+$/i;
		this.state.set('invalidEmail', !emailRegex.test(emailValue));

		if (this.state.get('invalidUsername') || this.state.get('invalidEmail')) {
			return false;
		}

		const registrationData = Object.entries(this.state.all())
			.filter(([ key ]) => /registration-/.test(key))
			.map(([ key, value ]) => ([ key.replace('registration-', ''), value ]))
			.reduce((o, [ key, value ]) => ({ ...o, [key]: value }), {});

		Meteor.call('registerUser', registrationData, error => {
			if (error) {
				return handleError(error);
			}

			RocketChat.callbacks.run('userRegistered');
			Meteor.loginWithPassword(registrationData.email, registrationData.pass, error => {
				if (error) {
					if (error.error === 'error-invalid-email') {
						toastr.success(t('We_have_sent_registration_email'));
						return false;
					} else {
						return handleError(error);
					}
				}

				Session.set('forceLogin', false);
				Meteor.call('setUsername', registrationData.username, error => {
					if (error) {
						return handleError(error);
					}

					RocketChat.callbacks.run('usernameSet');
					this.state.set('currentStep', 2);
				});
			});
		});
	};

	this.registerServer = () => {
		setSettingsAndGo(this.state.all(), JSON.parse(this.state.get('registerServer') || true));
		return false;
	};

	const jsonString = localStorage.getItem('wizard');
	const state = jsonString && JSON.parse(jsonString) || {};
	Object.entries(state).forEach(entry => this.state.set(...entry));

	const waitForVariables = c => {
		const showSetupWizard = RocketChat.settings.get('Show_Setup_Wizard');
		if (!showSetupWizard) {
			// Setup Wizard state is not defined yet
			return;
		}

		const userId = Meteor.userId();
		const user = userId && RocketChat.models.Users.findOne(userId, { fields: { status: true } });
		if (userId && (!user || !user.status)) {
			// User and its status are not defined yet
			return;
		}

		const isComplete = showSetupWizard === 'completed';
		const noUserLoggedInAndIsNotPending = !userId && showSetupWizard !== 'pending';
		const userIsLoggedButIsNotAdmin = userId && !RocketChat.authz.hasRole(userId, 'admin');
		if (isComplete || noUserLoggedInAndIsNotPending || userIsLoggedButIsNotAdmin) {
			c.stop();
			FlowRouter.go('home');
			return;
		}

		autorun = updateState;
		updateState(c);
	};

	const updateState = c => {
		if (!this.state.get('currentStep')) {
			this.state.set('currentStep', 1);
		}

		const state = this.state.all();
		state['registration-pass'] = '';
		localStorage.setItem('wizard', JSON.stringify(state));

		if (Meteor.userId()) {
			Meteor.call('getWizardSettings', (error, wizardSettings) => {
				if (error) {
					return handleError(error);
				}

				this.wizardSettings.set(wizardSettings);
			});

			if (this.state.get('currentStep') === 1) {
				this.state.set('currentStep', 2);
			} else {
				this.state.set('registration-pass', '');
			}
		} else {
			if (this.state.get('currentStep') !== 1) {
				this.state.set('currentStep', 1);
			}
		}
	};

	let autorun = waitForVariables;

	this.autorun(c => autorun(c));
});

Template.setupWizard.onRendered(function() {
	$('#initial-page-loading').remove();
});

const setSettingsAndGo = (settings, registerServer = true) => {
	const settingsFilter = Object.entries(settings)
		.filter(([key]) => !/registration-|registerServer|currentStep/.test(key))
		.map(([_id, value]) => ({_id, value}));

	settingsFilter.push({
		_id: 'Statistics_reporting',
		value: registerServer
	});

	RocketChat.settings.batchSet(settingsFilter, function(err) {
		if (err) {
			return handleError(err);
		}

		localStorage.setItem('wizardFinal', true);
		FlowRouter.go('setup-wizard-final');
	});
};

Template.setupWizard.events({
	'submit .setup-wizard-forms__box'() {
		return false;
	},
	'click .setup-wizard-forms__footer-next'(e, t) {
		switch (t.state.get('currentStep')) {
			case 1:
				return t.registerAdminUser();
			case 2:
				t.state.set('currentStep', 3);
				return false;
			case 3:
				t.state.set('currentStep', 4);
				return false;
			case 4:
				return t.registerServer();
		}

		return false;
	},
	'click .setup-wizard-forms__footer-back'(e, t) {
		switch (t.state.get('currentStep')) {
			case 1:
				break;
			case 2:
				t.state.set('currentStep', 1);
				break;
			case 3:
				t.state.set('currentStep', 2);
				break;
			case 4:
				t.state.set('currentStep', 3);
				break;
		}

		return false;
	},
	'input .js-setting-data'({ currentTarget: { name, value } }, t) {
		t.state.set(name, value);
	}
});

Template.setupWizard.helpers({
	currentStep() {
		return Template.instance().state.get('currentStep');
	},
	currentStepTitle() {
		switch (Template.instance().state.get('currentStep')) {
			case 1:
				return 'Admin_Info';
			case 2:
				return 'Organization_Info';
			case 3:
				return 'Server_Info';
			case 4:
				return 'Register_Server';
		}
	},
	formLoadStateClass() {
		switch (Template.instance().state.get('currentStep')) {
			case 1:
				return RocketChat.settings.get('Show_Setup_Wizard') === 'pending' && 'setup-wizard-forms__box--loaded';
			case 2:
				return Template.instance().wizardSettings.get().length > 0 && 'setup-wizard-forms__box--loaded';
			case 3:
				return Template.instance().wizardSettings.get().length > 0 && 'setup-wizard-forms__box--loaded';
			case 4:
				return Template.instance().wizardSettings.get().length > 0 && 'setup-wizard-forms__box--loaded';
		}

		const currentStep = Template.instance().state.get('currentStep');

		if (currentStep === 1 && RocketChat.settings.get('Show_Setup_Wizard') === 'pending') {
			return 'setup-wizard-forms__box--loaded';
		}

		if ((currentStep === 2 || currentStep == 3) && Template.instance().wizardSettings.get().length > 0) {
			return 'setup-wizard-forms__box--loaded';
		}
	},
	showBackButton() {
		if (Template.instance().state.get('currentStep') === 3) {
			return true;
		}

		return false;
	},
	isContinueDisabled() {
		if (Template.instance().state.get('currentStep') === 1) {
			return Object.entries(Template.instance().state.all())
				.filter(([key, value]) => /registration-/.test(key) && !value)
				.length !== 0;
		}

		return false;
	},
	adminInfoArgs() {
		const t = Template.instance();

		return {
			currentStep: t.state.get('currentStep'),
			name: t.state.get('registration-name'),
			username: t.state.get('registration-username'),
			email: t.state.get('registration-email'),
			password: t.state.get('registration-pass'),
			invalidUsername: t.state.get('invalidUsername'),
			invalidEmail: t.state.get('invalidEmail')
		};
	},
	registerServerArgs() {
		const t = Template.instance();

		return {
			currentStep: t.state.get('currentStep')
		};
	},
	customStepArgs(step) {
		const t = Template.instance();

		return {
			currentStep: t.state.get('currentStep'),
			step,
			settings: t.wizardSettings.get()
				.filter(setting => setting.wizard.step === step)
				.sort((a, b) => a.wizard.order - b.wizard.order)
				.map(({ type, _id, i18nLabel, values }) => ({
					type,
					id: _id,
					label: i18nLabel,
					value: t.state.get(_id),
					options: (
						type === 'select' &&
						values &&
						values.map(({ i18nLabel, key }) => ({ optionLabel: i18nLabel, optionValue: key }))
					) || (
						type === 'language' &&
						([{
							optionLabel: 'Default',
							optionValue: ''
						}].concat(
							Object.entries(TAPi18n.getLanguages())
								.map(([ key, { name } ]) => ({ optionLabel: name, optionValue: key }))
								.sort((a, b) => a.key - b.key)
						))
					),
					isValueSelected: (value) => value === t.state.get(_id)
				}))
		};
	}
});

Template.setupWizardInfo.helpers({
	stepItemModifier(step) {
		const { currentStep } = Template.currentData();

		if (currentStep === step) {
			return 'setup-wizard-info__steps-item--active';
		}

		if (currentStep > step) {
			return 'setup-wizard-info__steps-item--past';
		}

		return '';
	},
	stepTitle(step) {
		switch (step) {
			case 1:
				return 'Admin_Info';
			case 2:
				return 'Organization_Info';
			case 3:
				return 'Server_Info';
			case 4:
				return 'Register_Server';
		}
	}
});
