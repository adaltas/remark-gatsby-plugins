/**
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('hast').Element} Element
 */

/**
 * Generate an assertion from a test.
 *
 * Useful if you’re going to test many nodes, for example when creating a
 * utility where something else passes a compatible test.
 *
 * The created function is a bit faster because it expects valid input only:
 * a `node`, `index`, and `parent`.
 *
 * @param test
 *   *  When nullish, checks if `node` is an `Element`.
 *   *  When `string`, works like passing `(element) => element.tagName === test`.
 *   *  When `function` checks if function passed the element is true.
 *   *  When `array`, checks any one of the subtests pass.
 * @returns
 *   An assertion.
 */
const convertElement =
  /**
   * @type {(
   *   (<T extends Element>(test: T['tagName'] | TestFunctionPredicate<T>) => AssertPredicate<T>) &
   *   ((test?: Test) => AssertAnything)
   * )}
   */
  (
    /**
     * @param {Test | null | undefined} [test]
     * @returns {AssertAnything}
     */
    function (test) {
      if (test === undefined || test === null) {
        return element
      }

      if (typeof test === 'string') {
        return tagNameFactory(test)
      }

      if (typeof test === 'object') {
        return anyFactory$1(test)
      }

      if (typeof test === 'function') {
        return castFactory$1(test)
      }

      throw new Error('Expected function, string, or array as test')
    }
  );

/**
 * Handle multiple tests.
 *
 * @param {Array<string | TestFunctionAnything>} tests
 * @returns {AssertAnything}
 */
function anyFactory$1(tests) {
  /** @type {Array<AssertAnything>} */
  const checks = [];
  let index = -1;

  while (++index < tests.length) {
    checks[index] = convertElement(tests[index]);
  }

  return castFactory$1(any)

  /**
   * @this {unknown}
   * @param {Array<unknown>} parameters
   * @returns {boolean}
   */
  function any(...parameters) {
    let index = -1;

    while (++index < checks.length) {
      if (checks[index].call(this, ...parameters)) {
        return true
      }
    }

    return false
  }
}

/**
 * Turn a string into a test for an element with a certain tag name.
 *
 * @param {string} check
 * @returns {AssertAnything}
 */
function tagNameFactory(check) {
  return tagName

  /**
   * @param {unknown} node
   * @returns {boolean}
   */
  function tagName(node) {
    return element(node) && node.tagName === check
  }
}

/**
 * Turn a custom test into a test for an element that passes that test.
 *
 * @param {TestFunctionAnything} check
 * @returns {AssertAnything}
 */
function castFactory$1(check) {
  return assertion

  /**
   * @this {unknown}
   * @param {unknown} node
   * @param {Array<unknown>} parameters
   * @returns {boolean}
   */
  function assertion(node, ...parameters) {
    // @ts-expect-error: fine.
    return element(node) && Boolean(check.call(this, node, ...parameters))
  }
}

/**
 * Make sure something is an element.
 *
 * @param {unknown} node
 * @returns {node is Element}
 */
function element(node) {
  return Boolean(
    node &&
      typeof node === 'object' &&
      // @ts-expect-error Looks like a node.
      node.type === 'element' &&
      // @ts-expect-error Looks like an element.
      typeof node.tagName === 'string'
  )
}

/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 */

/**
 * Generate an assertion from a test.
 *
 * Useful if you’re going to test many nodes, for example when creating a
 * utility where something else passes a compatible test.
 *
 * The created function is a bit faster because it expects valid input only:
 * a `node`, `index`, and `parent`.
 *
 * @param test
 *   *   when nullish, checks if `node` is a `Node`.
 *   *   when `string`, works like passing `(node) => node.type === test`.
 *   *   when `function` checks if function passed the node is true.
 *   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
 *   *   when `array`, checks if any one of the subtests pass.
 * @returns
 *   An assertion.
 */
const convert =
  /**
   * @type {(
   *   (<Kind extends Node>(test: PredicateTest<Kind>) => AssertPredicate<Kind>) &
   *   ((test?: Test) => AssertAnything)
   * )}
   */
  (
    /**
     * @param {Test} [test]
     * @returns {AssertAnything}
     */
    function (test) {
      if (test === undefined || test === null) {
        return ok
      }

      if (typeof test === 'string') {
        return typeFactory(test)
      }

      if (typeof test === 'object') {
        return Array.isArray(test) ? anyFactory(test) : propsFactory(test)
      }

      if (typeof test === 'function') {
        return castFactory(test)
      }

      throw new Error('Expected function, string, or object as test')
    }
  );

/**
 * @param {Array<string | Props | TestFunctionAnything>} tests
 * @returns {AssertAnything}
 */
function anyFactory(tests) {
  /** @type {Array<AssertAnything>} */
  const checks = [];
  let index = -1;

  while (++index < tests.length) {
    checks[index] = convert(tests[index]);
  }

  return castFactory(any)

  /**
   * @this {unknown}
   * @param {Array<unknown>} parameters
   * @returns {boolean}
   */
  function any(...parameters) {
    let index = -1;

    while (++index < checks.length) {
      if (checks[index].call(this, ...parameters)) return true
    }

    return false
  }
}

/**
 * Turn an object into a test for a node with a certain fields.
 *
 * @param {Props} check
 * @returns {AssertAnything}
 */
function propsFactory(check) {
  return castFactory(all)

  /**
   * @param {Node} node
   * @returns {boolean}
   */
  function all(node) {
    /** @type {string} */
    let key;

    for (key in check) {
      // @ts-expect-error: hush, it sure works as an index.
      if (node[key] !== check[key]) return false
    }

    return true
  }
}

/**
 * Turn a string into a test for a node with a certain type.
 *
 * @param {string} check
 * @returns {AssertAnything}
 */
function typeFactory(check) {
  return castFactory(type)

  /**
   * @param {Node} node
   */
  function type(node) {
    return node && node.type === check
  }
}

/**
 * Turn a custom test into a test for a node that passes that test.
 *
 * @param {TestFunctionAnything} check
 * @returns {AssertAnything}
 */
function castFactory(check) {
  return assertion

  /**
   * @this {unknown}
   * @param {unknown} node
   * @param {Array<unknown>} parameters
   * @returns {boolean}
   */
  function assertion(node, ...parameters) {
    return Boolean(
      node &&
        typeof node === 'object' &&
        'type' in node &&
        // @ts-expect-error: fine.
        Boolean(check.call(this, node, ...parameters))
    )
  }
}

function ok() {
  return true
}

/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist-util-is').Test} Test
 */

/**
 * Find the first node in `parent` after another `node` or after an index,
 * that passes `test`.

 * @param parent
 *   Parent node.
 * @param index
 *   Child of `parent` or it’s index.
 * @param test
 *   `unist-util-is`-compatible test.
 * @returns
 *   Child of `parent` or `null`.
 */
const findAfter =
  /**
   * @type {(
   *  (<T extends Node>(node: Parent, index: Node | number, test: import('unist-util-is').PredicateTest<T>) => T | null) &
   *  ((node: Parent, index: Node | number, test?: Test) => Node | null)
   * )}
   */
  (
    /**
     * @param {Parent} parent
     * @param {Node | number} index
     * @param {Test} [test]
     * @returns {Node | null}
     */
    function (parent, index, test) {
      const is = convert(test);

      if (!parent || !parent.type || !parent.children) {
        throw new Error('Expected parent node')
      }

      if (typeof index === 'number') {
        if (index < 0 || index === Number.POSITIVE_INFINITY) {
          throw new Error('Expected positive finite number as index')
        }
      } else {
        index = parent.children.indexOf(index);

        if (index < 0) {
          throw new Error('Expected child node or index')
        }
      }

      while (++index < parent.children.length) {
        if (is(parent.children[index], index, parent)) {
          return parent.children[index]
        }
      }

      return null
    }
  );

/**
 * @typedef {import('hast-util-is-element').TestFunctionAnything} TestFunctionAnything
 * @typedef {import('hast').Content} Content
 * @typedef {import('hast').Text} Text
 * @typedef {import('hast').Comment} Comment
 * @typedef {import('hast').Root} Root
 * @typedef {import('hast').Element} Element
 */

const searchLineFeeds = /\n/g;
const searchTabOrSpaces = /[\t ]+/g;

const br = convertElement('br');
const p = convertElement('p');
const cell = convertElement(['th', 'td']);
const row = convertElement('tr');

// Note that we don’t need to include void elements here as they don’t have text.
// See: <https://github.com/wooorm/html-void-elements>
const notRendered = convertElement([
  // List from: <https://html.spec.whatwg.org/#hidden-elements>
  'datalist',
  'head',
  'noembed',
  'noframes',
  'noscript', // Act as if we support scripting.
  'rp',
  'script',
  'style',
  'template',
  'title',
  // Hidden attribute.
  hidden,
  // From: <https://html.spec.whatwg.org/#flow-content-3>
  closedDialog
]);

// See: <https://html.spec.whatwg.org/#the-css-user-agent-style-sheet-and-presentational-hints>
const blockOrCaption = convertElement([
  'address', // Flow content
  'article', // Sections and headings
  'aside', // Sections and headings
  'blockquote', // Flow content
  'body', // Page
  'caption', // `table-caption`
  'center', // Flow content (legacy)
  'dd', // Lists
  'dialog', // Flow content
  'dir', // Lists (legacy)
  'dl', // Lists
  'dt', // Lists
  'div', // Flow content
  'figure', // Flow content
  'figcaption', // Flow content
  'footer', // Flow content
  'form,', // Flow content
  'h1', // Sections and headings
  'h2', // Sections and headings
  'h3', // Sections and headings
  'h4', // Sections and headings
  'h5', // Sections and headings
  'h6', // Sections and headings
  'header', // Flow content
  'hgroup', // Sections and headings
  'hr', // Flow content
  'html', // Page
  'legend', // Flow content
  'listing', // Flow content (legacy)
  'main', // Flow content
  'menu', // Lists
  'nav', // Sections and headings
  'ol', // Lists
  'p', // Flow content
  'plaintext', // Flow content (legacy)
  'pre', // Flow content
  'section', // Sections and headings
  'ul', // Lists
  'xmp' // Flow content (legacy)
]);

/**
 * Get the plain-text value of a node.
 *
 * ###### Algorithm
 *
 * *   if `tree` is a comment, returns its `value`
 * *   if `tree` is a text, applies normal whitespace collapsing to its
 *     `value`, as defined by the CSS Text spec
 * *   if `tree` is a root or element, applies an algorithm similar to the
 *     `innerText` getter as defined by HTML
 *
 * ###### Notes
 *
 * > 👉 **Note**: the algorithm acts as if `tree` is being rendered, and as if
 * > we’re a CSS-supporting user agent, with scripting enabled.
 *
 * *   if `tree` is an element that is not displayed (such as a `head`), we’ll
 *     still use the `innerText` algorithm instead of switching to `textContent`
 * *   if descendants of `tree` are elements that are not displayed, they are
 *     ignored
 * *   CSS is not considered, except for the default user agent style sheet
 * *   a line feed is collapsed instead of ignored in cases where Fullwidth, Wide,
 *     or Halfwidth East Asian Width characters are used, the same goes for a case
 *     with Chinese, Japanese, or Yi writing systems
 * *   replaced elements (such as `audio`) are treated like non-replaced elements
 *
 * @param {Node} tree
 *   Tree to turn into text.
 * @param {Options} [options]
 *   Configuration (optional).
 * @returns {string}
 *   Serialized `tree`.
 */
function toText(tree, options = {}) {
  const children = 'children' in tree ? tree.children : [];
  const block = blockOrCaption(tree);
  const whitespace = inferWhitespace(tree, {
    whitespace: options.whitespace || 'normal',
    breakBefore: false,
    breakAfter: false
  });

  /** @type {Array<string | BreakNumber>} */
  const results = [];

  // Treat `text` and `comment` as having normal white-space.
  // This deviates from the spec as in the DOM the node’s `.data` has to be
  // returned.
  // If you want that behavior use `hast-util-to-string`.
  // All other nodes are later handled as if they are `element`s (so the
  // algorithm also works on a `root`).
  // Nodes without children are treated as a void element, so `doctype` is thus
  // ignored.
  if (tree.type === 'text' || tree.type === 'comment') {
    results.push(
      ...collectText(tree, {
        whitespace,
        breakBefore: true,
        breakAfter: true
      })
    );
  }

  // 1.  If this element is not being rendered, or if the user agent is a
  //     non-CSS user agent, then return the same value as the textContent IDL
  //     attribute on this element.
  //
  //     Note: we’re not supporting stylesheets so we’re acting as if the node
  //     is rendered.
  //
  //     If you want that behavior use `hast-util-to-string`.
  //     Important: we’ll have to account for this later though.

  // 2.  Let results be a new empty list.
  let index = -1;

  // 3.  For each child node node of this element:
  while (++index < children.length) {
    // 3.1. Let current be the list resulting in running the inner text
    //      collection steps with node.
    //      Each item in results will either be a JavaScript string or a
    //      positive integer (a required line break count).
    // 3.2. For each item item in current, append item to results.
    results.push(
      // @ts-expect-error Looks like a parent.
      ...innerTextCollection(children[index], tree, {
        whitespace,
        breakBefore: index ? undefined : block,
        breakAfter:
          index < children.length - 1 ? br(children[index + 1]) : block
      })
    );
  }

  // 4.  Remove any items from results that are the empty string.
  // 5.  Remove any runs of consecutive required line break count items at the
  //     start or end of results.
  // 6.  Replace each remaining run of consecutive required line break count
  //     items with a string consisting of as many U+000A LINE FEED (LF)
  //     characters as the maximum of the values in the required line break
  //     count items.
  /** @type {Array<string>} */
  const result = [];
  /** @type {number | undefined} */
  let count;

  index = -1;

  while (++index < results.length) {
    const value = results[index];

    if (typeof value === 'number') {
      if (count !== undefined && value > count) count = value;
    } else if (value) {
      if (count !== undefined && count > -1) {
        result.push('\n'.repeat(count) || ' ');
      }

      count = -1;
      result.push(value);
    }
  }

  // 7.  Return the concatenation of the string items in results.
  return result.join('')
}

/**
 * <https://html.spec.whatwg.org/#inner-text-collection-steps>
 *
 * @param {Node} node
 * @param {Parent} parent
 * @param {CollectionInfo} info
 * @returns {Array<string | BreakNumber>}
 */
function innerTextCollection(node, parent, info) {
  if (node.type === 'element') {
    return collectElement(node, parent, info)
  }

  if (node.type === 'text') {
    return info.whitespace === 'normal'
      ? collectText(node, info)
      : collectPreText(node)
  }

  return []
}

/**
 * Collect an element.
 *
 * @param {Element} node
 *   Element node.
 * @param {Parent} parent
 * @param {CollectionInfo} info
 *   Info on current collection.
 * @returns {Array<string | BreakNumber>}
 */
function collectElement(node, parent, info) {
  // First we infer the `white-space` property.
  const whitespace = inferWhitespace(node, info);
  const children = node.children || [];
  let index = -1;
  /** @type {Array<string | BreakNumber>} */
  let items = [];

  // We’re ignoring point 3, and exiting without any content here, because we
  // deviated from the spec in `toText` at step 3.
  if (notRendered(node)) {
    return items
  }

  /** @type {BreakNumber | undefined} */
  let prefix;
  /** @type {BreakNumber | BreakForce | undefined} */
  let suffix;
  // Note: we first detect if there is going to be a break before or after the
  // contents, as that changes the white-space handling.

  // 2.  If node’s computed value of `visibility` is not `visible`, then return
  //     items.
  //
  //     Note: Ignored, as everything is visible by default user agent styles.

  // 3.  If node is not being rendered, then return items. [...]
  //
  //     Note: We already did this above.

  // See `collectText` for step 4.

  // 5.  If node is a `<br>` element, then append a string containing a single
  //     U+000A LINE FEED (LF) character to items.
  if (br(node)) {
    suffix = '\n';
  }

  // 7.  If node’s computed value of `display` is `table-row`, and node’s CSS
  //     box is not the last `table-row` box of the nearest ancestor `table`
  //     box, then append a string containing a single U+000A LINE FEED (LF)
  //     character to items.
  //
  //     See: <https://html.spec.whatwg.org/#tables-2>
  //     Note: needs further investigation as this does not account for implicit
  //     rows.
  else if (row(node) && findAfter(parent, node, row)) {
    suffix = '\n';
  }

  // 8.  If node is a `<p>` element, then append 2 (a required line break count)
  //     at the beginning and end of items.
  else if (p(node)) {
    prefix = 2;
    suffix = 2;
  }

  // 9.  If node’s used value of `display` is block-level or `table-caption`,
  //     then append 1 (a required line break count) at the beginning and end of
  //     items.
  else if (blockOrCaption(node)) {
    prefix = 1;
    suffix = 1;
  }

  // 1.  Let items be the result of running the inner text collection steps with
  //     each child node of node in tree order, and then concatenating the
  //     results to a single list.
  while (++index < children.length) {
    items = items.concat(
      innerTextCollection(children[index], node, {
        whitespace,
        breakBefore: index ? undefined : prefix,
        breakAfter:
          index < children.length - 1 ? br(children[index + 1]) : suffix
      })
    );
  }

  // 6.  If node’s computed value of `display` is `table-cell`, and node’s CSS
  //     box is not the last `table-cell` box of its enclosing `table-row` box,
  //     then append a string containing a single U+0009 CHARACTER TABULATION
  //     (tab) character to items.
  //
  //     See: <https://html.spec.whatwg.org/#tables-2>
  if (cell(node) && findAfter(parent, node, cell)) {
    items.push('\t');
  }

  // Add the pre- and suffix.
  if (prefix) items.unshift(prefix);
  if (suffix) items.push(suffix);

  return items
}

/**
 * 4.  If node is a Text node, then for each CSS text box produced by node,
 *     in content order, compute the text of the box after application of the
 *     CSS `white-space` processing rules and `text-transform` rules, set
 *     items to the list of the resulting strings, and return items.
 *     The CSS `white-space` processing rules are slightly modified:
 *     collapsible spaces at the end of lines are always collapsed, but they
 *     are only removed if the line is the last line of the block, or it ends
 *     with a br element.
 *     Soft hyphens should be preserved.
 *
 *     Note: See `collectText` and `collectPreText`.
 *     Note: we don’t deal with `text-transform`, no element has that by
 *     default.
 *
 * See: <https://drafts.csswg.org/css-text/#white-space-phase-1>
 *
 * @param {Text | Comment} node
 *   Text node.
 * @param {CollectionInfo} info
 *   Info on current collection.
 * @returns {Array<string | BreakNumber>}
 *   Result.
 */
function collectText(node, info) {
  const value = String(node.value);
  /** @type {Array<string>} */
  const lines = [];
  /** @type {Array<string | BreakNumber>} */
  const result = [];
  let start = 0;

  while (start <= value.length) {
    searchLineFeeds.lastIndex = start;

    const match = searchLineFeeds.exec(value);
    const end = match && 'index' in match ? match.index : value.length;

    lines.push(
      // Any sequence of collapsible spaces and tabs immediately preceding or
      // following a segment break is removed.
      trimAndCollapseSpacesAndTabs(
        // […] ignoring bidi formatting characters (characters with the
        // Bidi_Control property [UAX9]: ALM, LTR, RTL, LRE-RLO, LRI-PDI) as if
        // they were not there.
        value
          .slice(start, end)
          .replace(/[\u061C\u200E\u200F\u202A-\u202E\u2066-\u2069]/g, ''),
        start === 0 ? info.breakBefore : true,
        end === value.length ? info.breakAfter : true
      )
    );

    start = end + 1;
  }

  // Collapsible segment breaks are transformed for rendering according to the
  // segment break transformation rules.
  // So here we jump to 4.1.2 of [CSSTEXT]:
  // Any collapsible segment break immediately following another collapsible
  // segment break is removed
  let index = -1;
  /** @type {BreakNumber | undefined} */
  let join;

  while (++index < lines.length) {
    // *   If the character immediately before or immediately after the segment
    //     break is the zero-width space character (U+200B), then the break is
    //     removed, leaving behind the zero-width space.
    if (
      lines[index].charCodeAt(lines[index].length - 1) === 0x200b /* ZWSP */ ||
      (index < lines.length - 1 &&
        lines[index + 1].charCodeAt(0) === 0x200b) /* ZWSP */
    ) {
      result.push(lines[index]);
      join = undefined;
    }

    // *   Otherwise, if the East Asian Width property [UAX11] of both the
    //     character before and after the segment break is Fullwidth, Wide, or
    //     Halfwidth (not Ambiguous), and neither side is Hangul, then the
    //     segment break is removed.
    //
    //     Note: ignored.
    // *   Otherwise, if the writing system of the segment break is Chinese,
    //     Japanese, or Yi, and the character before or after the segment break
    //     is punctuation or a symbol (Unicode general category P* or S*) and
    //     has an East Asian Width property of Ambiguous, and the character on
    //     the other side of the segment break is Fullwidth, Wide, or Halfwidth,
    //     and not Hangul, then the segment break is removed.
    //
    //     Note: ignored.

    // *   Otherwise, the segment break is converted to a space (U+0020).
    else if (lines[index]) {
      if (typeof join === 'number') result.push(join);
      result.push(lines[index]);
      join = 0;
    } else if (index === 0 || index === lines.length - 1) {
      // If this line is empty, and it’s the first or last, add a space.
      // Note that this function is only called in normal whitespace, so we
      // don’t worry about `pre`.
      result.push(0);
    }
  }

  return result
}

/**
 * Collect a text node as “pre” whitespace.
 *
 * @param {Text} node
 *   Text node.
 * @returns {Array<string | BreakNumber>}
 *   Result.
 */
function collectPreText(node) {
  return [String(node.value)]
}

/**
 * 3.  Every collapsible tab is converted to a collapsible space (U+0020).
 * 4.  Any collapsible space immediately following another collapsible
 *     space—even one outside the boundary of the inline containing that
 *     space, provided both spaces are within the same inline formatting
 *     context—is collapsed to have zero advance width. (It is invisible,
 *     but retains its soft wrap opportunity, if any.)
 *
 * @param {string} value
 *   Value to collapse.
 * @param {BreakBefore} breakBefore
 *   Whether there was a break before.
 * @param {BreakAfter} breakAfter
 *   Whether there was a break after.
 * @returns {string}
 *   Result.
 */
function trimAndCollapseSpacesAndTabs(value, breakBefore, breakAfter) {
  /** @type {Array<string>} */
  const result = [];
  let start = 0;
  /** @type {number | undefined} */
  let end;

  while (start < value.length) {
    searchTabOrSpaces.lastIndex = start;
    const match = searchTabOrSpaces.exec(value);
    end = match ? match.index : value.length;

    // If we’re not directly after a segment break, but there was white space,
    // add an empty value that will be turned into a space.
    if (!start && !end && match && !breakBefore) {
      result.push('');
    }

    if (start !== end) {
      result.push(value.slice(start, end));
    }

    start = match ? end + match[0].length : end;
  }

  // If we reached the end, there was trailing white space, and there’s no
  // segment break after this node, add an empty value that will be turned
  // into a space.
  if (start !== end && !breakAfter) {
    result.push('');
  }

  return result.join(' ')
}

/**
 * Figure out the whitespace of a node.
 *
 * We don’t support void elements here (so `nobr wbr` -> `normal` is ignored).
 *
 * @param {Node} node
 *   Node (typically `Element`).
 * @param {CollectionInfo} info
 *   Info on current collection.
 * @returns {Whitespace}
 *   Applied whitespace.
 */
function inferWhitespace(node, info) {
  if (node.type === 'element') {
    const props = node.properties || {};
    switch (node.tagName) {
      case 'listing':
      case 'plaintext':
      case 'xmp': {
        return 'pre'
      }

      case 'nobr': {
        return 'nowrap'
      }

      case 'pre': {
        return props.wrap ? 'pre-wrap' : 'pre'
      }

      case 'td':
      case 'th': {
        return props.noWrap ? 'nowrap' : info.whitespace
      }

      case 'textarea': {
        return 'pre-wrap'
      }
    }
  }

  return info.whitespace
}

/** @type {TestFunctionAnything} */
function hidden(node) {
  return Boolean((node.properties || {}).hidden)
}

/** @type {TestFunctionAnything} */
function closedDialog(node) {
  return node.tagName === 'dialog' && !(node.properties || {}).open
}

function titleToFrontMatter(options = {}) {
  if (!options.property) {
    options.property = 'data';
  }
  return (ast, vfile) => {
    if (vfile[options.property] && vfile[options.property].noTitleToFrontmatter)
      return
    if (!ast.children.length) return
    let index = 0;
    if (ast.children[0].type === 'yaml') index++;
    const child = ast.children[index];
    if (child === undefined) return // no content, just some frontmatter
    if (child.type === 'heading' && child.depth === 1) {
      if (!vfile[options.property]) vfile[options.property] = {};
      if (!vfile[options.property].title)
        vfile[options.property].title = toText(child);
      ast.children.splice(index, 1);
    }
    return null
  }
}

export { titleToFrontMatter as default };
