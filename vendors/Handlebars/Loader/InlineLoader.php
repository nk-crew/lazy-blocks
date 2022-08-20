<?php
/**
 * This file is part of Handlebars-php
 * Base on mustache-php https://github.com/bobthecow/mustache.php
 *
 * Handlebars Inline Template string Loader implementation.
 *
 * With the InlineLoader, templates can be defined at the end of any PHP source
 * file:
 *
 *     $loader  = new \Handlebars\Loader\InlineLoader(__FILE__, __COMPILER_HALT_OFFSET__);
 *     $hello   = $loader->load('hello');
 *     $goodbye = $loader->load('goodbye');
 *
 *     __halt_compiler();
 *
 *     @@ hello
 *     Hello, {{ planet }}!
 *
 *     @@ goodbye
 *     Goodbye, cruel {{ planet }}
 *
 * Templates are deliniated by lines containing only `@@ name`.
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @author    Hiroyuki Toda <mai7star@gmail.com>
 * @copyright 2010-2015 (c) Justin Hileman
 * @copyright 2015 (c) fzerorubigd
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   Release: @package_version@
 * @link      http://xamin.ir
 */

namespace Handlebars\Loader;

use Handlebars\Loader;

/**
 * The inline loader
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @author    Hiroyuki Toda <mai7star@gmail.com>
 * @copyright 2010-2015 (c) Justin Hileman
 * @copyright 2015 (c) fzerorubigd
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   Release: @package_version@
 * @link      http://xamin.ir *
 */
class InlineLoader implements Loader
{
    protected $fileName;
    protected $offset;
    protected $templates;

    /**
     * The InlineLoader requires a filename and offset to process templates.
     * The magic constants `__FILE__` and `__COMPILER_HALT_OFFSET__` are usually
     * perfectly suited to the job:
     *
     *     $loader = new \Handlebars\Loader\InlineLoader(__FILE__, __COMPILER_HALT_OFFSET__);
     *
     * Note that this only works if the loader is instantiated inside the same
     * file as the inline templates. If the templates are located in another
     * file, it would be necessary to manually specify the filename and offset.
     *
     * @param string $fileName The file to parse for inline templates
     * @param int    $offset   A string offset for the start of the templates.
     *                         This usually coincides with the `__halt_compiler`
     *                         call, and the `__COMPILER_HALT_OFFSET__`.
     */
    public function __construct($fileName, $offset)
    {
        if (!is_file($fileName)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'InlineLoader expects a valid filename, "%s" given.',
                    $fileName
                )
            );
        }

        if (!is_int($offset) || $offset < 0) {
            throw new \InvalidArgumentException(
                sprintf(
                    'InlineLoader expects a valid file offset, "%s" given.',
                    $offset
                )
            );
        }

        $this->fileName = $fileName;
        $this->offset = $offset;
    }

    /**
     * Load a Template by name.
     *
     * @param string $name template name
     *
     * @return string Handlebars Template source
     */
    public function load($name)
    {
        $this->loadTemplates();

        if (!array_key_exists($name, $this->templates)) {
            throw new \InvalidArgumentException("Template $name not found.");
        }

        return $this->templates[$name];
    }

    /**
     * Parse and load templates from the end of a source file.
     *
     * @return void
     */
    protected function loadTemplates()
    {
        if (!is_null($this->templates)) {
            return;
        }

        $this->templates = array();
        $data = file_get_contents($this->fileName, false, null, $this->offset);
        foreach (preg_split('/^@@(?= [\w\d\.]+$)/m', $data, -1) as $chunk) {
            if (trim($chunk)) {
                list($name, $content) = explode("\n", $chunk, 2);
                $this->templates[trim($name)] = trim($content);
            }
        }
    }
}