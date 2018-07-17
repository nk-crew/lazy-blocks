<?php
/**
 * This file is part of Handlebars-php
 * Based on mustache-php https://github.com/bobthecow/mustache.php
 *
 * PHP version 5.3
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @author    Behrooz Shabani <everplays@gmail.com>
 * @author    Jeff Turcotte <jeff.turcotte@gmail.com>
 * @author    Mária Šormanová <maria.sormanova@gmail.com>
 * @copyright 2010-2012 (c) Justin Hileman
 * @copyright 2012 (c) ParsPooyesh Co
 * @copyright 2013 (c) Behrooz Shabani
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   GIT: $Id$
 * @link      http://xamin.ir
 */

namespace Handlebars;
use Handlebars\Loader\StringLoader;
use Handlebars\Cache\Dummy;

/**
 * Handlebars template engine, based on mustache.
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @copyright 2012 (c) ParsPooyesh Co
 * @license   MIT <http://opensource.org/licenses/MIT>
 * @version   Release: @package_version@
 * @link      http://xamin.ir
 */

class Handlebars
{
    private static $_instance = false;
    const VERSION = '1.1.0';

    /**
     * Factory method
     *
     * @param array $options see __construct's options parameter
     *
     * @return Handlebars
     */
    public static function factory($options = array())
    {
        if (self::$_instance === false) {
            self::$_instance = new Handlebars($options);
        }

        return self::$_instance;
    }

    /**
     * Current tokenizer instance
     *
     * @var Tokenizer
     */
    private $_tokenizer;

    /**
     * Current parser instance
     *
     * @var Parser
     */
    private $_parser;

    /**
     * Current helper list
     *
     * @var Helpers
     */
    private $_helpers;

    /**
     * Current loader instance
     *
     * @var Loader
     */
    private $_loader;

    /**
     * Current partial loader instance
     *
     * @var Loader
     */
    private $_partialsLoader;

    /**
     * Current cache instance
     *
     * @var Cache
     */
    private $_cache;

    /**
     * @var int time to live parameter in seconds for the cache usage
     *          default set to 0 which means that entries stay in cache
     *          forever and are never purged
     */
    private $_ttl = 0;

    /**
     * @var string the class to use for the template
     */
    private $_templateClass = 'Handlebars\\Template';

    /**
     * @var callable escape function to use
     */
    private $_escape = 'htmlspecialchars';

    /**
     * Parameters for the escpae method above
     *
     * @var array parametes to pass to escape function
     */
    private $_escapeArgs = array(
        ENT_COMPAT,
        'UTF-8'
    );

    private $_aliases = array();

    /**
     * Handlebars engine constructor
     * $options array can contain :
     * helpers        => Helpers object
     * escape         => a callable function to escape values
     * escapeArgs     => array to pass as extra parameter to escape function
     * loader         => Loader object
     * partials_loader => Loader object
     * cache          => Cache object
     * template_class => the class to use for the template object
     *
     * @param array $options array of options to set
     *
     * @throws \InvalidArgumentException
     */
    public function __construct(array $options = array())
    {
        if (isset($options['helpers'])) {
            $this->setHelpers($options['helpers']);
        }

        if (isset($options['loader'])) {
            $this->setLoader($options['loader']);
        }

        if (isset($options['partials_loader'])) {
            $this->setPartialsLoader($options['partials_loader']);
        }

        if (isset($options['cache'])) {
            $this->setCache($options['cache']);
        }

        if (isset($options['ttl'])) {
            $this->setTtl($options['ttl']);
        }

        if (isset($options['template_class'])) {
            $this->setTemplateClass($options['template_class']);
        }

        if (isset($options['escape'])) {
            if (!is_callable($options['escape'])) {
                throw new \InvalidArgumentException(
                    'Handlebars Constructor "escape" option must be callable'
                );
            }

            $this->_escape = $options['escape'];
        }

        if (isset($options['escapeArgs'])) {
            if (!is_array($options['escapeArgs'])) {
                $options['escapeArgs'] = array($options['escapeArgs']);
            }
            $this->_escapeArgs = $options['escapeArgs'];
        }

        if (isset($options['partials_alias'])
            && is_array($options['partials_alias'])
        ) {
            $this->_aliases = $options['partials_alias'];
        }
    }


    /**
     * Shortcut 'render' invocation.
     *
     * Equivalent to calling `$handlebars->loadTemplate($template)->render($data);`
     *
     * @param string $template template name
     * @param mixed  $data     data to use as context
     *
     * @return string Rendered template
     * @see    Handlebars::loadTemplate
     * @see    Template::render
     */
    public function render($template, $data)
    {
        return $this->loadTemplate($template)->render($data);
    }

    /**
     * Set helpers for current enfine
     *
     * @param Helpers $helpers handlebars helper
     *
     * @return void
     */
    public function setHelpers(Helpers $helpers)
    {
        $this->_helpers = $helpers;
    }

    /**
     * Get helpers, or create new one if ther is no helper
     *
     * @return Helpers
     */
    public function getHelpers()
    {
        if (!isset($this->_helpers)) {
            $this->_helpers = new Helpers();
        }

        return $this->_helpers;
    }

    /**
     * Add a new helper.
     *
     * @param string $name   helper name
     * @param mixed  $helper helper callable
     *
     * @return void
     */
    public function addHelper($name, $helper)
    {
        $this->getHelpers()->add($name, $helper);
    }

    /**
     * Get a helper by name.
     *
     * @param string $name helper name
     *
     * @return callable Helper
     */
    public function getHelper($name)
    {
        return $this->getHelpers()->__get($name);
    }

    /**
     * Check whether this instance has a helper.
     *
     * @param string $name helper name
     *
     * @return boolean True if the helper is present
     */
    public function hasHelper($name)
    {
        return $this->getHelpers()->has($name);
    }
    
     /**
     * Add a new helper.
     *
     * @param string $name   helper name
     * @param mixed  $helper helper callable
     *
     * @return void
     */
    public function registerHelper($name, $helper)
    {    
        $callback = function ($template, $context, $arg) use ($helper) {
            $args = $template->parseArguments($arg);
            $named = $template->parseNamedArguments($arg);
            
            foreach ($args as $i => $arg) {
                //if it's literally string
                if ($arg instanceof BaseString) {
                    //we have no problems here
                    $args[$i] = (string) $arg;
                    continue;
                }
                
                //not sure what to do if it's not a string or StringWrapper
                if (!is_string($arg)) {
                    continue;
                }
                
                //it's a variable and we need to figure out the value of it
                $args[$i] = $context->get($arg);
            }
            
            //push the options    
            $args[] = array(
                //special fields
                'data' => array(
                    'index' => $context->get('@index'),
                    'key' => $context->get('@key'),
                    'first' => $context->get('@first'),
                    'last' => $context->get('@last')),
                // Named arguments
                'hash' => $named,
                // A renderer for block helper
                'fn' => function ($inContext = null) use ($context, $template) {
                    $defined = !!$inContext;
                    
                    if (!$defined) {
                        $inContext = $context;
                        $inContext->push($inContext->last());
                    } else if (!$inContext instanceof Context) {
                        $inContext = new ChildContext($inContext);
                        $inContext->setParent($context);
                    }
                    
                    $template->setStopToken('else');
                    $buffer = $template->render($inContext);
                    $template->setStopToken(false);
                    //what if it's a loop ?
                    $template->rewind();
                    //What's the point of this again?
                    //I mean in this context (literally)
                    //$template->discard($inContext);
                    
                    if (!$defined) {
                        $inContext->pop();
                    }
                    
                    return $buffer;
                },
                
                // A render for the else block
                'inverse' => function ($inContext = null) use ($context, $template) {
                    $defined = !!$inContext;
                    
                    if (!$defined) {
                        $inContext = $context;
                        $inContext->push($inContext->last());
                    } else if (!$inContext instanceof Context) {
                        $inContext = new ChildContext($inContext);
                        $inContext->setParent($context);
                    }
                    
                    $template->setStopToken('else');
                    $template->discard($inContext);
                    $template->setStopToken(false);
                    $buffer = $template->render($inContext);
                    
                    if (!$defined) {
                        $inContext->pop();
                    }
                    
                    return $buffer;
                },
                
                // The current context.
                'context' => $context,
                // The current template
                'template' => $template);
            
            return call_user_func_array($helper, $args);
        };
    
        $this->addHelper($name, $callback);
    }

    /**
     * Remove a helper by name.
     *
     * @param string $name helper name
     *
     * @return void
     */
    public function removeHelper($name)
    {
        $this->getHelpers()->remove($name);
    }

    /**
     * Set current loader
     *
     * @param Loader $loader handlebars loader
     *
     * @return void
     */
    public function setLoader(Loader $loader)
    {
        $this->_loader = $loader;
    }

    /**
     * Get current loader
     *
     * @return Loader
     */
    public function getLoader()
    {
        if (!isset($this->_loader)) {
            $this->_loader = new StringLoader();
        }

        return $this->_loader;
    }

    /**
     * Set current partials loader
     *
     * @param Loader $loader handlebars loader
     *
     * @return void
     */
    public function setPartialsLoader(Loader $loader)
    {
        $this->_partialsLoader = $loader;
    }

    /**
     * Get current partials loader
     *
     * @return Loader
     */
    public function getPartialsLoader()
    {
        if (!isset($this->_partialsLoader)) {
            $this->_partialsLoader = new StringLoader();
        }

        return $this->_partialsLoader;
    }

    /**
     * Set cache  for current engine
     *
     * @param Cache $cache handlebars cache
     *
     * @return void
     */
    public function setCache(Cache $cache)
    {
        $this->_cache = $cache;
    }

    /**
     * Get cache
     *
     * @return Cache
     */
    public function getCache()
    {
        if (!isset($this->_cache)) {
            $this->_cache = new Dummy();
        }

        return $this->_cache;
    }

    /**
     * Set time to live for the used cache
     *
     * @param int $ttl time to live in seconds
     *
     * @return void
     */
    public function setTtl($ttl)
    {
        $this->_ttl = $ttl;
    }

    /**
     * Get ttl
     *
     * @return int
     */
    public function getTtl()
    {
        return $this->_ttl;
    }

    /**
     * Get current escape function
     *
     * @return callable
     */
    public function getEscape()
    {
        return $this->_escape;
    }

    /**
     * Set current escape function
     *
     * @param callable $escape function
     *
     * @throws \InvalidArgumentException
     * @return void
     */
    public function setEscape($escape)
    {
        if (!is_callable($escape)) {
            throw new \InvalidArgumentException(
                'Escape function must be a callable'
            );
        }
        $this->_escape = $escape;
    }

    /**
     * Get current escape function
     *
     * @return array
     */
    public function getEscapeArgs()
    {
        return $this->_escapeArgs;
    }

    /**
     * Set current escape function
     *
     * @param array $escapeArgs arguments to pass as extra arg to function
     *
     * @return void
     */
    public function setEscapeArgs($escapeArgs)
    {
        if (!is_array($escapeArgs)) {
            $escapeArgs = array($escapeArgs);
        }
        $this->_escapeArgs = $escapeArgs;
    }


    /**
     * Set the Handlebars Tokenizer instance.
     *
     * @param Tokenizer $tokenizer tokenizer
     *
     * @return void
     */
    public function setTokenizer(Tokenizer $tokenizer)
    {
        $this->_tokenizer = $tokenizer;
    }

    /**
     * Get the current Handlebars Tokenizer instance.
     *
     * If no Tokenizer instance has been explicitly specified, this method will
     * instantiate and return a new one.
     *
     * @return Tokenizer
     */
    public function getTokenizer()
    {
        if (!isset($this->_tokenizer)) {
            $this->_tokenizer = new Tokenizer();
        }

        return $this->_tokenizer;
    }

    /**
     * Set the Handlebars Parser instance.
     *
     * @param Parser $parser parser object
     *
     * @return void
     */
    public function setParser(Parser $parser)
    {
        $this->_parser = $parser;
    }

    /**
     * Get the current Handlebars Parser instance.
     *
     * If no Parser instance has been explicitly specified, this method will
     * instantiate and return a new one.
     *
     * @return Parser
     */
    public function getParser()
    {
        if (!isset($this->_parser)) {
            $this->_parser = new Parser();
        }

        return $this->_parser;
    }

    /**
     * Sets the class to use for the template object
     *
     * @param string $class the class name
     *
     * @return void
     */
    public function setTemplateClass($class)
    {
        if (!is_a($class, 'Handlebars\\Template', true)) {
            throw new \InvalidArgumentException(
                sprintf(
                    'Custom template class "%s" must extend Template',
                    $class
                )
            );
        }

        $this->_templateClass = $class;
    }

    /**
     * Load a template by name with current template loader
     *
     * @param string $name template name
     *
     * @return Template
     */
    public function loadTemplate($name)
    {
        $source = $this->getLoader()->load($name);
        $tree = $this->_tokenize($source);

        return new $this->_templateClass($this, $tree, $source);
    }

    /**
     * Load a partial by name with current partial loader
     *
     * @param string $name partial name
     *
     * @return Template
     */
    public function loadPartial($name)
    {
        if (isset($this->_aliases[$name])) {
            $name = $this->_aliases[$name];
        }
        $source = $this->getPartialsLoader()->load($name);
        $tree = $this->_tokenize($source);

        return new $this->_templateClass($this, $tree, $source);
    }

    /**
     * Register partial alias
     *
     * @param string $alias   Partial alias
     * @param string $content The real value
     *
     * @return void
     */
    public function registerPartial($alias, $content)
    {
        $this->_aliases[$alias] = $content;
    }

    /**
     * Un-register partial alias
     *
     * @param string $alias Partial alias
     *
     * @return void
     */
    public function unRegisterPartial($alias)
    {
        if (isset($this->_aliases[$alias])) {
            unset($this->_aliases[$alias]);
        }
    }

    /**
     * Load string into a template object
     *
     * @param string $source string to load
     *
     * @return Template
     */
    public function loadString($source)
    {
        $tree = $this->_tokenize($source);

        return new $this->_templateClass($this, $tree, $source);
    }

    /**
     * Try to tokenize source, or get them from cache if available
     *
     * @param string $source handlebars source code
     *
     * @return array handlebars parsed data into array
     */
    private function _tokenize($source)
    {
        $hash = md5(sprintf('version: %s, data : %s', self::VERSION, $source));
        $tree = $this->getCache()->get($hash);
        if ($tree === false) {
            $tokens = $this->getTokenizer()->scan($source);
            $tree = $this->getParser()->parse($tokens);
            $this->getCache()->set($hash, $tree, $this->_ttl);
        }

        return $tree;
    }

}
