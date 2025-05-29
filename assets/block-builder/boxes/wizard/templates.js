/**
 * WordPress dependencies.
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies.
 */
import { HeroIcon, TestimonialsIcon, AlertIcon } from './icons';

export const templates = {
	basic: {
		title: __('Basic', 'lazy-blocks'),
		icon: null,
		blockIcon: '',
		category: 'text',
		keywords: '',
		description: '',
		controls: [
			{
				type: 'text',
				name: 'text-control',
				label: 'Text Control',
				placement: 'inspector',
			},
		],
		template: `<div useBlockProps>
	{{text-control}}
</div>`,
		style: `__BLOCK_CLASSNAME__ {
	background-color: #f9f9f9;
	padding: 20px;
}`,
	},
	hero: {
		title: __('Hero', 'lazy-blocks'),
		icon: <HeroIcon />,
		blockIcon:
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"></path></svg>',
		category: 'design',
		keywords: 'hero,banner,header,cta',
		description:
			'Hero section with customizable title, subtitle, and call-to-action button.',
		controls: [
			{
				type: 'text',
				name: 'hero-title',
				default: 'Welcome to our website',
				label: 'Hero Title',
				help: 'Main heading for the hero section',
				translate: 'true',
				placement: 'inspector',
			},
			{
				type: 'textarea',
				name: 'hero-subtitle',
				default: 'Discover our amazing products and services',
				label: 'Subtitle',
				help: 'Secondary text below the main heading',
				translate: 'true',
				placeholder: 'Enter subtitle text here...',
				placement: 'inspector',
			},
			{
				type: 'text',
				name: 'button-text',
				default: 'Learn More',
				label: 'Button Text',
				translate: 'true',
				placement: 'inspector',
			},
			{
				type: 'url',
				name: 'button-url',
				default: '#',
				label: 'Button URL',
				placement: 'inspector',
			},
			{
				type: 'color',
				name: 'background-color',
				default: '#eef0f5',
				alongside_text: 'Background Color',
				alpha: 'true',
				placement: 'inspector',
				group: 'styles',
			},
		],
		template: `<div useBlockProps style="background-color: {{background-color}}">
	<div class="hero-content">
		<h2 class="hero-title">{{hero-title}}</h2>
		<div class="hero-subtitle">{{hero-subtitle}}</div>
		<a href="{{button-url}}" class="hero-button">{{button-text}}</a>
	</div>
</div>`,
		style: `__BLOCK_CLASSNAME__ {
	padding: 60px 20px;
	text-align: center;
}
__BLOCK_CLASSNAME__ .hero-content {
	max-width: 800px;
	margin: 0 auto;
}
__BLOCK_CLASSNAME__ .hero-title {
	font-size: 36px;
	margin-bottom: 20px;
	color: #333;
}
__BLOCK_CLASSNAME__ .hero-subtitle {
	font-size: 18px;
	margin-bottom: 30px;
	color: #666;
}
__BLOCK_CLASSNAME__ .hero-button {
	display: inline-block;
	padding: 12px 24px;
	background-color: #205cc7;
	color: #fff;
	text-decoration: none;
	border-radius: 4px;
	font-weight: bold;
}
__BLOCK_CLASSNAME__ .hero-button:hover {
	background-color: #154eb4;
}`,
	},
	testimonials: {
		title: __('Testimonials', 'lazy-blocks'),
		icon: <TestimonialsIcon />,
		blockIcon:
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"></path></svg>',
		category: 'design',
		keywords: 'testimonials,reviews,feedback',
		description:
			'Display customer testimonials in a clean, organized grid layout.',
		controls: [
			{
				type: 'text',
				name: 'testimonials-title',
				default: 'What Our Clients Say',
				label: 'Section Title',
				translate: 'true',
				placement: 'inspector',
			},
			{
				type: 'repeater',
				name: 'testimonials',
				label: 'Testimonials',
				group: 'default',
				rows_min: '1',
				rows_label: 'Testimonial',
				rows_add_button_label: 'Add Testimonial',
				rows_collapsible: 'true',
				rows_collapsed: 'true',
				placement: 'inspector',
			},
			{
				type: 'text',
				name: 'name',
				default: 'John Doe',
				label: 'Name',
				help: 'Name of the person giving testimonial',
				child_of: 'testimonials',
				translate: 'true',
				placement: 'inspector',
			},
			{
				type: 'text',
				name: 'position',
				default: 'CEO, Company Name',
				label: 'Position',
				child_of: 'testimonials',
				translate: 'true',
				placement: 'inspector',
			},
			{
				type: 'textarea',
				name: 'quote',
				default:
					'This is an amazing product that has completely transformed how we work. Highly recommended!',
				label: 'Testimonial Text',
				child_of: 'testimonials',
				translate: 'true',
				placement: 'inspector',
			},
			{
				type: 'image',
				name: 'avatar',
				label: 'Avatar',
				child_of: 'testimonials',
				preview_size: 'thumbnail',
				placement: 'inspector',
			},
		],
		template: `<div useBlockProps>
	<h2 class="testimonials-title">{{testimonials-title}}</h2>

	<div class="testimonials-container">
		{{#each testimonials}}
		<div class="testimonial-item">
			<div class="testimonial-content">
				<div class="testimonial-quote">"{{quote}}"</div>
				<div class="testimonial-author">
					{{#if avatar}}
					<div class="testimonial-avatar">
						<img src="{{avatar}}" alt="{{name}}">
					</div>
					{{/if}}

					<div class="testimonial-info">
						<div class="testimonial-name">{{name}}</div>
						<div class="testimonial-position">{{position}}</div>
					</div>
				</div>
			</div>
		</div>
		{{/each}}
	</div>
</div>`,
		style: `__BLOCK_CLASSNAME__ .testimonials-title {
	text-align: center;
	font-size: 32px;
	margin-bottom: 40px;
	color: #333;
}
__BLOCK_CLASSNAME__ .testimonials-container {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
	gap: 30px;
}
__BLOCK_CLASSNAME__ .testimonial-item {
	background-color: #f9f9f9;
	border-radius: 8px;
	padding: 25px;
	box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
}
__BLOCK_CLASSNAME__ .testimonial-quote {
	font-style: italic;
	margin-bottom: 20px;
	color: #555;
	line-height: 1.6;
	font-size: 1.1rem;
}
__BLOCK_CLASSNAME__ .testimonial-author {
	display: flex;
	align-items: center;
}
__BLOCK_CLASSNAME__ .testimonial-avatar {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 15px;
}
__BLOCK_CLASSNAME__ .testimonial-avatar img {
	width: 100%;
	height: 100%;
	object-fit: cover;
}
__BLOCK_CLASSNAME__ .testimonial-name {
	font-size: 1.2rem;
	font-weight: 500;
	color: #333;
}
__BLOCK_CLASSNAME__ .testimonial-position {
	font-size: 0.9rem;
	color: #777;
}`,
	},
	alert: {
		title: __('Alert', 'lazy-blocks'),
		icon: <AlertIcon />,
		blockIcon:
			'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"></path></svg>',
		category: 'design',
		keywords: 'alert,notice,message,notification',
		description:
			'Attention-grabbing alert box, perfect for important announcements and notifications.',
		styles: [
			{
				name: 'info',
				label: 'Info',
			},
			{
				name: 'success',
				label: 'Success',
			},
			{
				name: 'warning',
				label: 'Warning',
			},
			{
				name: 'error',
				label: 'Error',
			},
		],
		controls: [
			{
				type: 'text',
				name: 'alert-title',
				default: 'Important Notice',
				label: 'Alert Title',
				help: 'Title of the alert (optional)',
				translate: 'true',
				placement: 'inspector',
			},
			{
				type: 'rich_text',
				name: 'alert-content',
				default:
					'This is an important message that you should pay attention to.',
				label: 'Alert Content',
				translate: 'true',
				placement: 'inspector',
			},
			{
				type: 'toggle',
				name: 'dismissible',
				default: 'false',
				label: 'Dismissible',
				checked: 'false',
				alongside_text: 'Make alert dismissible',
				placement: 'inspector',
			},
		],
		template: `<div useBlockProps{{#if dismissible}} class="alert-dismissible"{{/if}}>
	<div class="alert-content">
		{{#if alert-title}}<h4 class="alert-title">{{alert-title}}</h4>{{/if}}
		<div class="alert-message">{{{alert-content}}}</div>
	</div>
	{{#if dismissible}}
		<button class="alert-dismiss" onclick="this.parentNode.style.display='none';">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"/></svg>
		</button>
	{{/if}}
</div>`,
		style: `__BLOCK_CLASSNAME__ {
	display: flex;
	padding: 16px;
	border-radius: 4px;
	position: relative;
	background-color: #f3f3f3;
    border-left: 4px solid #b3b3b3;
    color: #4a4a4a;
}
__BLOCK_CLASSNAME__ .alert-content {
	flex-grow: 1;
}
__BLOCK_CLASSNAME__ .alert-title {
	margin-top: 0;
	margin-bottom: 8px;
	font-size: 18px;
}
__BLOCK_CLASSNAME__ .alert-message p:last-child {
	margin-bottom: 0;
}
__BLOCK_CLASSNAME__ .alert-dismiss {
	background: none;
	border: none;
	cursor: pointer;
	padding: 0;
	position: absolute;
	top: 16px;
	right: 16px;
	opacity: 0.7;
}
__BLOCK_CLASSNAME__ .alert-dismiss:hover {
	opacity: 1;
}

/* Alert types */
__BLOCK_CLASSNAME__.is-style-info {
	background-color: #e8f4fd;
	border-left: 4px solid #3498db;
	color: #0c5d95;
}

__BLOCK_CLASSNAME__.is-style-success {
	background-color: #e8f8f5;
	border-left: 4px solid #2ecc71;
	color: #1b7943;
}

__BLOCK_CLASSNAME__.is-style-warning {
	background-color: #fef9e7;
	border-left: 4px solid #f1c40f;
	color: #9a7d0a;
}

__BLOCK_CLASSNAME__.is-style-error {
	background-color: #fdedec;
	border-left: 4px solid #e74c3c;
	color: #922b21;
}`,
	},
};
