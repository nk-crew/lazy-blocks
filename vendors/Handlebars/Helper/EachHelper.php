<?php
/**
 * This file is part of Handlebars-php
 *
 * PHP version 5.3
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @author    Behrooz Shabani <everplays@gmail.com>
 * @author    Dmitriy Simushev <simushevds@gmail.com>
 * @author    Jeff Turcotte <jeff.turcotte@gmail.com>
 * @author    John Slegers <slegersjohn@gmail.com>
 * @copyright 2014 Authors
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   GIT: $Id$
 * @link      http://xamin.ir
 */

namespace Handlebars\Helper;

use Handlebars\Context;
use Handlebars\Helper;
use Handlebars\Template;

/**
 * The Each Helper
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @author    Behrooz Shabani <everplays@gmail.com>
 * @author    Dmitriy Simushev <simushevds@gmail.com>
 * @author    Jeff Turcotte <jeff.turcotte@gmail.com>
 * @author    John Slegers <slegersjohn@gmail.com>
 * @copyright 2014 Authors
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   Release: @package_version@
 * @link      http://xamin.ir
 */
class EachHelper implements Helper
{
    /**
     * Execute the helper
     *
     * @param \Handlebars\Template  $template The template instance
     * @param \Handlebars\Context   $context  The current context
     * @param \Handlebars\Arguments $args     The arguments passed the the helper
     * @param string                $source   The source
     *
     * @return mixed
     */
    public function execute(Template $template, Context $context, $args, $source)
    {
        $positionalArgs = $args->getPositionalArguments();
        $tmp = $context->get($positionalArgs[0]);
        $buffer = '';

        if (!$tmp) {
            $template->setStopToken('else');
            $template->discard();
            $template->setStopToken(false);
            $buffer = $template->render($context);
        } elseif (is_array($tmp) || $tmp instanceof \Traversable) {
            $isList = is_array($tmp) && (array_keys($tmp) === range(0, count($tmp) - 1));
            $index = 0;
            $lastIndex = $isList ? (count($tmp) - 1) : false;

            foreach ($tmp as $key => $var) {
                $specialVariables = array(
                    '@index' => $index,
                    '@first' => ($index === 0),
                    '@last' => ($index === $lastIndex),
                );
                if (!$isList) {
                    $specialVariables['@key'] = $key;
                }
                $context->pushSpecialVariables($specialVariables);
                $context->push($var);
                $template->setStopToken('else');
                $template->rewind();
                $buffer .= $template->render($context);
                $context->pop();
                $context->popSpecialVariables();
                $index++;
            }

            $template->setStopToken(false);
        }

        return $buffer;
    }
}
