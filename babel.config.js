module.exports = {
	presets: ['@babel/preset-env'],
	plugins: [
		[
			'@babel/plugin-transform-react-jsx',
			{
				pragma: 'wp.element.createElement',
				pragmaFrag: 'wp.element.Fragment',
			},
		],
		['@babel/plugin-proposal-object-rest-spread'],
	],
};
