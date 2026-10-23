/**
 * Styles.
 */
import './editor.scss';

import {
	closestCenter,
	DndContext,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import {
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControl,
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis
	__experimentalToggleGroupControlOption,
	ToggleGroupControl as StableToggleGroupControl,
	ToggleGroupControlOption as StableToggleGroupControlOption,
} from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { useEffect, useRef, useState } from '@wordpress/element';
/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';
import CustomPointerSensor from '../../../utils/dnd-kit-custom-pointer-sensor';
/**
 * Internal dependencies.
 */
import AddControl, { ControlsEmptyState } from './add-control';
import Control from './control';
import DeselectActiveControlOnClickOutside from './deselect-active-on-click-outside';

const ToggleGroupControl =
	StableToggleGroupControl || __experimentalToggleGroupControl;
const ToggleGroupControlOption =
	StableToggleGroupControlOption || __experimentalToggleGroupControlOption;

let initialActiveTab = '';

export default function ControlsSettings(props) {
	const sensors = useSensors(useSensor(CustomPointerSensor));
	const controlsRef = useRef();

	const { data } = props;

	useEffect(() => {
		// fix first loading focus on code editor
		// Focusing an option of the toggle group selects it, so focus the checked one.
		const $tabsButton = controlsRef.current?.querySelector(
			'.lazyblocks-control-tabs-tab[aria-checked="true"]'
		);

		if ($tabsButton) {
			$tabsButton.focus();
		}
	}, []);

	const {
		addControl: dispatchAddControl,
		removeControl,
		resortControl,
		updateControlData,
	} = useDispatch('lazy-blocks/block-data');

	function addControl(attributes, resortId) {
		dispatchAddControl(
			{
				...attributes,
			},
			resortId
		);
	}

	function printControls(childOf = '', placement = '') {
		const { controls = {} } = data;

		const items = [];

		Object.keys(controls).forEach((id) => {
			const controlData = controls[id];
			const controlPlacement = controlData.placement || 'content';

			if (childOf !== controlData.child_of) {
				return;
			}

			if (
				!controlData.child_of &&
				!(
					placement === controlPlacement ||
					(controlPlacement === 'both' &&
						(placement === 'content' || placement === 'inspector'))
				)
			) {
				return;
			}

			items.push({
				addControl(newControlData, resortId) {
					addControl(newControlData, resortId);
				},
				removeControl(optionalId = false) {
					const controlIdToRemove = optionalId || id;

					// Find all child controls that need to be removed
					const childControlsToRemove = [];
					Object.keys(controls).forEach((controlId) => {
						if (
							controls[controlId].child_of === controlIdToRemove
						) {
							childControlsToRemove.push(controlId);
						}
					});

					// Remove child controls first (call the actual removeControl dispatch function)
					childControlsToRemove.forEach((childId) => {
						removeControl(childId);
					});

					// Then remove the parent control
					removeControl(controlIdToRemove);
				},
				updateData(newData, optionalId = false) {
					updateControlData(optionalId || id, newData);
				},
				printControls,
				data: controlData,
				id,
				controls,
			});
		});

		if (!childOf && !items.length) {
			return <ControlsEmptyState placement={placement} />;
		}

		return (
			<>
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={(event) => {
						const { active, over } = event;

						if (active.id !== over.id) {
							resortControl(active.id, over.id);
						}
					}}
				>
					<div className="lzb-block-builder-controls-items">
						<SortableContext items={items}>
							{items.map((value) => {
								return (
									<div
										key={`lzb-block-builder-controls-items-sortable-${value.id}`}
										className="lzb-block-builder-controls-item-wrap"
										style={
											placement !== 'inspector'
												? {
														width: `${value.data.width}%`,
													}
												: null
										}
									>
										<Control {...value} />
									</div>
								);
							})}
						</SortableContext>
					</div>
				</DndContext>
				<AddControl
					placement={placement || 'content'}
					childOf={childOf}
					label={
						childOf
							? __('Add child control', 'lazy-blocks')
							: __('Add control', 'lazy-blocks')
					}
				/>
			</>
		);
	}

	const { controls = {} } = data;

	const placementTabs = [
		{
			name: 'content',
			label: __('Content Controls', 'lazy-blocks'),
			icon: (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M6 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V6C4.75 5.30964 5.30964 4.75 6 4.75Z"
						stroke="currentColor"
						strokeWidth="1.5"
						fill="none"
					/>
					<rect
						x="7"
						y="7"
						width="8"
						height="10"
						rx="0.5"
						fill="currentColor"
					/>
				</svg>
			),
		},
		{
			name: 'inspector',
			label: __('Inspector Controls', 'lazy-blocks'),
			icon: (
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M6 4.75H18C18.6904 4.75 19.25 5.30964 19.25 6V18C19.25 18.6904 18.6904 19.25 18 19.25H6C5.30964 19.25 4.75 18.6904 4.75 18V6C4.75 5.30964 5.30964 4.75 6 4.75Z"
						stroke="currentColor"
						strokeWidth="1.5"
						fill="none"
					/>
					<rect
						x="13"
						y="7"
						width="4"
						height="10"
						rx="0.5"
						fill="currentColor"
					/>
				</svg>
			),
		},
	];

	// Check if there is hidden controls
	let thereIsHidden = false;

	Object.keys(controls).forEach((id) => {
		const controlData = controls[id];

		if (!controlData.child_of && controlData.placement === 'nowhere') {
			thereIsHidden = true;
		}
	});

	placementTabs.push({
		name: 'nowhere',
		label: __('Hidden', 'lazy-blocks'),
		isHidden: !thereIsHidden,
	});

	// set initial active tab.
	if (!initialActiveTab) {
		initialActiveTab = 'inspector';
		let contentControlsCount = 0;
		let inspectorControlsCount = 0;
		let nowhereControlsCount = 0;

		Object.keys(controls).forEach((id) => {
			const controlData = controls[id];

			switch (controlData.placement) {
				case 'content':
					contentControlsCount += 1;
					break;
				case 'inspector':
					inspectorControlsCount += 1;
					break;
				case 'nowhere':
					nowhereControlsCount += 1;
					break;
				// no default
			}
		});

		if (!inspectorControlsCount) {
			if (contentControlsCount) {
				initialActiveTab = 'content';
			} else if (nowhereControlsCount) {
				initialActiveTab = 'nowhere';
			}
		}
	}

	const [activeTab, setActiveTab] = useState(initialActiveTab);

	return (
		<div ref={controlsRef} className="lzb-block-builder-controls">
			<DeselectActiveControlOnClickOutside />
			<ToggleGroupControl
				className="lazyblocks-control-tabs-toggle"
				label={__('Controls placement', 'lazy-blocks')}
				hideLabelFromVision
				isBlock
				isAdaptiveWidth
				value={activeTab}
				onChange={(value) => setActiveTab(value)}
				__nextHasNoMarginBottom
				__next40pxDefaultSize
			>
				{placementTabs
					.filter((item) => !item.isHidden || item.name === activeTab)
					.map((item) => (
						<ToggleGroupControlOption
							key={item.name}
							value={item.name}
							label={
								item.icon ? (
									<>
										{item.icon}
										{item.label}
									</>
								) : (
									item.label
								)
							}
							aria-label={item.label}
							className="lazyblocks-control-tabs-tab"
						/>
					))}
			</ToggleGroupControl>
			{printControls('', activeTab)}
		</div>
	);
}
