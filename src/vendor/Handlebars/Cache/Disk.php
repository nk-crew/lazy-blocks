<?php
/**
 * This file is part of Handlebars-php
 * Base on mustache-php https://github.com/bobthecow/mustache.php
 *
 * PHP version 5.3
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    Alex Soncodi <alex@brokerloop.com>
 * @author    Behrooz Shabani <everplays@gmail.com>
 * @author    Mária Šormanová <maria.sormanova@gmail.com>
 * @copyright 2013 (c) Brokerloop, Inc.
 * @copyright 2013 (c) Behrooz Shabani
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   GIT: $Id$
 * @link      http://xamin.ir
 */

namespace Handlebars\Cache;
use Handlebars\Cache;

/**
 * A flat-file filesystem cache.
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    Alex Soncodi <alex@brokerloop.com>
 * @author    Mária Šormanová <maria.sormanova@gmail.com>
 * @copyright 2013 (c) Brokerloop, Inc.
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   Release: @package_version@
 * @link      http://xamin.ir
 */

class Disk implements Cache
{

    private $_path = '';
    private $_prefix = '';
    private $_suffix = '';

    /**
     * Construct the disk cache.
     *
     * @param string $path   Filesystem path to the disk cache location
     * @param string $prefix optional file prefix, defaults to empty string
     * @param string $suffix optional file extension, defaults to empty string
     *
     * @throws \RuntimeException
     * @throws \InvalidArgumentException
     */
    public function __construct($path, $prefix = '', $suffix = '')
    {
        if (empty($path)) {
            throw new \InvalidArgumentException('Must specify disk cache path');
        } elseif (!is_dir($path)) {
            @mkdir($path, 0777, true);

            if (!is_dir($path)) {
                throw new \RuntimeException('Could not create cache file path');
            }
        }

        $this->_path = $path;
        $this->_prefix = $prefix;
        $this->_suffix = $suffix;
    }

    /**
     * Gets the full disk path for a given cache item's file,
     * taking into account the cache path, optional prefix,
     * and optional extension.
     *
     * @param string $name Name of the cache item
     *
     * @return string full disk path of cached item
     */
    private function _getPath($name)
    {
        return $this->_path . DIRECTORY_SEPARATOR .
            $this->_prefix . $name . $this->_suffix;
    }

    /**
     * Get cache for $name if it exists
     * and if the cache is not older than defined TTL.
     *
     * @param string $name Cache id
     *
     * @return mixed data on hit, boolean false on cache not found/expired
     */
    public function get($name)
    {
        $path = $this->_getPath($name);
        $output = false;
        if (file_exists($path)) {
            $file = fopen($path, "r");
            $ttl = fgets($file);
            $ctime = filectime($path);
            $time = time();
            if ($ttl == -1 || ($ttl > 0 && $time - $ctime > $ttl)) {
                unlink($path);
            } else {
                $serialized_data = fread($file, filesize($path));
                $output = unserialize($serialized_data);
            }
            fclose($file);
        }
        return $output;
    }

    /**
     * Set a cache with $ttl, if present
     * If $ttl set to -1, the cache expires immediately
     * If $ttl set to 0 (default), cache is never purged
     *
     * @param string $name  cache id
     * @param mixed  $value data to store
     * @param int    $ttl   time to live in seconds
     *
     * @return void
     */
    public function set($name, $value, $ttl = 0)
    {
        $path = $this->_getPath($name);

        file_put_contents($path, $ttl.PHP_EOL.serialize($value));
    }

    /**
     * Remove cache
     *
     * @param string $name Cache id
     *
     * @return void
     */
    public function remove($name)
    {
        $path = $this->_getPath($name);

        unlink($path);
    }

}
