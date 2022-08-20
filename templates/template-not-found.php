<?php
/**
 * Output notice if block template not found.
 *
 * @var $template_name
 *
 * @package lazyblocks
 */

?>

<div class="notice notice-warning">
    <?php
    echo wp_kses_post(
        sprintf(
            // translators: %1$s - template file path.
            __( 'Template file <code>%1$s</code> not found.', 'lazy-blocks' ),
            'blocks/' . $template_name . '/block.php'
        )
    );
    ?>
</div>
