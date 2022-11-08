import { Box, PositionAnimated, AnimatedVisibility } from '@rocket.chat/fuselage';
import React, { RefObject, useRef, useState, ReactElement } from 'react';

type TooltipOnHoverProps = {
	element: ReactElement;
	tooltip: ReactElement;
};

export const TooltipOnHover = ({ element, tooltip }: TooltipOnHoverProps): ReactElement => {
	const ref = useRef<Element>();
	const [isHovered, setIsHovered] = useState(false);

	return (
		<>
			<Box ref={ref} onMouseEnter={(): void => setIsHovered(true)} onMouseLeave={(): void => setIsHovered(false)}>
				{element}
			</Box>
			<PositionAnimated
				anchor={ref as RefObject<Element>}
				placement='top-middle'
				margin={8}
				visible={isHovered ? AnimatedVisibility.VISIBLE : AnimatedVisibility.HIDDEN}
			>
				{tooltip}
			</PositionAnimated>
		</>
	);
};
