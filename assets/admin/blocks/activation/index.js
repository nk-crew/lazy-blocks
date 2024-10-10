/**
 * Styles.
 */
import './index.scss';
import $ from 'jquery';

const { ajaxurl } = window;
const $body = $('body');

$body.on('click', '.lazyblocks-block-activation-switch', function (e) {
	e.preventDefault();
	const element = $(this);
	const postId = element.attr('data-post_id');
	const nonce = element.attr('data-nonce');
	const activate = element.attr('data-activate');
	$.ajax({
		type: 'post',
		dataType: 'json',
		url: ajaxurl,
		data: {
			action: 'lazyblocks_activation_block',
			postId,
			activate,
			nonce,
		},
		success(response) {
			if (response.activated && response.status === 'publish') {
				element.addClass('lazyblocks-active-block');
				element.attr('data-activate', 'false');

				//'admin-ajax.php?action=lazyblocks_activation_block&post_id=' . $post->ID . '&nonce=' . $nonce . '&activate=' . $activate
			}
			if (!response.activated && response.status === 'draft') {
				element.removeClass('lazyblocks-active-block');
				element.attr('data-activate', 'true');
			}
		},
	});
});
