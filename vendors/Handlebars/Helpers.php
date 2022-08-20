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
 * @author    Dmitriy Simushev <simushevds@gmail.com>
 * @author    Jeff Turcotte <jeff.turcotte@gmail.com>
 * @copyright 2012 (c) ParsPooyesh Co
 * @copyright 2013 (c) Behrooz Shabani
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   GIT: $Id$
 * @link      http://xamin.ir
 */

namespace Handlebars;

/**
 * Handlebars helpers
 *
 * A collection of helper function. normally a function like
 * function ($sender, $name, $arguments) $arguments is unscaped arguments and
 * is a string, not array
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @copyright 2012 (c) ParsPooyesh Co
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   Release: @package_version@
 * @link      http://xamin.ir
 */
class Helpers
{
    /**
     * Raw helper array
     *
     * @var array array of helpers
     */
    protected $helpers = array();

    /**
     * Create new helper container class
     *
     * @param array      $helpers  array of name=>$value helpers
     * @param array|bool $defaults add defaults helper
     *          (if, unless, each,with, bindAttr)
     *
     * @throws \InvalidArgumentException when $helpers is not an array
     * (or traversable) or helper is not a callable
     */
    public function __construct($helpers = null, $defaults = true)
    {
        if ($defaults) {
            $this->addDefaultHelpers();
        }
        if ($helpers != null) {
            if (!is_array($helpers) && !$helpers instanceof \Traversable) {
                throw new \InvalidArgumentException(
                    'HelperCollection constructor expects an array of helpers'
                );
            }
            foreach ($helpers as $name => $helper) {
                $this->add($name, $helper);
            }
        }
    }


    /**
     * Add default helpers (if unless each with bindAttr)
     *
     * @return void
     */
    protected function addDefaultHelpers()
    {
        $this->add('if', new Helper\IfHelper());
        $this->add('each', new Helper\EachHelper());
        $this->add('unless', new Helper\UnlessHelper());
        $this->add('with', new Helper\WithHelper());

        //Just for compatibility with ember
        $this->add('bindAttr', new Helper\BindAttrHelper());
    }

    /**
     * Add a new helper to helpers
     *
     * @param string $name   helper name
     * @param mixed  $helper a callable or Helper implementation as a helper
     *
     * @throws \InvalidArgumentException if $helper is not a callable
     * @return void
     */
    public function add($name, $helper)
    {
        if (!is_callable($helper) && ! $helper instanceof Helper) {
            throw new \InvalidArgumentException(
                sprintf(
                    "%s Helper is not a callable or doesn't implement the Helper interface.",
                    $name
                )
            );
        }
        $this->helpers[$name] = $helper;
    }

    /**
     * Add all helpers from the specified collection to the current one.
     *
     * The method will override helpers from the current collections with same
     * named helpers from the specified collection.
     *
     * @param Helpers $helpers A collection which helpers should be added.
     *
     * @return void
     */
    public function addHelpers(Helpers $helpers)
    {
        $this->helpers = $helpers->getAll() + $this->helpers;
    }

    /**
     * Calls a helper, whether it be a Closure or Helper instance
     *
     * @param string               $name     The name of the helper
     * @param \Handlebars\Template $template The template instance
     * @param \Handlebars\Context  $context  The current context
     * @param array                $args     The arguments passed the the helper
     * @param string               $source   The source
     *
     * @throws \InvalidArgumentException
     * @return mixed The helper return value
     */
    public function call($name, Template $template, Context $context, $args, $source)
    {
        if (!$this->has($name)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Unknown helper: "%s"',
                    $name
                )
            );
        }

        $parsedArgs = new Arguments($args);
        if ($this->helpers[$name] instanceof Helper) {
            return $this->helpers[$name]->execute(
                $template, $context, $parsedArgs, $source
            );
        }

        return call_user_func(
            $this->helpers[$name], 
            $template, 
            $context, 
            $parsedArgs, 
            $source
        );
    }

    /**
     * Check if $name helper is available
     *
     * @param string $name helper name
     *
     * @return boolean
     */
    public function has($name)
    {
        return array_key_exists($name, $this->helpers);
    }

    /**
     * Get a helper. __magic__ method :)
     *
     * @param string $name helper name
     *
     * @throws \InvalidArgumentException if $name is not available
     * @return callable helper function
     */
    public function __get($name)
    {
        if (!$this->has($name)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Unknown helper: "%s"',
                    $name
                )
            );
        }

        return $this->helpers[$name];
    }

    /**
     * Check if $name helper is available __magic__ method :)
     *
     * @param string $name helper name
     *
     * @return boolean
     * @see    Handlebras_Helpers::has
     */
    public function __isset($name)
    {
        return $this->has($name);
    }

    /**
     * Add a new helper to helpers __magic__ method :)
     *
     * @param string   $name   helper name
     * @param callable $helper a function as a helper
     *
     * @return void
     */
    public function __set($name, $helper)
    {
        $this->add($name, $helper);
    }

    /**
     * Unset a helper
     *
     * @param string $name helper name to remove
     *
     * @return void
     */
    public function __unset($name)
    {
        $this->remove($name);
    }

    /**
     * Check whether a given helper is present in the collection.
     *
     * @param string $name helper name
     *
     * @throws \InvalidArgumentException if the requested helper is not present.
     * @return void
     */
    public function remove($name)
    {
        if (!$this->has($name)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Unknown helper: "%s"',
                    $name
                )
            );
        }

        unset($this->helpers[$name]);
    }

    /**
     * Clear the helper collection.
     *
     * Removes all helpers from this collection
     *
     * @return void
     */
    public function clear()
    {
        $this->helpers = array();
    }

    /**
     * Check whether the helper collection is empty.
     *
     * @return boolean True if the collection is empty
     */
    public function isEmpty()
    {
        return empty($this->helpers);
    }

    /**
     * Returns all helpers from the collection.
     *
     * @return array Associative array of helpers which keys are helpers names
     * and the values are the helpers.
     */
    public function getAll()
    {
        return $this->helpers;
    }
}
