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
 * @author    Justin Hileman <dontknow@example.org>
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @author    Behrooz Shabani <everplays@gmail.com>
 * @author    Dmitriy Simushev <simushevds@gmail.com>
 * @copyright 2010-2012 (c) Justin Hileman
 * @copyright 2012 (c) ParsPooyesh Co
 * @copyright 2013 (c) Behrooz Shabani
 * @license   MIT <http://opensource.org/licenses/mit-license.php>
 * @version   GIT: $Id$
 * @link      http://xamin.ir
 */

namespace Handlebars;

/**
 * Handlebars tokenizer (based on mustache)
 *
 * @category  Xamin
 * @package   Handlebars
 * @author    Justin Hileman <dontknow@example.org>
 * @author    fzerorubigd <fzerorubigd@gmail.com>
 * @copyright 2012 Justin Hileman
 * @license   MIT <http://opensource.org/licenses/mit-license.php>
 * @version   Release: @package_version@
 * @link      http://xamin.ir
 */

class Tokenizer
{

    // Finite state machine states
    const IN_TEXT = 0;
    const IN_TAG_TYPE = 1;
    const IN_TAG = 2;

    // Token types
    const T_SECTION = '#';
    const T_INVERTED = '^';
    const T_END_SECTION = '/';
    const T_COMMENT = '!';
    // XXX: remove partials support from tokenizer and make it a helper?
    const T_PARTIAL = '>';
    const T_PARTIAL_2 = '<';
    const T_DELIM_CHANGE = '=';
    const T_ESCAPED = '_v';
    const T_UNESCAPED = '{';
    const T_UNESCAPED_2 = '&';
    const T_TEXT = '_t';
    const T_ESCAPE = "\\";
    const T_SINGLE_Q = "'";
    const T_DOUBLE_Q = "\"";
    const T_TRIM = "~";

    // Valid token types
    private static $_tagTypes = array(
        self::T_SECTION => true,
        self::T_INVERTED => true,
        self::T_END_SECTION => true,
        self::T_COMMENT => true,
        self::T_PARTIAL => true,
        self::T_PARTIAL_2 => true,
        self::T_DELIM_CHANGE => true,
        self::T_ESCAPED => true,
        self::T_UNESCAPED => true,
        self::T_UNESCAPED_2 => true,
    );

    // Interpolated tags
    private static $_interpolatedTags = array(
        self::T_ESCAPED => true,
        self::T_UNESCAPED => true,
        self::T_UNESCAPED_2 => true,
    );

    // Token properties
    const TYPE = 'type';
    const NAME = 'name';
    const OTAG = 'otag';
    const CTAG = 'ctag';
    const INDEX = 'index';
    const END = 'end';
    const INDENT = 'indent';
    const NODES = 'nodes';
    const VALUE = 'value';
    const ARGS = 'args';
    const TRIM_LEFT = 'tleft';
    const TRIM_RIGHT = 'tright';

    protected $state;
    protected $tagType;
    protected $tag;
    protected $buffer = '';
    protected $tokens;
    protected $seenTag;
    protected $lineStart;
    protected $otag;
    protected $ctag;
    protected $escaped;
    protected $escaping;
    protected $trimLeft;
    protected $trimRight;

    /**
     * Scan and tokenize template source.
     *
     * @param string $text Mustache template source to tokenize
     *
     * @internal string $delimiters Optional, pass opening and closing delimiters
     *
     * @return array Set of Mustache tokens
     */
    public function scan($text/*, $delimiters = null*/)
    {
        if ($text instanceof StringWrapper) {
            $text = $text->getString();
        }
        $this->reset();

        /* Actually we not support this. so this code is not used at all, yet.
        if ($delimiters = trim($delimiters)) {
            list($otag, $ctag) = explode(' ', $delimiters);
            $this->otag = $otag;
            $this->ctag = $ctag;
        }
        */
        $len = strlen($text);
        for ($i = 0; $i < $len; $i++) {
            $this->escaping = $this->tagChange(self::T_ESCAPE, $text, $i);

            // To play nice with helpers' arguments quote and apostrophe marks
            // should be additionally escaped only when they are not in a tag.
            $quoteInTag = $this->state != self::IN_TEXT
                && ($text[$i] == self::T_SINGLE_Q || $text[$i] == self::T_DOUBLE_Q);

            if ($this->escaped && !$this->tagChange($this->otag, $text, $i) && !$quoteInTag) {
                $this->buffer .= "\\";
            }

            switch ($this->state) {
            case self::IN_TEXT:
                // Handlebars.js does not think that openning curly brace in
                // "\\\{{data}}" template is escaped. Instead it removes one
                // slash and leaves others "as is". To emulate similar behavior
                // we have to check the last character in the buffer. If it's a
                // slash we actually does not need to escape openning curly
                // brace.
                $prev_slash = substr($this->buffer, -1) == '\\';

                if ($this->tagChange($this->otag. self::T_TRIM, $text, $i) and (!$this->escaped || $prev_slash)) {
                    $this->flushBuffer();
                    $this->state = self::IN_TAG_TYPE;
                    $this->trimLeft = true;
                } elseif ($this->tagChange(self::T_UNESCAPED.$this->otag, $text, $i) and $this->escaped) {
                    $this->buffer .= "{{{";
                    $i += 2;
                    break;
                } elseif ($this->tagChange($this->otag, $text, $i) and (!$this->escaped || $prev_slash)) {
                    $i--;
                    $this->flushBuffer();
                    $this->state = self::IN_TAG_TYPE;
                } elseif ($this->escaped and $this->escaping) {
                    // We should not add extra slash before opening tag because
                    // doubled slash where should be transformed to single one
                    if (($i + 1) < $len && !$this->tagChange($this->otag, $text, $i + 1)) {
                        $this->buffer .= "\\";
                    }
                } elseif (!$this->escaping) {
                    if ($text[$i] == "\n") {
                        $this->filterLine();
                    } else {
                        $this->buffer .= $text[$i];
                    }
                }
                break;

            case self::IN_TAG_TYPE:

                $i += strlen($this->otag) - 1;
                if (isset(self::$_tagTypes[$text[$i + 1]])) {
                    $tag = $text[$i + 1];
                    $this->tagType = $tag;
                } else {
                    $tag = null;
                    $this->tagType = self::T_ESCAPED;
                }

                if ($this->tagType === self::T_DELIM_CHANGE) {
                    $i = $this->changeDelimiters($text, $i);
                    $this->state = self::IN_TEXT;
                } else {
                    if ($tag !== null) {
                        $i++;
                    }
                    $this->state = self::IN_TAG;
                }
                $this->seenTag = $i;
                break;

            default:
                if ($this->tagChange(self::T_TRIM . $this->ctag, $text, $i)) {
                    $this->trimRight = true;
                    break;
                }
                if ($this->tagChange($this->ctag, $text, $i)) {
                    // Sections (Helpers) can accept parameters
                    // Same thing for Partials (little known fact)
                    if (($this->tagType == self::T_SECTION)
                        || ($this->tagType == self::T_PARTIAL)
                        || ($this->tagType == self::T_PARTIAL_2)
                    ) {
                        $newBuffer = explode(' ', trim($this->buffer), 2);
                        $args = '';
                        if (count($newBuffer) == 2) {
                            $args = $newBuffer[1];
                        }
                        $this->buffer = $newBuffer[0];
                    }
                    $t = array(
                        self::TYPE => $this->tagType,
                        self::NAME => trim($this->buffer),
                        self::OTAG => $this->otag,
                        self::CTAG => $this->ctag,
                        self::INDEX => ($this->tagType == self::T_END_SECTION) ?
                            $this->seenTag - strlen($this->otag) :
                            $i + strlen($this->ctag),
                        self::TRIM_LEFT => $this->trimLeft,
                        self::TRIM_RIGHT => $this->trimRight
                    );
                    if (isset($args)) {
                        $t[self::ARGS] = $args;
                    }
                    $this->tokens[] = $t;
                    unset($t);
                    unset($args);
                    $this->buffer = '';
                    $this->trimLeft = false;
                    $this->trimRight = false;
                    $i += strlen($this->ctag) - 1;
                    $this->state = self::IN_TEXT;
                    if ($this->tagType == self::T_UNESCAPED) {
                        if ($this->ctag == '}}') {
                            $i++;
                        } /* else { // I can't remember why this part is here! the ctag is always }} and
                            // Clean up `{{{ tripleStache }}}` style tokens.
                            $lastIndex = count($this->tokens) - 1;
                            $lastName = $this->tokens[$lastIndex][self::NAME];
                            if (substr($lastName, -1) === '}') {
                                $this->tokens[$lastIndex][self::NAME] = trim(
                                    substr($lastName, 0, -1)
                                );
                            }
                        } */
                    }
                } else {
                    $this->buffer .= $text[$i];
                }
                break;
            }

            $this->escaped = ($this->escaping and !$this->escaped);
        }

        $this->filterLine(true);

        return $this->tokens;
    }

    /**
     * Helper function to reset tokenizer internal state.
     *
     * @return void
     */
    protected function reset()
    {
        $this->state = self::IN_TEXT;
        $this->escaped = false;
        $this->escaping = false;
        $this->tagType = null;
        $this->tag = null;
        $this->buffer = '';
        $this->tokens = array();
        $this->seenTag = false;
        $this->lineStart = 0;
        $this->otag = '{{';
        $this->ctag = '}}';
        $this->trimLeft = false;
        $this->trimRight = false;
    }

    /**
     * Flush the current buffer to a token.
     *
     * @return void
     */
    protected function flushBuffer()
    {
        if ($this->buffer !== '') {
            $this->tokens[] = array(
                self::TYPE => self::T_TEXT,
                self::VALUE => $this->buffer
            );
            $this->buffer = '';
        }
    }

    /**
     * Test whether the current line is entirely made up of whitespace.
     *
     * @return boolean True if the current line is all whitespace
     */
    protected function lineIsWhitespace()
    {
        $tokensCount = count($this->tokens);
        for ($j = $this->lineStart; $j < $tokensCount; $j++) {
            $token = $this->tokens[$j];
            if (isset(self::$_tagTypes[$token[self::TYPE]])) {
                if (isset(self::$_interpolatedTags[$token[self::TYPE]])) {
                    return false;
                }
            } elseif ($token[self::TYPE] == self::T_TEXT) {
                if (preg_match('/\S/', $token[self::VALUE])) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Filter out whitespace-only lines and store indent levels for partials.
     *
     * @param bool $noNewLine Suppress the newline? (default: false)
     *
     * @return void
     */
    protected function filterLine($noNewLine = false)
    {
        $this->flushBuffer();
        if ($this->seenTag && $this->lineIsWhitespace()) {
            $tokensCount = count($this->tokens);
            for ($j = $this->lineStart; $j < $tokensCount; $j++) {
                if ($this->tokens[$j][self::TYPE] == self::T_TEXT) {
                    if (isset($this->tokens[$j + 1])
                        && $this->tokens[$j + 1][self::TYPE] == self::T_PARTIAL
                    ) {
                        $this->tokens[$j + 1][self::INDENT]
                            = $this->tokens[$j][self::VALUE];
                    }

                    $this->tokens[$j] = null;
                }
            }
        } elseif (!$noNewLine) {
            $this->tokens[] = array(self::TYPE => self::T_TEXT, self::VALUE => "\n");
        }

        $this->seenTag = false;
        $this->lineStart = count($this->tokens);
    }

    /**
     * Change the current Handlebars delimiters. Set new `otag` and `ctag` values.
     *
     * @param string $text  Mustache template source
     * @param int    $index Current tokenizer index
     *
     * @return int New index value
     */
    protected function changeDelimiters($text, $index)
    {
        $startIndex = strpos($text, '=', $index) + 1;
        $close = '=' . $this->ctag;
        $closeIndex = strpos($text, $close, $index);

        list($otag, $ctag) = explode(
            ' ',
            trim(substr($text, $startIndex, $closeIndex - $startIndex))
        );
        $this->otag = $otag;
        $this->ctag = $ctag;

        return $closeIndex + strlen($close) - 1;
    }

    /**
     * Test whether it's time to change tags.
     *
     * @param string $tag   Current tag name
     * @param string $text  Handlebars template source
     * @param int    $index Current tokenizer index
     *
     * @return boolean True if this is a closing section tag
     */
    protected function tagChange($tag, $text, $index)
    {
        return substr($text, $index, strlen($tag)) === $tag;
    }

}
