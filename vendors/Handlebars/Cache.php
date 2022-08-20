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
 * @author    Behrooz Shabani <everplays@gmail.com>
 * @author    Mária Šormanová <maria.sormanova@gmail.com>
 * @copyright 2012 (c) ParsPooyesh Co
 * @copyright 2013 (c) Behrooz Shabani
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   GIT: $Id$
 * @link      http://xamin.ir
 */

namespace Handlebars;

/**
 * Cache interface
 * Base cache interface, Note that Handlebars.php never call for remove.
 * Driver should take care of expiered cache.
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

interface Cache
{

    /**
     * Get cache for $name if exist.
     *
     * @param string $name Cache id
     *
     * @return mixed data on hit, boolean false on cache not found
     */
    public function get($name);

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
    public function set($name, $value, $ttl = 0);

    /**
     * Remove cache
     *
     * @param string $name Cache id
     *
     * @return void
     */
    public function remove($name);

}