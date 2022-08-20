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
 * @author    Chris Gray <chris.w.gray@gmail.com>
 * @author    Ulrik Lystbaek <ulrik@bettertaste.dk>
 * @author    Dmitriy Simushev <simushevds@gmail.com>
 * @author    Christian Blanquera <cblanquera@openovate.com>
 * @copyright 2010-2012 (c) Justin Hileman
 * @copyright 2012 (c) ParsPooyesh Co
 * @copyright 2013 (c) Behrooz Shabani
 * @copyright 2013 (c) f0ruD A
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   GIT: $Id$
 * @link      http://xamin.ir
 */

namespace Handlebars;

/**
 * Handlebars context
 * Context for a template
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @author    Behrooz Shabani <everplays@gmail.com>
 * @copyright 2010-2012 (c) Justin Hileman
 * @copyright 2012 (c) ParsPooyesh Co
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   Release: @package_version@
 * @link      http://xamin.ir
 */

class ChildContext extends Context
{
    protected $parentContext = null;
    
    /**
     * Sets a parent context in which
     * we will case for the ../ in get()
     *
     * @param Context $parent parent context
     *
     * @return void
     */
    public function setParent(Context $parent) 
    {
        $this->parentContext = $parent;
    }
    
    /**
     * Get a available from current context
     * Supported types :
     * variable , ../variable , variable.variable , variable.[variable] , .
     *
     * @param string  $variableName variable name to get from current context
     * @param boolean $strict       strict search? if not found then throw exception
     *
     * @throws \InvalidArgumentException in strict mode and variable not found
     * @throws \RuntimeException if supplied argument is a malformed quoted string 
     * @throws \InvalidArgumentException if variable name is invalid
     * @return mixed
     */
    public function get($variableName, $strict = false)
    {
        //if the variable name starts with a ../
        //and we have a parent
        if (strpos($variableName, '../') === 0 
            && $this->parentContext instanceof Context
        ) {
            //just remove the first ../
            $variableName = substr($variableName, 3);
            
            //and let the parent context handle the rest
            return $this->parentContext->get($variableName, $strict);
        }
        
        //otherwise, it's business as usual
        return parent::get($variableName, $strict);
    }
}
