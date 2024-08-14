import { isVoipErrorSession, isVoipIncomingSession, isVoipOngoingSession, isVoipOutgoingSession } from '../../definitions';
import { useVoipDialer } from '../../hooks/useVoipDialer';
import { useVoipSession } from '../../hooks/useVoipSession';
import type { PositionOffsets } from './components/VoipPopupContainer';
import DialerView from './views/DialerView';
import ErrorView from './views/ErrorView';
import IncomingView from './views/IncomingView';
import OngoingView from './views/OngoingView';
import OutgoingView from './views/OutgoingView';

const VoipPopup = ({ position }: { position?: PositionOffsets }) => {
	const session = useVoipSession();
	const { open: isDialerOpen } = useVoipDialer();

	if (isVoipIncomingSession(session)) {
		return <IncomingView session={session} position={position} />;
	}

	if (isVoipOngoingSession(session)) {
		return <OngoingView session={session} position={position} />;
	}

	if (isVoipOutgoingSession(session)) {
		return <OutgoingView session={session} position={position} />;
	}

	if (isVoipErrorSession(session)) {
		return <ErrorView session={session} position={position} />;
	}

	if (isDialerOpen) {
		return <DialerView position={position} />;
	}

	return null;
};

export default VoipPopup;
