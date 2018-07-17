<?php
/**
 * This file is part of Handlebars-php
 * Base on mustache-php https://github.com/bobthecow/mustache.php
 *
 * PHP version 5.3
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @copyright 2014 (c) f0ruD
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   GIT: $Id$
 * @link      http://xamin.ir
 */

namespace Handlebars\Loader;

use Handlebars\Loader;

/**
 * Handlebars Template array Loader implementation.
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @copyright 2014 (c) f0ruD
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   Release: @package_version@
 * @link      http://xamin.ir *
 */
class ArrayLoader implements Loader
{
    private $_templates;

    /**
     * Create a new loader with associative array style
     *
     * @param array $templates the templates to load
     */
    public function __construct(array $templates = array())
    {
        $this->_templates = $templates;
    }

    /**
     * Add a template to list
     *
     * @param string $name     template name
     * @param string $template the template
     *
     * @return void
     */
    public function addTemplate($name, $template)
    {
        $this->_templates[$name] = $template;
    }

    /**
     * Load a Template by name.
     *
     * @param string $name template name to load
     *
     * @throws \RuntimeException
     * @return String
     */
    public function load($name)
    {
        if (isset($this->_templates[$name])) {
            return $this->_templates[$name];
        }
        throw new \RuntimeException(
            "Can not find the $name template"
        );
    }
}