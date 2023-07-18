'use strict';

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
 * @param {string} d
 * @returns {string}
 */
function color(d) {
  return '\u001B[33m' + d + '\u001B[39m'
}

/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist-util-is').Test} Test
 */


/**
 * Continue traversing as normal.
 */
const CONTINUE = true;

/**
 * Stop traversing immediately.
 */
const EXIT = false;

/**
 * Do not traverse this node’s children.
 */
const SKIP = 'skip';

/**
 * Visit nodes, with ancestral information.
 *
 * This algorithm performs *depth-first* *tree traversal* in *preorder*
 * (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
 *
 * You can choose for which nodes `visitor` is called by passing a `test`.
 * For complex tests, you should test yourself in `visitor`, as it will be
 * faster and will have improved type information.
 *
 * Walking the tree is an intensive task.
 * Make use of the return values of the visitor when possible.
 * Instead of walking a tree multiple times, walk it once, use `unist-util-is`
 * to check if a node matches, and then perform different operations.
 *
 * You can change the tree.
 * See `Visitor` for more info.
 *
 * @param tree
 *   Tree to traverse.
 * @param test
 *   `unist-util-is`-compatible test
 * @param visitor
 *   Handle each node.
 * @param reverse
 *   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
 * @returns
 *   Nothing.
 */
const visitParents =
  /**
   * @type {(
   *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
   *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
   * )}
   */
  (
    /**
     * @param {Node} tree
     * @param {Test} test
     * @param {Visitor<Node>} visitor
     * @param {boolean | null | undefined} [reverse]
     * @returns {void}
     */
    function (tree, test, visitor, reverse) {
      if (typeof test === 'function' && typeof visitor !== 'function') {
        reverse = visitor;
        // @ts-expect-error no visitor given, so `visitor` is test.
        visitor = test;
        test = null;
      }

      const is = convert(test);
      const step = reverse ? -1 : 1;

      factory(tree, undefined, [])();

      /**
       * @param {Node} node
       * @param {number | undefined} index
       * @param {Array<Parent>} parents
       */
      function factory(node, index, parents) {
        /** @type {Record<string, unknown>} */
        // @ts-expect-error: hush
        const value = node && typeof node === 'object' ? node : {};

        if (typeof value.type === 'string') {
          const name =
            // `hast`
            typeof value.tagName === 'string'
              ? value.tagName
              : // `xast`
              typeof value.name === 'string'
              ? value.name
              : undefined;

          Object.defineProperty(visit, 'name', {
            value:
              'node (' + color(node.type + (name ? '<' + name + '>' : '')) + ')'
          });
        }

        return visit

        function visit() {
          /** @type {ActionTuple} */
          let result = [];
          /** @type {ActionTuple} */
          let subresult;
          /** @type {number} */
          let offset;
          /** @type {Array<Parent>} */
          let grandparents;

          if (!test || is(node, index, parents[parents.length - 1] || null)) {
            result = toResult(visitor(node, parents));

            if (result[0] === EXIT) {
              return result
            }
          }

          // @ts-expect-error looks like a parent.
          if (node.children && result[0] !== SKIP) {
            // @ts-expect-error looks like a parent.
            offset = (reverse ? node.children.length : -1) + step;
            // @ts-expect-error looks like a parent.
            grandparents = parents.concat(node);

            // @ts-expect-error looks like a parent.
            while (offset > -1 && offset < node.children.length) {
              // @ts-expect-error looks like a parent.
              subresult = factory(node.children[offset], offset, grandparents)();

              if (subresult[0] === EXIT) {
                return subresult
              }

              offset =
                typeof subresult[1] === 'number' ? subresult[1] : offset + step;
            }
          }

          return result
        }
      }
    }
  );

/**
 * Turn a return value into a clean result.
 *
 * @param {VisitorResult} value
 *   Valid return values from visitors.
 * @returns {ActionTuple}
 *   Clean result.
 */
function toResult(value) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === 'number') {
    return [CONTINUE, value]
  }

  return [value]
}

/**
 * @typedef {import('unist').Node} Node
 * @typedef {import('unist').Parent} Parent
 * @typedef {import('unist-util-is').Test} Test
 * @typedef {import('unist-util-visit-parents').VisitorResult} VisitorResult
 */


/**
 * Visit nodes.
 *
 * This algorithm performs *depth-first* *tree traversal* in *preorder*
 * (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
 *
 * You can choose for which nodes `visitor` is called by passing a `test`.
 * For complex tests, you should test yourself in `visitor`, as it will be
 * faster and will have improved type information.
 *
 * Walking the tree is an intensive task.
 * Make use of the return values of the visitor when possible.
 * Instead of walking a tree multiple times, walk it once, use `unist-util-is`
 * to check if a node matches, and then perform different operations.
 *
 * You can change the tree.
 * See `Visitor` for more info.
 *
 * @param tree
 *   Tree to traverse.
 * @param test
 *   `unist-util-is`-compatible test
 * @param visitor
 *   Handle each node.
 * @param reverse
 *   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
 * @returns
 *   Nothing.
 */
const visit =
  /**
   * @type {(
   *   (<Tree extends Node, Check extends Test>(tree: Tree, test: Check, visitor: BuildVisitor<Tree, Check>, reverse?: boolean | null | undefined) => void) &
   *   (<Tree extends Node>(tree: Tree, visitor: BuildVisitor<Tree>, reverse?: boolean | null | undefined) => void)
   * )}
   */
  (
    /**
     * @param {Node} tree
     * @param {Test} test
     * @param {Visitor} visitor
     * @param {boolean | null | undefined} [reverse]
     * @returns {void}
     */
    function (tree, test, visitor, reverse) {
      if (typeof test === 'function' && typeof visitor !== 'function') {
        reverse = visitor;
        visitor = test;
        test = null;
      }

      visitParents(tree, test, overload, reverse);

      /**
       * @param {Node} node
       * @param {Array<Parent>} parents
       */
      function overload(node, parents) {
        const parent = parents[parents.length - 1];
        return visitor(
          node,
          parent ? parent.children.indexOf(node) : null,
          parent
        )
      }
    }
  );

function escapeStringRegexp(string) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	// Escape characters with special meaning either inside or outside character sets.
	// Use a simple backslash escape when it’s always valid, and a `\xnn` escape when the simpler form would be disallowed by Unicode patterns’ stricter grammar.
	return string
		.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
		.replace(/-/g, '\\x2d');
}

const replacements = [
	// German umlauts
	['ß', 'ss'],
	['ẞ', 'Ss'],
	['ä', 'ae'],
	['Ä', 'Ae'],
	['ö', 'oe'],
	['Ö', 'Oe'],
	['ü', 'ue'],
	['Ü', 'Ue'],

	// Latin
	['À', 'A'],
	['Á', 'A'],
	['Â', 'A'],
	['Ã', 'A'],
	['Ä', 'Ae'],
	['Å', 'A'],
	['Æ', 'AE'],
	['Ç', 'C'],
	['È', 'E'],
	['É', 'E'],
	['Ê', 'E'],
	['Ë', 'E'],
	['Ì', 'I'],
	['Í', 'I'],
	['Î', 'I'],
	['Ï', 'I'],
	['Ð', 'D'],
	['Ñ', 'N'],
	['Ò', 'O'],
	['Ó', 'O'],
	['Ô', 'O'],
	['Õ', 'O'],
	['Ö', 'Oe'],
	['Ő', 'O'],
	['Ø', 'O'],
	['Ù', 'U'],
	['Ú', 'U'],
	['Û', 'U'],
	['Ü', 'Ue'],
	['Ű', 'U'],
	['Ý', 'Y'],
	['Þ', 'TH'],
	['ß', 'ss'],
	['à', 'a'],
	['á', 'a'],
	['â', 'a'],
	['ã', 'a'],
	['ä', 'ae'],
	['å', 'a'],
	['æ', 'ae'],
	['ç', 'c'],
	['è', 'e'],
	['é', 'e'],
	['ê', 'e'],
	['ë', 'e'],
	['ì', 'i'],
	['í', 'i'],
	['î', 'i'],
	['ï', 'i'],
	['ð', 'd'],
	['ñ', 'n'],
	['ò', 'o'],
	['ó', 'o'],
	['ô', 'o'],
	['õ', 'o'],
	['ö', 'oe'],
	['ő', 'o'],
	['ø', 'o'],
	['ù', 'u'],
	['ú', 'u'],
	['û', 'u'],
	['ü', 'ue'],
	['ű', 'u'],
	['ý', 'y'],
	['þ', 'th'],
	['ÿ', 'y'],
	['ẞ', 'SS'],

	// Vietnamese
	['à', 'a'],
	['À', 'A'],
	['á', 'a'],
	['Á', 'A'],
	['â', 'a'],
	['Â', 'A'],
	['ã', 'a'],
	['Ã', 'A'],
	['è', 'e'],
	['È', 'E'],
	['é', 'e'],
	['É', 'E'],
	['ê', 'e'],
	['Ê', 'E'],
	['ì', 'i'],
	['Ì', 'I'],
	['í', 'i'],
	['Í', 'I'],
	['ò', 'o'],
	['Ò', 'O'],
	['ó', 'o'],
	['Ó', 'O'],
	['ô', 'o'],
	['Ô', 'O'],
	['õ', 'o'],
	['Õ', 'O'],
	['ù', 'u'],
	['Ù', 'U'],
	['ú', 'u'],
	['Ú', 'U'],
	['ý', 'y'],
	['Ý', 'Y'],
	['ă', 'a'],
	['Ă', 'A'],
	['Đ', 'D'],
	['đ', 'd'],
	['ĩ', 'i'],
	['Ĩ', 'I'],
	['ũ', 'u'],
	['Ũ', 'U'],
	['ơ', 'o'],
	['Ơ', 'O'],
	['ư', 'u'],
	['Ư', 'U'],
	['ạ', 'a'],
	['Ạ', 'A'],
	['ả', 'a'],
	['Ả', 'A'],
	['ấ', 'a'],
	['Ấ', 'A'],
	['ầ', 'a'],
	['Ầ', 'A'],
	['ẩ', 'a'],
	['Ẩ', 'A'],
	['ẫ', 'a'],
	['Ẫ', 'A'],
	['ậ', 'a'],
	['Ậ', 'A'],
	['ắ', 'a'],
	['Ắ', 'A'],
	['ằ', 'a'],
	['Ằ', 'A'],
	['ẳ', 'a'],
	['Ẳ', 'A'],
	['ẵ', 'a'],
	['Ẵ', 'A'],
	['ặ', 'a'],
	['Ặ', 'A'],
	['ẹ', 'e'],
	['Ẹ', 'E'],
	['ẻ', 'e'],
	['Ẻ', 'E'],
	['ẽ', 'e'],
	['Ẽ', 'E'],
	['ế', 'e'],
	['Ế', 'E'],
	['ề', 'e'],
	['Ề', 'E'],
	['ể', 'e'],
	['Ể', 'E'],
	['ễ', 'e'],
	['Ễ', 'E'],
	['ệ', 'e'],
	['Ệ', 'E'],
	['ỉ', 'i'],
	['Ỉ', 'I'],
	['ị', 'i'],
	['Ị', 'I'],
	['ọ', 'o'],
	['Ọ', 'O'],
	['ỏ', 'o'],
	['Ỏ', 'O'],
	['ố', 'o'],
	['Ố', 'O'],
	['ồ', 'o'],
	['Ồ', 'O'],
	['ổ', 'o'],
	['Ổ', 'O'],
	['ỗ', 'o'],
	['Ỗ', 'O'],
	['ộ', 'o'],
	['Ộ', 'O'],
	['ớ', 'o'],
	['Ớ', 'O'],
	['ờ', 'o'],
	['Ờ', 'O'],
	['ở', 'o'],
	['Ở', 'O'],
	['ỡ', 'o'],
	['Ỡ', 'O'],
	['ợ', 'o'],
	['Ợ', 'O'],
	['ụ', 'u'],
	['Ụ', 'U'],
	['ủ', 'u'],
	['Ủ', 'U'],
	['ứ', 'u'],
	['Ứ', 'U'],
	['ừ', 'u'],
	['Ừ', 'U'],
	['ử', 'u'],
	['Ử', 'U'],
	['ữ', 'u'],
	['Ữ', 'U'],
	['ự', 'u'],
	['Ự', 'U'],
	['ỳ', 'y'],
	['Ỳ', 'Y'],
	['ỵ', 'y'],
	['Ỵ', 'Y'],
	['ỷ', 'y'],
	['Ỷ', 'Y'],
	['ỹ', 'y'],
	['Ỹ', 'Y'],

	// Arabic
	['ء', 'e'],
	['آ', 'a'],
	['أ', 'a'],
	['ؤ', 'w'],
	['إ', 'i'],
	['ئ', 'y'],
	['ا', 'a'],
	['ب', 'b'],
	['ة', 't'],
	['ت', 't'],
	['ث', 'th'],
	['ج', 'j'],
	['ح', 'h'],
	['خ', 'kh'],
	['د', 'd'],
	['ذ', 'dh'],
	['ر', 'r'],
	['ز', 'z'],
	['س', 's'],
	['ش', 'sh'],
	['ص', 's'],
	['ض', 'd'],
	['ط', 't'],
	['ظ', 'z'],
	['ع', 'e'],
	['غ', 'gh'],
	['ـ', '_'],
	['ف', 'f'],
	['ق', 'q'],
	['ك', 'k'],
	['ل', 'l'],
	['م', 'm'],
	['ن', 'n'],
	['ه', 'h'],
	['و', 'w'],
	['ى', 'a'],
	['ي', 'y'],
	['َ‎', 'a'],
	['ُ', 'u'],
	['ِ‎', 'i'],
	['٠', '0'],
	['١', '1'],
	['٢', '2'],
	['٣', '3'],
	['٤', '4'],
	['٥', '5'],
	['٦', '6'],
	['٧', '7'],
	['٨', '8'],
	['٩', '9'],

	// Persian / Farsi
	['چ', 'ch'],
	['ک', 'k'],
	['گ', 'g'],
	['پ', 'p'],
	['ژ', 'zh'],
	['ی', 'y'],
	['۰', '0'],
	['۱', '1'],
	['۲', '2'],
	['۳', '3'],
	['۴', '4'],
	['۵', '5'],
	['۶', '6'],
	['۷', '7'],
	['۸', '8'],
	['۹', '9'],

	// Pashto
	['ټ', 'p'],
	['ځ', 'z'],
	['څ', 'c'],
	['ډ', 'd'],
	['ﺫ', 'd'],
	['ﺭ', 'r'],
	['ړ', 'r'],
	['ﺯ', 'z'],
	['ږ', 'g'],
	['ښ', 'x'],
	['ګ', 'g'],
	['ڼ', 'n'],
	['ۀ', 'e'],
	['ې', 'e'],
	['ۍ', 'ai'],

	// Urdu
	['ٹ', 't'],
	['ڈ', 'd'],
	['ڑ', 'r'],
	['ں', 'n'],
	['ہ', 'h'],
	['ھ', 'h'],
	['ے', 'e'],

	// Russian
	['А', 'A'],
	['а', 'a'],
	['Б', 'B'],
	['б', 'b'],
	['В', 'V'],
	['в', 'v'],
	['Г', 'G'],
	['г', 'g'],
	['Д', 'D'],
	['д', 'd'],
	['ъе', 'ye'],
	['Ъе', 'Ye'],
	['ъЕ', 'yE'],
	['ЪЕ', 'YE'],
	['Е', 'E'],
	['е', 'e'],
	['Ё', 'Yo'],
	['ё', 'yo'],
	['Ж', 'Zh'],
	['ж', 'zh'],
	['З', 'Z'],
	['з', 'z'],
	['И', 'I'],
	['и', 'i'],
	['ый', 'iy'],
	['Ый', 'Iy'],
	['ЫЙ', 'IY'],
	['ыЙ', 'iY'],
	['Й', 'Y'],
	['й', 'y'],
	['К', 'K'],
	['к', 'k'],
	['Л', 'L'],
	['л', 'l'],
	['М', 'M'],
	['м', 'm'],
	['Н', 'N'],
	['н', 'n'],
	['О', 'O'],
	['о', 'o'],
	['П', 'P'],
	['п', 'p'],
	['Р', 'R'],
	['р', 'r'],
	['С', 'S'],
	['с', 's'],
	['Т', 'T'],
	['т', 't'],
	['У', 'U'],
	['у', 'u'],
	['Ф', 'F'],
	['ф', 'f'],
	['Х', 'Kh'],
	['х', 'kh'],
	['Ц', 'Ts'],
	['ц', 'ts'],
	['Ч', 'Ch'],
	['ч', 'ch'],
	['Ш', 'Sh'],
	['ш', 'sh'],
	['Щ', 'Sch'],
	['щ', 'sch'],
	['Ъ', ''],
	['ъ', ''],
	['Ы', 'Y'],
	['ы', 'y'],
	['Ь', ''],
	['ь', ''],
	['Э', 'E'],
	['э', 'e'],
	['Ю', 'Yu'],
	['ю', 'yu'],
	['Я', 'Ya'],
	['я', 'ya'],

	// Romanian
	['ă', 'a'],
	['Ă', 'A'],
	['ș', 's'],
	['Ș', 'S'],
	['ț', 't'],
	['Ț', 'T'],
	['ţ', 't'],
	['Ţ', 'T'],

	// Turkish
	['ş', 's'],
	['Ş', 'S'],
	['ç', 'c'],
	['Ç', 'C'],
	['ğ', 'g'],
	['Ğ', 'G'],
	['ı', 'i'],
	['İ', 'I'],

	// Armenian
	['ա', 'a'],
	['Ա', 'A'],
	['բ', 'b'],
	['Բ', 'B'],
	['գ', 'g'],
	['Գ', 'G'],
	['դ', 'd'],
	['Դ', 'D'],
	['ե', 'ye'],
	['Ե', 'Ye'],
	['զ', 'z'],
	['Զ', 'Z'],
	['է', 'e'],
	['Է', 'E'],
	['ը', 'y'],
	['Ը', 'Y'],
	['թ', 't'],
	['Թ', 'T'],
	['ժ', 'zh'],
	['Ժ', 'Zh'],
	['ի', 'i'],
	['Ի', 'I'],
	['լ', 'l'],
	['Լ', 'L'],
	['խ', 'kh'],
	['Խ', 'Kh'],
	['ծ', 'ts'],
	['Ծ', 'Ts'],
	['կ', 'k'],
	['Կ', 'K'],
	['հ', 'h'],
	['Հ', 'H'],
	['ձ', 'dz'],
	['Ձ', 'Dz'],
	['ղ', 'gh'],
	['Ղ', 'Gh'],
	['ճ', 'tch'],
	['Ճ', 'Tch'],
	['մ', 'm'],
	['Մ', 'M'],
	['յ', 'y'],
	['Յ', 'Y'],
	['ն', 'n'],
	['Ն', 'N'],
	['շ', 'sh'],
	['Շ', 'Sh'],
	['ո', 'vo'],
	['Ո', 'Vo'],
	['չ', 'ch'],
	['Չ', 'Ch'],
	['պ', 'p'],
	['Պ', 'P'],
	['ջ', 'j'],
	['Ջ', 'J'],
	['ռ', 'r'],
	['Ռ', 'R'],
	['ս', 's'],
	['Ս', 'S'],
	['վ', 'v'],
	['Վ', 'V'],
	['տ', 't'],
	['Տ', 'T'],
	['ր', 'r'],
	['Ր', 'R'],
	['ց', 'c'],
	['Ց', 'C'],
	['ու', 'u'],
	['ՈՒ', 'U'],
	['Ու', 'U'],
	['փ', 'p'],
	['Փ', 'P'],
	['ք', 'q'],
	['Ք', 'Q'],
	['օ', 'o'],
	['Օ', 'O'],
	['ֆ', 'f'],
	['Ֆ', 'F'],
	['և', 'yev'],

	// Georgian
	['ა', 'a'],
	['ბ', 'b'],
	['გ', 'g'],
	['დ', 'd'],
	['ე', 'e'],
	['ვ', 'v'],
	['ზ', 'z'],
	['თ', 't'],
	['ი', 'i'],
	['კ', 'k'],
	['ლ', 'l'],
	['მ', 'm'],
	['ნ', 'n'],
	['ო', 'o'],
	['პ', 'p'],
	['ჟ', 'zh'],
	['რ', 'r'],
	['ს', 's'],
	['ტ', 't'],
	['უ', 'u'],
	['ფ', 'ph'],
	['ქ', 'q'],
	['ღ', 'gh'],
	['ყ', 'k'],
	['შ', 'sh'],
	['ჩ', 'ch'],
	['ც', 'ts'],
	['ძ', 'dz'],
	['წ', 'ts'],
	['ჭ', 'tch'],
	['ხ', 'kh'],
	['ჯ', 'j'],
	['ჰ', 'h'],

	// Czech
	['č', 'c'],
	['ď', 'd'],
	['ě', 'e'],
	['ň', 'n'],
	['ř', 'r'],
	['š', 's'],
	['ť', 't'],
	['ů', 'u'],
	['ž', 'z'],
	['Č', 'C'],
	['Ď', 'D'],
	['Ě', 'E'],
	['Ň', 'N'],
	['Ř', 'R'],
	['Š', 'S'],
	['Ť', 'T'],
	['Ů', 'U'],
	['Ž', 'Z'],

	// Dhivehi
	['ހ', 'h'],
	['ށ', 'sh'],
	['ނ', 'n'],
	['ރ', 'r'],
	['ބ', 'b'],
	['ޅ', 'lh'],
	['ކ', 'k'],
	['އ', 'a'],
	['ވ', 'v'],
	['މ', 'm'],
	['ފ', 'f'],
	['ދ', 'dh'],
	['ތ', 'th'],
	['ލ', 'l'],
	['ގ', 'g'],
	['ޏ', 'gn'],
	['ސ', 's'],
	['ޑ', 'd'],
	['ޒ', 'z'],
	['ޓ', 't'],
	['ޔ', 'y'],
	['ޕ', 'p'],
	['ޖ', 'j'],
	['ޗ', 'ch'],
	['ޘ', 'tt'],
	['ޙ', 'hh'],
	['ޚ', 'kh'],
	['ޛ', 'th'],
	['ޜ', 'z'],
	['ޝ', 'sh'],
	['ޞ', 's'],
	['ޟ', 'd'],
	['ޠ', 't'],
	['ޡ', 'z'],
	['ޢ', 'a'],
	['ޣ', 'gh'],
	['ޤ', 'q'],
	['ޥ', 'w'],
	['ަ', 'a'],
	['ާ', 'aa'],
	['ި', 'i'],
	['ީ', 'ee'],
	['ު', 'u'],
	['ޫ', 'oo'],
	['ެ', 'e'],
	['ޭ', 'ey'],
	['ޮ', 'o'],
	['ޯ', 'oa'],
	['ް', ''],

	// Greek
	['α', 'a'],
	['β', 'v'],
	['γ', 'g'],
	['δ', 'd'],
	['ε', 'e'],
	['ζ', 'z'],
	['η', 'i'],
	['θ', 'th'],
	['ι', 'i'],
	['κ', 'k'],
	['λ', 'l'],
	['μ', 'm'],
	['ν', 'n'],
	['ξ', 'ks'],
	['ο', 'o'],
	['π', 'p'],
	['ρ', 'r'],
	['σ', 's'],
	['τ', 't'],
	['υ', 'y'],
	['φ', 'f'],
	['χ', 'x'],
	['ψ', 'ps'],
	['ω', 'o'],
	['ά', 'a'],
	['έ', 'e'],
	['ί', 'i'],
	['ό', 'o'],
	['ύ', 'y'],
	['ή', 'i'],
	['ώ', 'o'],
	['ς', 's'],
	['ϊ', 'i'],
	['ΰ', 'y'],
	['ϋ', 'y'],
	['ΐ', 'i'],
	['Α', 'A'],
	['Β', 'B'],
	['Γ', 'G'],
	['Δ', 'D'],
	['Ε', 'E'],
	['Ζ', 'Z'],
	['Η', 'I'],
	['Θ', 'TH'],
	['Ι', 'I'],
	['Κ', 'K'],
	['Λ', 'L'],
	['Μ', 'M'],
	['Ν', 'N'],
	['Ξ', 'KS'],
	['Ο', 'O'],
	['Π', 'P'],
	['Ρ', 'R'],
	['Σ', 'S'],
	['Τ', 'T'],
	['Υ', 'Y'],
	['Φ', 'F'],
	['Χ', 'X'],
	['Ψ', 'PS'],
	['Ω', 'O'],
	['Ά', 'A'],
	['Έ', 'E'],
	['Ί', 'I'],
	['Ό', 'O'],
	['Ύ', 'Y'],
	['Ή', 'I'],
	['Ώ', 'O'],
	['Ϊ', 'I'],
	['Ϋ', 'Y'],

	// Disabled as it conflicts with German and Latin.
	// Hungarian
	// ['ä', 'a'],
	// ['Ä', 'A'],
	// ['ö', 'o'],
	// ['Ö', 'O'],
	// ['ü', 'u'],
	// ['Ü', 'U'],
	// ['ű', 'u'],
	// ['Ű', 'U'],

	// Latvian
	['ā', 'a'],
	['ē', 'e'],
	['ģ', 'g'],
	['ī', 'i'],
	['ķ', 'k'],
	['ļ', 'l'],
	['ņ', 'n'],
	['ū', 'u'],
	['Ā', 'A'],
	['Ē', 'E'],
	['Ģ', 'G'],
	['Ī', 'I'],
	['Ķ', 'K'],
	['Ļ', 'L'],
	['Ņ', 'N'],
	['Ū', 'U'],
	['č', 'c'],
	['š', 's'],
	['ž', 'z'],
	['Č', 'C'],
	['Š', 'S'],
	['Ž', 'Z'],

	// Lithuanian
	['ą', 'a'],
	['č', 'c'],
	['ę', 'e'],
	['ė', 'e'],
	['į', 'i'],
	['š', 's'],
	['ų', 'u'],
	['ū', 'u'],
	['ž', 'z'],
	['Ą', 'A'],
	['Č', 'C'],
	['Ę', 'E'],
	['Ė', 'E'],
	['Į', 'I'],
	['Š', 'S'],
	['Ų', 'U'],
	['Ū', 'U'],

	// Macedonian
	['Ќ', 'Kj'],
	['ќ', 'kj'],
	['Љ', 'Lj'],
	['љ', 'lj'],
	['Њ', 'Nj'],
	['њ', 'nj'],
	['Тс', 'Ts'],
	['тс', 'ts'],

	// Polish
	['ą', 'a'],
	['ć', 'c'],
	['ę', 'e'],
	['ł', 'l'],
	['ń', 'n'],
	['ś', 's'],
	['ź', 'z'],
	['ż', 'z'],
	['Ą', 'A'],
	['Ć', 'C'],
	['Ę', 'E'],
	['Ł', 'L'],
	['Ń', 'N'],
	['Ś', 'S'],
	['Ź', 'Z'],
	['Ż', 'Z'],

	// Disabled as it conflicts with Vietnamese.
	// Serbian
	// ['љ', 'lj'],
	// ['њ', 'nj'],
	// ['Љ', 'Lj'],
	// ['Њ', 'Nj'],
	// ['đ', 'dj'],
	// ['Đ', 'Dj'],
	// ['ђ', 'dj'],
	// ['ј', 'j'],
	// ['ћ', 'c'],
	// ['џ', 'dz'],
	// ['Ђ', 'Dj'],
	// ['Ј', 'j'],
	// ['Ћ', 'C'],
	// ['Џ', 'Dz'],

	// Disabled as it conflicts with German and Latin.
	// Slovak
	// ['ä', 'a'],
	// ['Ä', 'A'],
	// ['ľ', 'l'],
	// ['ĺ', 'l'],
	// ['ŕ', 'r'],
	// ['Ľ', 'L'],
	// ['Ĺ', 'L'],
	// ['Ŕ', 'R'],

	// Disabled as it conflicts with German and Latin.
	// Swedish
	// ['å', 'o'],
	// ['Å', 'o'],
	// ['ä', 'a'],
	// ['Ä', 'A'],
	// ['ë', 'e'],
	// ['Ë', 'E'],
	// ['ö', 'o'],
	// ['Ö', 'O'],

	// Ukrainian
	['Є', 'Ye'],
	['І', 'I'],
	['Ї', 'Yi'],
	['Ґ', 'G'],
	['є', 'ye'],
	['і', 'i'],
	['ї', 'yi'],
	['ґ', 'g'],

	// Dutch
	['Ĳ', 'IJ'],
	['ĳ', 'ij'],

	// Danish
	// ['Æ', 'Ae'],
	// ['Ø', 'Oe'],
	// ['Å', 'Aa'],
	// ['æ', 'ae'],
	// ['ø', 'oe'],
	// ['å', 'aa']

	// Currencies
	['¢', 'c'],
	['¥', 'Y'],
	['߿', 'b'],
	['৳', 't'],
	['૱', 'Bo'],
	['฿', 'B'],
	['₠', 'CE'],
	['₡', 'C'],
	['₢', 'Cr'],
	['₣', 'F'],
	['₥', 'm'],
	['₦', 'N'],
	['₧', 'Pt'],
	['₨', 'Rs'],
	['₩', 'W'],
	['₫', 's'],
	['€', 'E'],
	['₭', 'K'],
	['₮', 'T'],
	['₯', 'Dp'],
	['₰', 'S'],
	['₱', 'P'],
	['₲', 'G'],
	['₳', 'A'],
	['₴', 'S'],
	['₵', 'C'],
	['₶', 'tt'],
	['₷', 'S'],
	['₸', 'T'],
	['₹', 'R'],
	['₺', 'L'],
	['₽', 'P'],
	['₿', 'B'],
	['﹩', '$'],
	['￠', 'c'],
	['￥', 'Y'],
	['￦', 'W'],

	// Latin
	['𝐀', 'A'],
	['𝐁', 'B'],
	['𝐂', 'C'],
	['𝐃', 'D'],
	['𝐄', 'E'],
	['𝐅', 'F'],
	['𝐆', 'G'],
	['𝐇', 'H'],
	['𝐈', 'I'],
	['𝐉', 'J'],
	['𝐊', 'K'],
	['𝐋', 'L'],
	['𝐌', 'M'],
	['𝐍', 'N'],
	['𝐎', 'O'],
	['𝐏', 'P'],
	['𝐐', 'Q'],
	['𝐑', 'R'],
	['𝐒', 'S'],
	['𝐓', 'T'],
	['𝐔', 'U'],
	['𝐕', 'V'],
	['𝐖', 'W'],
	['𝐗', 'X'],
	['𝐘', 'Y'],
	['𝐙', 'Z'],
	['𝐚', 'a'],
	['𝐛', 'b'],
	['𝐜', 'c'],
	['𝐝', 'd'],
	['𝐞', 'e'],
	['𝐟', 'f'],
	['𝐠', 'g'],
	['𝐡', 'h'],
	['𝐢', 'i'],
	['𝐣', 'j'],
	['𝐤', 'k'],
	['𝐥', 'l'],
	['𝐦', 'm'],
	['𝐧', 'n'],
	['𝐨', 'o'],
	['𝐩', 'p'],
	['𝐪', 'q'],
	['𝐫', 'r'],
	['𝐬', 's'],
	['𝐭', 't'],
	['𝐮', 'u'],
	['𝐯', 'v'],
	['𝐰', 'w'],
	['𝐱', 'x'],
	['𝐲', 'y'],
	['𝐳', 'z'],
	['𝐴', 'A'],
	['𝐵', 'B'],
	['𝐶', 'C'],
	['𝐷', 'D'],
	['𝐸', 'E'],
	['𝐹', 'F'],
	['𝐺', 'G'],
	['𝐻', 'H'],
	['𝐼', 'I'],
	['𝐽', 'J'],
	['𝐾', 'K'],
	['𝐿', 'L'],
	['𝑀', 'M'],
	['𝑁', 'N'],
	['𝑂', 'O'],
	['𝑃', 'P'],
	['𝑄', 'Q'],
	['𝑅', 'R'],
	['𝑆', 'S'],
	['𝑇', 'T'],
	['𝑈', 'U'],
	['𝑉', 'V'],
	['𝑊', 'W'],
	['𝑋', 'X'],
	['𝑌', 'Y'],
	['𝑍', 'Z'],
	['𝑎', 'a'],
	['𝑏', 'b'],
	['𝑐', 'c'],
	['𝑑', 'd'],
	['𝑒', 'e'],
	['𝑓', 'f'],
	['𝑔', 'g'],
	['𝑖', 'i'],
	['𝑗', 'j'],
	['𝑘', 'k'],
	['𝑙', 'l'],
	['𝑚', 'm'],
	['𝑛', 'n'],
	['𝑜', 'o'],
	['𝑝', 'p'],
	['𝑞', 'q'],
	['𝑟', 'r'],
	['𝑠', 's'],
	['𝑡', 't'],
	['𝑢', 'u'],
	['𝑣', 'v'],
	['𝑤', 'w'],
	['𝑥', 'x'],
	['𝑦', 'y'],
	['𝑧', 'z'],
	['𝑨', 'A'],
	['𝑩', 'B'],
	['𝑪', 'C'],
	['𝑫', 'D'],
	['𝑬', 'E'],
	['𝑭', 'F'],
	['𝑮', 'G'],
	['𝑯', 'H'],
	['𝑰', 'I'],
	['𝑱', 'J'],
	['𝑲', 'K'],
	['𝑳', 'L'],
	['𝑴', 'M'],
	['𝑵', 'N'],
	['𝑶', 'O'],
	['𝑷', 'P'],
	['𝑸', 'Q'],
	['𝑹', 'R'],
	['𝑺', 'S'],
	['𝑻', 'T'],
	['𝑼', 'U'],
	['𝑽', 'V'],
	['𝑾', 'W'],
	['𝑿', 'X'],
	['𝒀', 'Y'],
	['𝒁', 'Z'],
	['𝒂', 'a'],
	['𝒃', 'b'],
	['𝒄', 'c'],
	['𝒅', 'd'],
	['𝒆', 'e'],
	['𝒇', 'f'],
	['𝒈', 'g'],
	['𝒉', 'h'],
	['𝒊', 'i'],
	['𝒋', 'j'],
	['𝒌', 'k'],
	['𝒍', 'l'],
	['𝒎', 'm'],
	['𝒏', 'n'],
	['𝒐', 'o'],
	['𝒑', 'p'],
	['𝒒', 'q'],
	['𝒓', 'r'],
	['𝒔', 's'],
	['𝒕', 't'],
	['𝒖', 'u'],
	['𝒗', 'v'],
	['𝒘', 'w'],
	['𝒙', 'x'],
	['𝒚', 'y'],
	['𝒛', 'z'],
	['𝒜', 'A'],
	['𝒞', 'C'],
	['𝒟', 'D'],
	['𝒢', 'g'],
	['𝒥', 'J'],
	['𝒦', 'K'],
	['𝒩', 'N'],
	['𝒪', 'O'],
	['𝒫', 'P'],
	['𝒬', 'Q'],
	['𝒮', 'S'],
	['𝒯', 'T'],
	['𝒰', 'U'],
	['𝒱', 'V'],
	['𝒲', 'W'],
	['𝒳', 'X'],
	['𝒴', 'Y'],
	['𝒵', 'Z'],
	['𝒶', 'a'],
	['𝒷', 'b'],
	['𝒸', 'c'],
	['𝒹', 'd'],
	['𝒻', 'f'],
	['𝒽', 'h'],
	['𝒾', 'i'],
	['𝒿', 'j'],
	['𝓀', 'h'],
	['𝓁', 'l'],
	['𝓂', 'm'],
	['𝓃', 'n'],
	['𝓅', 'p'],
	['𝓆', 'q'],
	['𝓇', 'r'],
	['𝓈', 's'],
	['𝓉', 't'],
	['𝓊', 'u'],
	['𝓋', 'v'],
	['𝓌', 'w'],
	['𝓍', 'x'],
	['𝓎', 'y'],
	['𝓏', 'z'],
	['𝓐', 'A'],
	['𝓑', 'B'],
	['𝓒', 'C'],
	['𝓓', 'D'],
	['𝓔', 'E'],
	['𝓕', 'F'],
	['𝓖', 'G'],
	['𝓗', 'H'],
	['𝓘', 'I'],
	['𝓙', 'J'],
	['𝓚', 'K'],
	['𝓛', 'L'],
	['𝓜', 'M'],
	['𝓝', 'N'],
	['𝓞', 'O'],
	['𝓟', 'P'],
	['𝓠', 'Q'],
	['𝓡', 'R'],
	['𝓢', 'S'],
	['𝓣', 'T'],
	['𝓤', 'U'],
	['𝓥', 'V'],
	['𝓦', 'W'],
	['𝓧', 'X'],
	['𝓨', 'Y'],
	['𝓩', 'Z'],
	['𝓪', 'a'],
	['𝓫', 'b'],
	['𝓬', 'c'],
	['𝓭', 'd'],
	['𝓮', 'e'],
	['𝓯', 'f'],
	['𝓰', 'g'],
	['𝓱', 'h'],
	['𝓲', 'i'],
	['𝓳', 'j'],
	['𝓴', 'k'],
	['𝓵', 'l'],
	['𝓶', 'm'],
	['𝓷', 'n'],
	['𝓸', 'o'],
	['𝓹', 'p'],
	['𝓺', 'q'],
	['𝓻', 'r'],
	['𝓼', 's'],
	['𝓽', 't'],
	['𝓾', 'u'],
	['𝓿', 'v'],
	['𝔀', 'w'],
	['𝔁', 'x'],
	['𝔂', 'y'],
	['𝔃', 'z'],
	['𝔄', 'A'],
	['𝔅', 'B'],
	['𝔇', 'D'],
	['𝔈', 'E'],
	['𝔉', 'F'],
	['𝔊', 'G'],
	['𝔍', 'J'],
	['𝔎', 'K'],
	['𝔏', 'L'],
	['𝔐', 'M'],
	['𝔑', 'N'],
	['𝔒', 'O'],
	['𝔓', 'P'],
	['𝔔', 'Q'],
	['𝔖', 'S'],
	['𝔗', 'T'],
	['𝔘', 'U'],
	['𝔙', 'V'],
	['𝔚', 'W'],
	['𝔛', 'X'],
	['𝔜', 'Y'],
	['𝔞', 'a'],
	['𝔟', 'b'],
	['𝔠', 'c'],
	['𝔡', 'd'],
	['𝔢', 'e'],
	['𝔣', 'f'],
	['𝔤', 'g'],
	['𝔥', 'h'],
	['𝔦', 'i'],
	['𝔧', 'j'],
	['𝔨', 'k'],
	['𝔩', 'l'],
	['𝔪', 'm'],
	['𝔫', 'n'],
	['𝔬', 'o'],
	['𝔭', 'p'],
	['𝔮', 'q'],
	['𝔯', 'r'],
	['𝔰', 's'],
	['𝔱', 't'],
	['𝔲', 'u'],
	['𝔳', 'v'],
	['𝔴', 'w'],
	['𝔵', 'x'],
	['𝔶', 'y'],
	['𝔷', 'z'],
	['𝔸', 'A'],
	['𝔹', 'B'],
	['𝔻', 'D'],
	['𝔼', 'E'],
	['𝔽', 'F'],
	['𝔾', 'G'],
	['𝕀', 'I'],
	['𝕁', 'J'],
	['𝕂', 'K'],
	['𝕃', 'L'],
	['𝕄', 'M'],
	['𝕆', 'N'],
	['𝕊', 'S'],
	['𝕋', 'T'],
	['𝕌', 'U'],
	['𝕍', 'V'],
	['𝕎', 'W'],
	['𝕏', 'X'],
	['𝕐', 'Y'],
	['𝕒', 'a'],
	['𝕓', 'b'],
	['𝕔', 'c'],
	['𝕕', 'd'],
	['𝕖', 'e'],
	['𝕗', 'f'],
	['𝕘', 'g'],
	['𝕙', 'h'],
	['𝕚', 'i'],
	['𝕛', 'j'],
	['𝕜', 'k'],
	['𝕝', 'l'],
	['𝕞', 'm'],
	['𝕟', 'n'],
	['𝕠', 'o'],
	['𝕡', 'p'],
	['𝕢', 'q'],
	['𝕣', 'r'],
	['𝕤', 's'],
	['𝕥', 't'],
	['𝕦', 'u'],
	['𝕧', 'v'],
	['𝕨', 'w'],
	['𝕩', 'x'],
	['𝕪', 'y'],
	['𝕫', 'z'],
	['𝕬', 'A'],
	['𝕭', 'B'],
	['𝕮', 'C'],
	['𝕯', 'D'],
	['𝕰', 'E'],
	['𝕱', 'F'],
	['𝕲', 'G'],
	['𝕳', 'H'],
	['𝕴', 'I'],
	['𝕵', 'J'],
	['𝕶', 'K'],
	['𝕷', 'L'],
	['𝕸', 'M'],
	['𝕹', 'N'],
	['𝕺', 'O'],
	['𝕻', 'P'],
	['𝕼', 'Q'],
	['𝕽', 'R'],
	['𝕾', 'S'],
	['𝕿', 'T'],
	['𝖀', 'U'],
	['𝖁', 'V'],
	['𝖂', 'W'],
	['𝖃', 'X'],
	['𝖄', 'Y'],
	['𝖅', 'Z'],
	['𝖆', 'a'],
	['𝖇', 'b'],
	['𝖈', 'c'],
	['𝖉', 'd'],
	['𝖊', 'e'],
	['𝖋', 'f'],
	['𝖌', 'g'],
	['𝖍', 'h'],
	['𝖎', 'i'],
	['𝖏', 'j'],
	['𝖐', 'k'],
	['𝖑', 'l'],
	['𝖒', 'm'],
	['𝖓', 'n'],
	['𝖔', 'o'],
	['𝖕', 'p'],
	['𝖖', 'q'],
	['𝖗', 'r'],
	['𝖘', 's'],
	['𝖙', 't'],
	['𝖚', 'u'],
	['𝖛', 'v'],
	['𝖜', 'w'],
	['𝖝', 'x'],
	['𝖞', 'y'],
	['𝖟', 'z'],
	['𝖠', 'A'],
	['𝖡', 'B'],
	['𝖢', 'C'],
	['𝖣', 'D'],
	['𝖤', 'E'],
	['𝖥', 'F'],
	['𝖦', 'G'],
	['𝖧', 'H'],
	['𝖨', 'I'],
	['𝖩', 'J'],
	['𝖪', 'K'],
	['𝖫', 'L'],
	['𝖬', 'M'],
	['𝖭', 'N'],
	['𝖮', 'O'],
	['𝖯', 'P'],
	['𝖰', 'Q'],
	['𝖱', 'R'],
	['𝖲', 'S'],
	['𝖳', 'T'],
	['𝖴', 'U'],
	['𝖵', 'V'],
	['𝖶', 'W'],
	['𝖷', 'X'],
	['𝖸', 'Y'],
	['𝖹', 'Z'],
	['𝖺', 'a'],
	['𝖻', 'b'],
	['𝖼', 'c'],
	['𝖽', 'd'],
	['𝖾', 'e'],
	['𝖿', 'f'],
	['𝗀', 'g'],
	['𝗁', 'h'],
	['𝗂', 'i'],
	['𝗃', 'j'],
	['𝗄', 'k'],
	['𝗅', 'l'],
	['𝗆', 'm'],
	['𝗇', 'n'],
	['𝗈', 'o'],
	['𝗉', 'p'],
	['𝗊', 'q'],
	['𝗋', 'r'],
	['𝗌', 's'],
	['𝗍', 't'],
	['𝗎', 'u'],
	['𝗏', 'v'],
	['𝗐', 'w'],
	['𝗑', 'x'],
	['𝗒', 'y'],
	['𝗓', 'z'],
	['𝗔', 'A'],
	['𝗕', 'B'],
	['𝗖', 'C'],
	['𝗗', 'D'],
	['𝗘', 'E'],
	['𝗙', 'F'],
	['𝗚', 'G'],
	['𝗛', 'H'],
	['𝗜', 'I'],
	['𝗝', 'J'],
	['𝗞', 'K'],
	['𝗟', 'L'],
	['𝗠', 'M'],
	['𝗡', 'N'],
	['𝗢', 'O'],
	['𝗣', 'P'],
	['𝗤', 'Q'],
	['𝗥', 'R'],
	['𝗦', 'S'],
	['𝗧', 'T'],
	['𝗨', 'U'],
	['𝗩', 'V'],
	['𝗪', 'W'],
	['𝗫', 'X'],
	['𝗬', 'Y'],
	['𝗭', 'Z'],
	['𝗮', 'a'],
	['𝗯', 'b'],
	['𝗰', 'c'],
	['𝗱', 'd'],
	['𝗲', 'e'],
	['𝗳', 'f'],
	['𝗴', 'g'],
	['𝗵', 'h'],
	['𝗶', 'i'],
	['𝗷', 'j'],
	['𝗸', 'k'],
	['𝗹', 'l'],
	['𝗺', 'm'],
	['𝗻', 'n'],
	['𝗼', 'o'],
	['𝗽', 'p'],
	['𝗾', 'q'],
	['𝗿', 'r'],
	['𝘀', 's'],
	['𝘁', 't'],
	['𝘂', 'u'],
	['𝘃', 'v'],
	['𝘄', 'w'],
	['𝘅', 'x'],
	['𝘆', 'y'],
	['𝘇', 'z'],
	['𝘈', 'A'],
	['𝘉', 'B'],
	['𝘊', 'C'],
	['𝘋', 'D'],
	['𝘌', 'E'],
	['𝘍', 'F'],
	['𝘎', 'G'],
	['𝘏', 'H'],
	['𝘐', 'I'],
	['𝘑', 'J'],
	['𝘒', 'K'],
	['𝘓', 'L'],
	['𝘔', 'M'],
	['𝘕', 'N'],
	['𝘖', 'O'],
	['𝘗', 'P'],
	['𝘘', 'Q'],
	['𝘙', 'R'],
	['𝘚', 'S'],
	['𝘛', 'T'],
	['𝘜', 'U'],
	['𝘝', 'V'],
	['𝘞', 'W'],
	['𝘟', 'X'],
	['𝘠', 'Y'],
	['𝘡', 'Z'],
	['𝘢', 'a'],
	['𝘣', 'b'],
	['𝘤', 'c'],
	['𝘥', 'd'],
	['𝘦', 'e'],
	['𝘧', 'f'],
	['𝘨', 'g'],
	['𝘩', 'h'],
	['𝘪', 'i'],
	['𝘫', 'j'],
	['𝘬', 'k'],
	['𝘭', 'l'],
	['𝘮', 'm'],
	['𝘯', 'n'],
	['𝘰', 'o'],
	['𝘱', 'p'],
	['𝘲', 'q'],
	['𝘳', 'r'],
	['𝘴', 's'],
	['𝘵', 't'],
	['𝘶', 'u'],
	['𝘷', 'v'],
	['𝘸', 'w'],
	['𝘹', 'x'],
	['𝘺', 'y'],
	['𝘻', 'z'],
	['𝘼', 'A'],
	['𝘽', 'B'],
	['𝘾', 'C'],
	['𝘿', 'D'],
	['𝙀', 'E'],
	['𝙁', 'F'],
	['𝙂', 'G'],
	['𝙃', 'H'],
	['𝙄', 'I'],
	['𝙅', 'J'],
	['𝙆', 'K'],
	['𝙇', 'L'],
	['𝙈', 'M'],
	['𝙉', 'N'],
	['𝙊', 'O'],
	['𝙋', 'P'],
	['𝙌', 'Q'],
	['𝙍', 'R'],
	['𝙎', 'S'],
	['𝙏', 'T'],
	['𝙐', 'U'],
	['𝙑', 'V'],
	['𝙒', 'W'],
	['𝙓', 'X'],
	['𝙔', 'Y'],
	['𝙕', 'Z'],
	['𝙖', 'a'],
	['𝙗', 'b'],
	['𝙘', 'c'],
	['𝙙', 'd'],
	['𝙚', 'e'],
	['𝙛', 'f'],
	['𝙜', 'g'],
	['𝙝', 'h'],
	['𝙞', 'i'],
	['𝙟', 'j'],
	['𝙠', 'k'],
	['𝙡', 'l'],
	['𝙢', 'm'],
	['𝙣', 'n'],
	['𝙤', 'o'],
	['𝙥', 'p'],
	['𝙦', 'q'],
	['𝙧', 'r'],
	['𝙨', 's'],
	['𝙩', 't'],
	['𝙪', 'u'],
	['𝙫', 'v'],
	['𝙬', 'w'],
	['𝙭', 'x'],
	['𝙮', 'y'],
	['𝙯', 'z'],
	['𝙰', 'A'],
	['𝙱', 'B'],
	['𝙲', 'C'],
	['𝙳', 'D'],
	['𝙴', 'E'],
	['𝙵', 'F'],
	['𝙶', 'G'],
	['𝙷', 'H'],
	['𝙸', 'I'],
	['𝙹', 'J'],
	['𝙺', 'K'],
	['𝙻', 'L'],
	['𝙼', 'M'],
	['𝙽', 'N'],
	['𝙾', 'O'],
	['𝙿', 'P'],
	['𝚀', 'Q'],
	['𝚁', 'R'],
	['𝚂', 'S'],
	['𝚃', 'T'],
	['𝚄', 'U'],
	['𝚅', 'V'],
	['𝚆', 'W'],
	['𝚇', 'X'],
	['𝚈', 'Y'],
	['𝚉', 'Z'],
	['𝚊', 'a'],
	['𝚋', 'b'],
	['𝚌', 'c'],
	['𝚍', 'd'],
	['𝚎', 'e'],
	['𝚏', 'f'],
	['𝚐', 'g'],
	['𝚑', 'h'],
	['𝚒', 'i'],
	['𝚓', 'j'],
	['𝚔', 'k'],
	['𝚕', 'l'],
	['𝚖', 'm'],
	['𝚗', 'n'],
	['𝚘', 'o'],
	['𝚙', 'p'],
	['𝚚', 'q'],
	['𝚛', 'r'],
	['𝚜', 's'],
	['𝚝', 't'],
	['𝚞', 'u'],
	['𝚟', 'v'],
	['𝚠', 'w'],
	['𝚡', 'x'],
	['𝚢', 'y'],
	['𝚣', 'z'],

	// Dotless letters
	['𝚤', 'l'],
	['𝚥', 'j'],

	// Greek
	['𝛢', 'A'],
	['𝛣', 'B'],
	['𝛤', 'G'],
	['𝛥', 'D'],
	['𝛦', 'E'],
	['𝛧', 'Z'],
	['𝛨', 'I'],
	['𝛩', 'TH'],
	['𝛪', 'I'],
	['𝛫', 'K'],
	['𝛬', 'L'],
	['𝛭', 'M'],
	['𝛮', 'N'],
	['𝛯', 'KS'],
	['𝛰', 'O'],
	['𝛱', 'P'],
	['𝛲', 'R'],
	['𝛳', 'TH'],
	['𝛴', 'S'],
	['𝛵', 'T'],
	['𝛶', 'Y'],
	['𝛷', 'F'],
	['𝛸', 'x'],
	['𝛹', 'PS'],
	['𝛺', 'O'],
	['𝛻', 'D'],
	['𝛼', 'a'],
	['𝛽', 'b'],
	['𝛾', 'g'],
	['𝛿', 'd'],
	['𝜀', 'e'],
	['𝜁', 'z'],
	['𝜂', 'i'],
	['𝜃', 'th'],
	['𝜄', 'i'],
	['𝜅', 'k'],
	['𝜆', 'l'],
	['𝜇', 'm'],
	['𝜈', 'n'],
	['𝜉', 'ks'],
	['𝜊', 'o'],
	['𝜋', 'p'],
	['𝜌', 'r'],
	['𝜍', 's'],
	['𝜎', 's'],
	['𝜏', 't'],
	['𝜐', 'y'],
	['𝜑', 'f'],
	['𝜒', 'x'],
	['𝜓', 'ps'],
	['𝜔', 'o'],
	['𝜕', 'd'],
	['𝜖', 'E'],
	['𝜗', 'TH'],
	['𝜘', 'K'],
	['𝜙', 'f'],
	['𝜚', 'r'],
	['𝜛', 'p'],
	['𝜜', 'A'],
	['𝜝', 'V'],
	['𝜞', 'G'],
	['𝜟', 'D'],
	['𝜠', 'E'],
	['𝜡', 'Z'],
	['𝜢', 'I'],
	['𝜣', 'TH'],
	['𝜤', 'I'],
	['𝜥', 'K'],
	['𝜦', 'L'],
	['𝜧', 'M'],
	['𝜨', 'N'],
	['𝜩', 'KS'],
	['𝜪', 'O'],
	['𝜫', 'P'],
	['𝜬', 'S'],
	['𝜭', 'TH'],
	['𝜮', 'S'],
	['𝜯', 'T'],
	['𝜰', 'Y'],
	['𝜱', 'F'],
	['𝜲', 'X'],
	['𝜳', 'PS'],
	['𝜴', 'O'],
	['𝜵', 'D'],
	['𝜶', 'a'],
	['𝜷', 'v'],
	['𝜸', 'g'],
	['𝜹', 'd'],
	['𝜺', 'e'],
	['𝜻', 'z'],
	['𝜼', 'i'],
	['𝜽', 'th'],
	['𝜾', 'i'],
	['𝜿', 'k'],
	['𝝀', 'l'],
	['𝝁', 'm'],
	['𝝂', 'n'],
	['𝝃', 'ks'],
	['𝝄', 'o'],
	['𝝅', 'p'],
	['𝝆', 'r'],
	['𝝇', 's'],
	['𝝈', 's'],
	['𝝉', 't'],
	['𝝊', 'y'],
	['𝝋', 'f'],
	['𝝌', 'x'],
	['𝝍', 'ps'],
	['𝝎', 'o'],
	['𝝏', 'a'],
	['𝝐', 'e'],
	['𝝑', 'i'],
	['𝝒', 'k'],
	['𝝓', 'f'],
	['𝝔', 'r'],
	['𝝕', 'p'],
	['𝝖', 'A'],
	['𝝗', 'B'],
	['𝝘', 'G'],
	['𝝙', 'D'],
	['𝝚', 'E'],
	['𝝛', 'Z'],
	['𝝜', 'I'],
	['𝝝', 'TH'],
	['𝝞', 'I'],
	['𝝟', 'K'],
	['𝝠', 'L'],
	['𝝡', 'M'],
	['𝝢', 'N'],
	['𝝣', 'KS'],
	['𝝤', 'O'],
	['𝝥', 'P'],
	['𝝦', 'R'],
	['𝝧', 'TH'],
	['𝝨', 'S'],
	['𝝩', 'T'],
	['𝝪', 'Y'],
	['𝝫', 'F'],
	['𝝬', 'X'],
	['𝝭', 'PS'],
	['𝝮', 'O'],
	['𝝯', 'D'],
	['𝝰', 'a'],
	['𝝱', 'v'],
	['𝝲', 'g'],
	['𝝳', 'd'],
	['𝝴', 'e'],
	['𝝵', 'z'],
	['𝝶', 'i'],
	['𝝷', 'th'],
	['𝝸', 'i'],
	['𝝹', 'k'],
	['𝝺', 'l'],
	['𝝻', 'm'],
	['𝝼', 'n'],
	['𝝽', 'ks'],
	['𝝾', 'o'],
	['𝝿', 'p'],
	['𝞀', 'r'],
	['𝞁', 's'],
	['𝞂', 's'],
	['𝞃', 't'],
	['𝞄', 'y'],
	['𝞅', 'f'],
	['𝞆', 'x'],
	['𝞇', 'ps'],
	['𝞈', 'o'],
	['𝞉', 'a'],
	['𝞊', 'e'],
	['𝞋', 'i'],
	['𝞌', 'k'],
	['𝞍', 'f'],
	['𝞎', 'r'],
	['𝞏', 'p'],
	['𝞐', 'A'],
	['𝞑', 'V'],
	['𝞒', 'G'],
	['𝞓', 'D'],
	['𝞔', 'E'],
	['𝞕', 'Z'],
	['𝞖', 'I'],
	['𝞗', 'TH'],
	['𝞘', 'I'],
	['𝞙', 'K'],
	['𝞚', 'L'],
	['𝞛', 'M'],
	['𝞜', 'N'],
	['𝞝', 'KS'],
	['𝞞', 'O'],
	['𝞟', 'P'],
	['𝞠', 'S'],
	['𝞡', 'TH'],
	['𝞢', 'S'],
	['𝞣', 'T'],
	['𝞤', 'Y'],
	['𝞥', 'F'],
	['𝞦', 'X'],
	['𝞧', 'PS'],
	['𝞨', 'O'],
	['𝞩', 'D'],
	['𝞪', 'av'],
	['𝞫', 'g'],
	['𝞬', 'd'],
	['𝞭', 'e'],
	['𝞮', 'z'],
	['𝞯', 'i'],
	['𝞰', 'i'],
	['𝞱', 'th'],
	['𝞲', 'i'],
	['𝞳', 'k'],
	['𝞴', 'l'],
	['𝞵', 'm'],
	['𝞶', 'n'],
	['𝞷', 'ks'],
	['𝞸', 'o'],
	['𝞹', 'p'],
	['𝞺', 'r'],
	['𝞻', 's'],
	['𝞼', 's'],
	['𝞽', 't'],
	['𝞾', 'y'],
	['𝞿', 'f'],
	['𝟀', 'x'],
	['𝟁', 'ps'],
	['𝟂', 'o'],
	['𝟃', 'a'],
	['𝟄', 'e'],
	['𝟅', 'i'],
	['𝟆', 'k'],
	['𝟇', 'f'],
	['𝟈', 'r'],
	['𝟉', 'p'],
	['𝟊', 'F'],
	['𝟋', 'f'],
	['⒜', '(a)'],
	['⒝', '(b)'],
	['⒞', '(c)'],
	['⒟', '(d)'],
	['⒠', '(e)'],
	['⒡', '(f)'],
	['⒢', '(g)'],
	['⒣', '(h)'],
	['⒤', '(i)'],
	['⒥', '(j)'],
	['⒦', '(k)'],
	['⒧', '(l)'],
	['⒨', '(m)'],
	['⒩', '(n)'],
	['⒪', '(o)'],
	['⒫', '(p)'],
	['⒬', '(q)'],
	['⒭', '(r)'],
	['⒮', '(s)'],
	['⒯', '(t)'],
	['⒰', '(u)'],
	['⒱', '(v)'],
	['⒲', '(w)'],
	['⒳', '(x)'],
	['⒴', '(y)'],
	['⒵', '(z)'],
	['Ⓐ', '(A)'],
	['Ⓑ', '(B)'],
	['Ⓒ', '(C)'],
	['Ⓓ', '(D)'],
	['Ⓔ', '(E)'],
	['Ⓕ', '(F)'],
	['Ⓖ', '(G)'],
	['Ⓗ', '(H)'],
	['Ⓘ', '(I)'],
	['Ⓙ', '(J)'],
	['Ⓚ', '(K)'],
	['Ⓛ', '(L)'],
	['Ⓝ', '(N)'],
	['Ⓞ', '(O)'],
	['Ⓟ', '(P)'],
	['Ⓠ', '(Q)'],
	['Ⓡ', '(R)'],
	['Ⓢ', '(S)'],
	['Ⓣ', '(T)'],
	['Ⓤ', '(U)'],
	['Ⓥ', '(V)'],
	['Ⓦ', '(W)'],
	['Ⓧ', '(X)'],
	['Ⓨ', '(Y)'],
	['Ⓩ', '(Z)'],
	['ⓐ', '(a)'],
	['ⓑ', '(b)'],
	['ⓒ', '(b)'],
	['ⓓ', '(c)'],
	['ⓔ', '(e)'],
	['ⓕ', '(f)'],
	['ⓖ', '(g)'],
	['ⓗ', '(h)'],
	['ⓘ', '(i)'],
	['ⓙ', '(j)'],
	['ⓚ', '(k)'],
	['ⓛ', '(l)'],
	['ⓜ', '(m)'],
	['ⓝ', '(n)'],
	['ⓞ', '(o)'],
	['ⓟ', '(p)'],
	['ⓠ', '(q)'],
	['ⓡ', '(r)'],
	['ⓢ', '(s)'],
	['ⓣ', '(t)'],
	['ⓤ', '(u)'],
	['ⓥ', '(v)'],
	['ⓦ', '(w)'],
	['ⓧ', '(x)'],
	['ⓨ', '(y)'],
	['ⓩ', '(z)'],

	// Maltese
	['Ċ', 'C'],
	['ċ', 'c'],
	['Ġ', 'G'],
	['ġ', 'g'],
	['Ħ', 'H'],
	['ħ', 'h'],
	['Ż', 'Z'],
	['ż', 'z'],

	// Numbers
	['𝟎', '0'],
	['𝟏', '1'],
	['𝟐', '2'],
	['𝟑', '3'],
	['𝟒', '4'],
	['𝟓', '5'],
	['𝟔', '6'],
	['𝟕', '7'],
	['𝟖', '8'],
	['𝟗', '9'],
	['𝟘', '0'],
	['𝟙', '1'],
	['𝟚', '2'],
	['𝟛', '3'],
	['𝟜', '4'],
	['𝟝', '5'],
	['𝟞', '6'],
	['𝟟', '7'],
	['𝟠', '8'],
	['𝟡', '9'],
	['𝟢', '0'],
	['𝟣', '1'],
	['𝟤', '2'],
	['𝟥', '3'],
	['𝟦', '4'],
	['𝟧', '5'],
	['𝟨', '6'],
	['𝟩', '7'],
	['𝟪', '8'],
	['𝟫', '9'],
	['𝟬', '0'],
	['𝟭', '1'],
	['𝟮', '2'],
	['𝟯', '3'],
	['𝟰', '4'],
	['𝟱', '5'],
	['𝟲', '6'],
	['𝟳', '7'],
	['𝟴', '8'],
	['𝟵', '9'],
	['𝟶', '0'],
	['𝟷', '1'],
	['𝟸', '2'],
	['𝟹', '3'],
	['𝟺', '4'],
	['𝟻', '5'],
	['𝟼', '6'],
	['𝟽', '7'],
	['𝟾', '8'],
	['𝟿', '9'],
	['①', '1'],
	['②', '2'],
	['③', '3'],
	['④', '4'],
	['⑤', '5'],
	['⑥', '6'],
	['⑦', '7'],
	['⑧', '8'],
	['⑨', '9'],
	['⑩', '10'],
	['⑪', '11'],
	['⑫', '12'],
	['⑬', '13'],
	['⑭', '14'],
	['⑮', '15'],
	['⑯', '16'],
	['⑰', '17'],
	['⑱', '18'],
	['⑲', '19'],
	['⑳', '20'],
	['⑴', '1'],
	['⑵', '2'],
	['⑶', '3'],
	['⑷', '4'],
	['⑸', '5'],
	['⑹', '6'],
	['⑺', '7'],
	['⑻', '8'],
	['⑼', '9'],
	['⑽', '10'],
	['⑾', '11'],
	['⑿', '12'],
	['⒀', '13'],
	['⒁', '14'],
	['⒂', '15'],
	['⒃', '16'],
	['⒄', '17'],
	['⒅', '18'],
	['⒆', '19'],
	['⒇', '20'],
	['⒈', '1.'],
	['⒉', '2.'],
	['⒊', '3.'],
	['⒋', '4.'],
	['⒌', '5.'],
	['⒍', '6.'],
	['⒎', '7.'],
	['⒏', '8.'],
	['⒐', '9.'],
	['⒑', '10.'],
	['⒒', '11.'],
	['⒓', '12.'],
	['⒔', '13.'],
	['⒕', '14.'],
	['⒖', '15.'],
	['⒗', '16.'],
	['⒘', '17.'],
	['⒙', '18.'],
	['⒚', '19.'],
	['⒛', '20.'],
	['⓪', '0'],
	['⓫', '11'],
	['⓬', '12'],
	['⓭', '13'],
	['⓮', '14'],
	['⓯', '15'],
	['⓰', '16'],
	['⓱', '17'],
	['⓲', '18'],
	['⓳', '19'],
	['⓴', '20'],
	['⓵', '1'],
	['⓶', '2'],
	['⓷', '3'],
	['⓸', '4'],
	['⓹', '5'],
	['⓺', '6'],
	['⓻', '7'],
	['⓼', '8'],
	['⓽', '9'],
	['⓾', '10'],
	['⓿', '0'],

	// Punctuation
	['🙰', '&'],
	['🙱', '&'],
	['🙲', '&'],
	['🙳', '&'],
	['🙴', '&'],
	['🙵', '&'],
	['🙶', '"'],
	['🙷', '"'],
	['🙸', '"'],
	['‽', '?!'],
	['🙹', '?!'],
	['🙺', '?!'],
	['🙻', '?!'],
	['🙼', '/'],
	['🙽', '\\'],

	// Alchemy
	['🜇', 'AR'],
	['🜈', 'V'],
	['🜉', 'V'],
	['🜆', 'VR'],
	['🜅', 'VF'],
	['🜩', '2'],
	['🜪', '5'],
	['🝡', 'f'],
	['🝢', 'W'],
	['🝣', 'U'],
	['🝧', 'V'],
	['🝨', 'T'],
	['🝪', 'V'],
	['🝫', 'MB'],
	['🝬', 'VB'],
	['🝲', '3B'],
	['🝳', '3B'],

	// Emojis
	['💯', '100'],
	['🔙', 'BACK'],
	['🔚', 'END'],
	['🔛', 'ON!'],
	['🔜', 'SOON'],
	['🔝', 'TOP'],
	['🔞', '18'],
	['🔤', 'abc'],
	['🔠', 'ABCD'],
	['🔡', 'abcd'],
	['🔢', '1234'],
	['🔣', 'T&@%'],
	['#️⃣', '#'],
	['*️⃣', '*'],
	['0️⃣', '0'],
	['1️⃣', '1'],
	['2️⃣', '2'],
	['3️⃣', '3'],
	['4️⃣', '4'],
	['5️⃣', '5'],
	['6️⃣', '6'],
	['7️⃣', '7'],
	['8️⃣', '8'],
	['9️⃣', '9'],
	['🔟', '10'],
	['🅰️', 'A'],
	['🅱️', 'B'],
	['🆎', 'AB'],
	['🆑', 'CL'],
	['🅾️', 'O'],
	['🅿', 'P'],
	['🆘', 'SOS'],
	['🅲', 'C'],
	['🅳', 'D'],
	['🅴', 'E'],
	['🅵', 'F'],
	['🅶', 'G'],
	['🅷', 'H'],
	['🅸', 'I'],
	['🅹', 'J'],
	['🅺', 'K'],
	['🅻', 'L'],
	['🅼', 'M'],
	['🅽', 'N'],
	['🆀', 'Q'],
	['🆁', 'R'],
	['🆂', 'S'],
	['🆃', 'T'],
	['🆄', 'U'],
	['🆅', 'V'],
	['🆆', 'W'],
	['🆇', 'X'],
	['🆈', 'Y'],
	['🆉', 'Z']
];

const doCustomReplacements = (string, replacements) => {
	for (const [key, value] of replacements) {
		// TODO: Use `String#replaceAll()` when targeting Node.js 16.
		string = string.replace(new RegExp(escapeStringRegexp(key), 'g'), value);
	}

	return string;
};

function transliterate(string, options) {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = {
		customReplacements: [],
		...options
	};

	const customReplacements = new Map([
		...replacements,
		...options.customReplacements
	]);

	string = string.normalize();
	string = doCustomReplacements(string, customReplacements);
	string = string.normalize('NFD').replace(/\p{Diacritic}/gu, '').normalize();

	return string;
}

const overridableReplacements = [
	['&', ' and '],
	['🦄', ' unicorn '],
	['♥', ' love ']
];

const decamelize = string => {
	return string
		// Separate capitalized words.
		.replace(/([A-Z]{2,})(\d+)/g, '$1 $2')
		.replace(/([a-z\d]+)([A-Z]{2,})/g, '$1 $2')

		.replace(/([a-z\d])([A-Z])/g, '$1 $2')
		// `[a-rt-z]` matches all lowercase characters except `s`.
		// This avoids matching plural acronyms like `APIs`.
		.replace(/([A-Z]+)([A-Z][a-rt-z\d]+)/g, '$1 $2');
};

const removeMootSeparators = (string, separator) => {
	const escapedSeparator = escapeStringRegexp(separator);

	return string
		.replace(new RegExp(`${escapedSeparator}{2,}`, 'g'), separator)
		.replace(new RegExp(`^${escapedSeparator}|${escapedSeparator}$`, 'g'), '');
};

const buildPatternSlug = options => {
	let negationSetPattern = 'a-z\\d';
	negationSetPattern += options.lowercase ? '' : 'A-Z';

	if (options.preserveCharacters.length > 0) {
		for (const character of options.preserveCharacters) {
			if (character === options.separator) {
				throw new Error(`The separator character \`${options.separator}\` cannot be included in preserved characters: ${options.preserveCharacters}`);
			}

			negationSetPattern += escapeStringRegexp(character);
		}
	}

	return new RegExp(`[^${negationSetPattern}]+`, 'g');
};

function slugify(string, options) {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a string, got \`${typeof string}\``);
	}

	options = {
		separator: '-',
		lowercase: true,
		decamelize: true,
		customReplacements: [],
		preserveLeadingUnderscore: false,
		preserveTrailingDash: false,
		preserveCharacters: [],
		...options
	};

	const shouldPrependUnderscore = options.preserveLeadingUnderscore && string.startsWith('_');
	const shouldAppendDash = options.preserveTrailingDash && string.endsWith('-');

	const customReplacements = new Map([
		...overridableReplacements,
		...options.customReplacements
	]);

	string = transliterate(string, {customReplacements});

	if (options.decamelize) {
		string = decamelize(string);
	}

	const patternSlug = buildPatternSlug(options);

	if (options.lowercase) {
		string = string.toLowerCase();
	}

	string = string.replace(patternSlug, options.separator);
	string = string.replace(/\\/g, '');

	// Detect contractions/possessives by looking for any word followed by a `-t`
	// or `-s` in isolation and then remove it.
	string = string.replace(/([a-zA-Z\d]+)-([ts])(-|$)/g, '$1$2$3');

	if (options.separator) {
		string = removeMootSeparators(string, options.separator);
	}

	if (shouldPrependUnderscore) {
		string = `_${string}`;
	}

	if (shouldAppendDash) {
		string = `${string}-`;
	}

	return string;
}

function remarkToc({
  depth_min = 1,
  depth_max = 3,
  property = ['toc'],
} = {}) {
  if (typeof property === 'string'){
    property = [property];
  }
  return function (tree, vfile) {
    const toc = [];
    visit(tree, 'heading', function (node) {
      if (node.depth < depth_min || node.depth > depth_max) return
      const title = node.children
      .filter((child) => child.type === 'text' || child.type === 'strong' || child.type === 'emphasis' || child.type === 'inlineCode')
      .map((child) => {
          // when the text is bold or italic, the node.children[0] is not a text node but a strong or emphasis node
          // so we need to check the type of the node.children[0] to get the text value
          if (child.type === 'strong' || child.type === 'emphasis') {
            // case strong AND emphasis (***italic bold***) : the node.children[0] as an embedded node with the type strong or emphasis
            if (child.children[0].type === 'strong' || child.children[0].type === 'emphasis') {
              return child.children[0].children[0].value;
            }
            return child.children[0].value;
          } 
          // but for inlineCode and text node, the value is directly in the child.value
          return child.value;
        })
        .join('');
      if (!title) return;
      toc.push({
        title: title,
        depth: node.depth,
        anchor: slugify(title),
      });
    });
    let mount = vfile;
    for(let i = 0; i < property.length - 1; i++){
      const prop = property[i];
      if(!mount[prop]){
        mount[prop] = {};
      }
      mount = mount[prop];
    }
    mount[property[property.length - 1]] = toc;
  }
}

module.exports = remarkToc;
