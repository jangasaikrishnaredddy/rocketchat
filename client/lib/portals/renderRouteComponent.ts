import { Blaze } from 'meteor/blaze';
import { HTML } from 'meteor/htmljs';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Template } from 'meteor/templating';
import { Tracker } from 'meteor/tracker';
import type { ComponentType, PropsWithoutRef } from 'react';

import * as AppLayout from '../appLayout';
import { createLazyPortal } from './createLazyPortal';
import { portalsSubscription, registerPortal, unregisterPortal } from './portalsSubscription';

export const renderRouteComponent = <Props extends {} = {}>(
	factory: () => Promise<{ default: ComponentType<Props> }>,
	{
		propsFn: getProps,
	}: {
		propsFn?: () => PropsWithoutRef<Props> | undefined;
	} = {},
): void => {
	const routeName = FlowRouter.getRouteName();

	if (portalsSubscription.has(routeName)) {
		return;
	}

	Tracker.autorun((computation) => {
		if (routeName !== FlowRouter.getRouteName()) {
			unregisterPortal(routeName);
			computation.stop();
			return;
		}

		if (!computation.firstRun) {
			return;
		}

		if (!Template[routeName]) {
			const blazeTemplate = new Blaze.Template(routeName, () => HTML.DIV()); // eslint-disable-line new-cap

			blazeTemplate.onRendered(function (this: Blaze.TemplateInstance & { firstNode: Element }) {
				const node = this.firstNode.parentElement;

				if (!node) {
					throw new Error();
				}

				this.firstNode.remove();
				const portal = createLazyPortal(factory, getProps ?? ((): undefined => undefined), node);

				if (routeName !== FlowRouter.getRouteName()) {
					return;
				}

				registerPortal(routeName, portal);

				const handleMainContentDestroyed = (): void => {
					unregisterPortal(routeName);
					document.removeEventListener('main-content-destroyed', handleMainContentDestroyed);
				};

				document.addEventListener('main-content-destroyed', handleMainContentDestroyed);
			});

			Template[routeName] = blazeTemplate;
		}

		Tracker.afterFlush(() => {
			AppLayout.render('main', { center: routeName });
		});
	});
};
