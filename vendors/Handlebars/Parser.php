<?php
/**
 * This file is part of Handlebars-php
 * Base on mustache-php https://github.com/bobthecow/mustache.php
 * re-write to use with handlebars
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
 * Handlebars parser (based on mustache)
 *
 * This class is responsible for turning raw template source into a set of
 * Handlebars tokens.
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

class Parser
{
    /**
     * Process array of tokens and convert them into parse tree
     *
     * @param array $tokens Set of
     *
     * @return array Token parse tree
     */
    public function parse(array $tokens = array())
    {
        return $this->_buildTree(new \ArrayIterator($tokens));
    }

    /**
     * Helper method for recursively building a parse tree.
     * Trim right and trim left is a bit tricky here.
     * {{#begin~}}{{TOKEN}}, TOKEN.. {{LAST}}{{~/begin}} is translated to:
     * {{#begin}}{{~TOKEN}}, TOKEN.. {{LAST~}}{{/begin}}
     *
     * @param \ArrayIterator $tokens Stream of tokens
     *
     * @throws \LogicException when nesting errors or mismatched section tags
     * are encountered.
     * @return array Token parse tree
     */
    private function _buildTree(\ArrayIterator $tokens)
    {
        $stack = array();

        do {
            $token = $tokens->current();
            $tokens->next();

            if ($token !== null) {
                switch ($token[Tokenizer::TYPE]) {
                case Tokenizer::T_END_SECTION:
                    $newNodes = array($token);
                    do {
                        $result = array_pop($stack);
                        if ($result === null) {
                            throw new \LogicException(
                                sprintf(
                                    'Unexpected closing tag: /%s',
                                    $token[Tokenizer::NAME]
                                )
                            );
                        }

                        if (!array_key_exists(Tokenizer::NODES, $result)
                            && isset($result[Tokenizer::NAME])
                            && ($result[Tokenizer::TYPE] == Tokenizer::T_SECTION
                            || $result[Tokenizer::TYPE] == Tokenizer::T_INVERTED)
                            && $result[Tokenizer::NAME] == $token[Tokenizer::NAME]
                        ) {
                            if (isset($result[Tokenizer::TRIM_RIGHT]) 
                                && $result[Tokenizer::TRIM_RIGHT]
                            ) {
                                // If the start node has trim right, then its equal 
                                //with the first item in the loop with
                                // Trim left
                                $newNodes[0][Tokenizer::TRIM_LEFT] = true;
                            }

                            if (isset($token[Tokenizer::TRIM_RIGHT]) 
                                && $token[Tokenizer::TRIM_RIGHT]
                            ) {
                                //OK, if we have trim right here, we should 
                                //pass it to the upper level.
                                $result[Tokenizer::TRIM_RIGHT] = true;
                            }

                            $result[Tokenizer::NODES] = $newNodes;
                            $result[Tokenizer::END] = $token[Tokenizer::INDEX];
                            array_push($stack, $result);
                            break;
                        } else {
                            array_unshift($newNodes, $result);
                        }
                    } while (true);
                    break;
                default:
                    array_push($stack, $token);
                }
            }

        } while ($tokens->valid());

        return $stack;
    }

}