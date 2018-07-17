<?php
/**
 * This file is part of Mustache.php.
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 * Changes to match xamin-std and handlebars made by xamin team
 *
 * PHP version 5.3
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @author    Behrooz Shabani <everplays@gmail.com>
 * @copyright 2010-2012 (c) Justin Hileman
 * @copyright 2012 (c) ParsPooyesh Co
 * @copyright 2013 (c) Behrooz Shabani
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   GIT: $Id$
 * @link      http://xamin.ir
 */

namespace Handlebars;

/**
 * Autloader for handlebars.php
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @copyright 2010-2012 (c) Justin Hileman
 * @copyright 2012 (c) ParsPooyesh Co
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   Release: @package_version@
 * @link      http://xamin.ir
 */

class Autoloader
{

    private $_baseDir;

    /**
     * Autoloader constructor.
     *
     * @param string $baseDir Handlebars library base directory default is
     *                        __DIR__.'/..'
     */
    protected function __construct($baseDir = null)
    {
        if ($baseDir === null) {
            $this->_baseDir = realpath(__DIR__ . '/..');
        } else {
            $this->_baseDir = rtrim($baseDir, '/');
        }
    }

    /**
     * Register a new instance as an SPL autoloader.
     *
     * @param string $baseDir Handlebars library base directory, default is
     *                        __DIR__.'/..'
     *
     * @return \Handlebars\Autoloader Registered Autoloader instance
     */
    public static function register($baseDir = null)
    {
        $loader = new self($baseDir);
        spl_autoload_register(array($loader, 'autoload'));

        return $loader;
    }

    /**
     * Autoload Handlebars classes.
     *
     * @param string $class class to load
     *
     * @return void
     */
    public function autoload($class)
    {
        if ($class[0] !== '\\') {
            $class = '\\' . $class;
        }

        if (strpos($class, 'Handlebars') !== 1) {
            return;
        }

        $file = sprintf(
            '%s%s.php',
            $this->_baseDir,
            str_replace('\\', '/', $class)
        );

        if (is_file($file)) {
            include $file;
        }
    }

}
