/**
 * @overview The Fiberplane Template library
 * @version 0.1
 */

// Helper functions

local validate = {
  types: [],
  assertType(name, value)::
    if std.member(self.types, std.type(value)) then
      value
    else error 'expected ' + name + ' to be of type: ' + std.join(', ', self.types),
  nullOr:: self + { types+: ['null'] },
  string(name, value):: (self + { types+: ['string'] }).assertType(name, value),
  boolean(name, value):: (self + { types+: ['boolean'] }).assertType(name, value),
  number(name, value):: (self + { types+: ['number'] }).assertType(name, value),
  object(name, value):: (self + { types+: ['object'] }).assertType(name, value),
  array(name, value):: (self + { types+: ['array'] }).assertType(name, value),
};
local isCell(value) = std.isObject(value) && std.objectHasAll(value, '_class') && value._class == 'CELL';
local isFormattedContent(value) = std.isObject(value) && std.objectHasAll(value, '_class') && value._class == 'FORMATTED_CONTENT';

local formEncodingReplacements = {
  ' ': '+',
  '\b': '%08',
  '\t': '%09',
  '\n': '%0A',
  '\f': '%0C',
  '\r': '%0D',
  '!': '%21',
  '"': '%22',
  '#': '%23',
  '$': '%24',
  ',': '%2C',
  '^': '%5E',
  '&': '%26',
  "'": '%27',
  '(': '%28',
  ')': '%29',
  '+': '%2B',
  '/': '%2F',
  ':': '%3A',
  ';': '%3B',
  '=': '%3D',
  '?': '%3F',
  '@': '%40',
  '[': '%5B',
  '\\': '%5C',
  ']': '%5D',
  '`': '%60',
  '{': '%7B',
  '|': '%7C',
  '}': '%7D',
  '~': '%7E',
  '%': '%25',
};
local formEscapeCharacter(character) =
  if std.objectHas(formEncodingReplacements, character) then
    formEncodingReplacements[character]
  else
    character;

// Helper function to perform form encoding
local encodeFormComponent(string) =
  std.foldl(
    function(result, character) result + formEscapeCharacter(character),
    std.stringChars(string),
    ''
  );

/**
 * @class format.FormattedContent
 * @classdesc A class representing formatted text. Each of the formatting functions can be called as methods to append text with the given formatting.
 * @example fp.format.bold('hello ').italic('world')
 */
local formattedContent(content='') =
  // Add content, either as a string, a formatted content object, or an array of strings and/or formatted content objects
  local addContent(fc, content='') =
    if std.type(content) == 'null' then
      fc
    else if std.isString(content) then
      fc {
        content+: content,
      }
    else if isFormattedContent(content) then
      local additionalOffset = std.length(fc.content);
      fc {
        content+: validate.string('content.content', content.content),
        formatting+: std.map(function(f) f { offset+: additionalOffset }, content.formatting),
      }
    else if std.isArray(content) then
      std.foldl(function(formatted, item) addContent(formatted, item), content, fc)
    else
      error 'Invalid content. Expected string, format object, or array. Got: ' + std.toString(content);

  // Helper function to add formatting annotations of a given type and the
  local addContentAndFormatting(fc, content='', format=null, url=null) =
    if std.isString(format) then
      // Add the formatting annotation and the content to fc
      local withStart = fc {
        formatting+: [{
          type: 'start_' + format,
          offset: std.length(fc.content),
          // Only include the url if it is not null
          [if std.isString(url) then 'url']: url,
        }],
      };
      local withContent = addContent(withStart, content);
      // Once the content is added, add the end formatting annotation with the correct offset
      withContent {
        formatting+: [{
          type: 'end_' + format,
          offset: std.length(withContent.content),
        }],
      }
    else
      addContent(fc, content);

  local addLabelContent(fc, key, value=null) =
    fc {
      content+: key + if std.length(value) > 0 then ':' + value else '',
      formatting+: [{
        type: 'label',
        offset: std.length(fc.content),
        key: key,
        value: value,
      }],
    };

  local fc = {
    content: '',
    formatting: [],
    _class:: 'FORMATTED_CONTENT',
    /**
     * Add raw text.
     * Note that if this is added inside a formatting helper, the outer formatting will be applied to this text.
     *
     * @function format.FormattedContent#raw
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @returns {format.FormattedContent}
     */
    raw(content):: addContent(self, content),
    /**
     * Add bold text
     *
     * @function format.FormattedContent#bold
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @returns {format.FormattedContent}
     */
    bold(content):: addContentAndFormatting(self, content, 'bold'),
    /**
     * Add italicized text
     *
     * @function format.FormattedContent#italics
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @returns {format.FormattedContent}
     */
    italics(content):: addContentAndFormatting(self, content, 'italics'),
    /**
     * Add code-formatted text
     *
     * @function format.FormattedContent#code
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @returns {format.FormattedContent}
     */
    code(content):: addContentAndFormatting(self, content, 'code'),
    /**
     * Add highlighted text
     *
     * @function format.FormattedContent#highlight
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @returns {format.FormattedContent}
     */
    highlight(content):: addContentAndFormatting(self, content, 'highlight'),
    /**
     * Add strikethrough text
     *
     * @function format.FormattedContent#strikethrough
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @returns {format.FormattedContent}
     */
    strikethrough(content):: addContentAndFormatting(self, content, 'strikethrough'),
    /**
     * Add underlined text
     *
     * @function format.FormattedContent#underline
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @returns {format.FormattedContent}
     */
    underline(content):: addContentAndFormatting(self, content, 'underline'),
    /**
     * Add a link
     *
     * @function format.FormattedContent#link
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @param {string | null} url - The URL of the link. If none is provided, the content will be used as the link URL
     * @returns {format.FormattedContent}
     *
     * @example fmt.link('Example', 'https://example.com')
     * @example fmt.link('https://example.com')
     */
    link(content, url=null):: addContentAndFormatting(self, content, 'link', url=if std.type(url) == 'null' then content else validate.string('url', url)),
    /**
     * Add a mention
     *
     * @function format.FormattedContent#mention
     * @param {string} userName - The username to mention
     * @param {string} userId - The ID of the user to mention
     * @returns {format.FormattedContent}
     */
    mention(userName, userId):: self {
      content+: '@' + userId,
      formatting+: [{
        type: 'mention',
        name: userName,
        userId: userId,
      }],
    },
    /**
     * Add a timestamp
     *
     * @function format.FormattedContent#timestamp
     * @param {string} timestamp - The RFC3339-formatted timestamp to add
     * @returns {format.FormattedContent}
     */
    timestamp(timestamp):: self {
      content+: timestamp,
      formatting+: [{
        type: 'timestamp',
        timestamp: timestamp,
      }],
    },
    /**
     * Add a label
     *
     * @function format.FormattedContent#label
     * @param {string} key - The label's key
     * @param {string} url - The label's value (optional)
     * @returns {format.FormattedContent}
     */
    label(key, value=''):: addLabelContent(self, key, value),
  };
  addContent(fc, content);

/**
 * @class notebook.Notebook
 * @classdesc A Fiberplane Notebook.
 *
 * @see {@link notebook.new notebook\.new} to create a Notebook
 */
local notebook = {
  /**
   * Create a new notebook with the given title.
   *
   * @function notebook.new
   * @memberof notebook
   * @param title
   * @returns {notebook.Notebook}
   */
  new(title):: {
    title: validate.string('title', title),
    timeRange: { minutes: -60 },
    dataSources: {},
    labels: [],
    cells: [],
    // This is used to generate the cell IDs in the addCell
    // method. It does not appear in the JSON output
    _nextCellId:: 1,

    /**
     * Set the notebook time range relative to when it is created.
     *
     * For example, specifying `minutes=60` will set the start timestamp
     * to 60 minutes before the notebook is created. The end timestamp
     * will automatically be set to the time when the notebook is created.
     *
     * By default, the time range is set to 60 minutes relative to when the notebook is created.
     *
     * @function notebook.Notebook#setTimeRangeRelative
     * @param {number} minutes
     * @returns {notebook.Notebook}
     */
    setTimeRangeRelative(minutes):: self {
      timeRange+: { minutes: -validate.number('minutes', minutes) },
    },

    /**
     * Set the time range of the notebook using absolute timestamps.
     *
     * Note: in most cases, you will want to use {@link notebook#setTimeRangeRelative} instead.
     *
     * @function notebook.Notebook#setTimeRangeAbsolute
     * @param {string} from - ISO 8601/RFC 3339 formatted start timestamp
     * @param {string} to - ISO 8601/RFC 3339 formatted end timestamp
     * @returns {notebook.Notebook}
     */
    setTimeRangeAbsolute(from, to):: self {
      timeRange+: {
        from: validate.string('from', from),
        to: validate.string('to', to),
      },
    },

    /**
     * Select a data source for the given provider type.
     *
     * The workspace defaults will be used if none is specified.
     *
     * @function notebook.Notebook#setSelectedDataSource
     * @param {string} providerType - The type of provider to select the data source for
     * @param {string} dataSourceName - The name of the data source to select for the given provider type
     * @param {string | null} proxyName - If the data source is configured in a proxy, the name of the proxy
     * @returns {notebook.Notebook}
     */
    setDataSourceForProviderType(providerType, dataSourceName, proxyName=null):: self {
      selectedDataSources+: {
        [providerType]: {
          name: validate.string('dataSourceName', dataSourceName),
          proxyName: validate.nullOr.string('proxyName', proxyName),
        },
      },
    },

    /**
     * Add a single cell to the notebook.
     *
     * @function notebook.Notebook#addCell
     * @param {cell.Cell} cell
     * @returns {notebook.Notebook}
     */
    addCell(cell)::
      if std.isObject(cell) then
        local cellId = self._nextCellId;
        // Remove all null values and add the id field as a string
        local cellWithId = std.prune(cell) + {
          id: cellId + '',
        };
        self {
          _nextCellId: cellId + 1,
          // Append the cell to the cells array
          cells+: [cellWithId],
        }
      else if std.type(cell) == null then
        self
      else error 'Cell must be an object',

    /**
     * Add an array of cells to the notebook.
     *
     * Note: this function supports nested arrays of cells.
     *
     * @function notebook.Notebook#addCells
     * @param {cell.Cell[]} cells
     * @returns {notebook.Notebook}
     */
    addCells(cells)::
      // Call addCell for each cell in the array
      // and recursively call addCells if there
      // are nested arrays
      std.foldl(function(n, cell) (
        if std.isArray(cell) then
          n.addCells(cell)
        else n.addCell(cell)
      ), validate.array('cells', cells), self),

    /**
     * Add a single label to the notebook.
     *
     * @function notebook.Notebook#addLabel
     * @param {string} key - Key of the label
     * @param {string} value - Value of the label
     * @returns {notebook.Notebook}
     *
     * @example notebook.addLabel(key='service', value='api')
     */
    addLabel(key, value=''):: self {
      labels+: [{
        key: validate.string('key', key),
        value: validate.string('value', value),
      }],
    },

    /**
     * Add an object of labels to the notebook.
     *
     * @function notebook.Notebook#addLabels
     * @param {object} labels - Map of keys and values
     * @returns {notebook.Notebook}
     *
     * @example notebook.addLabels({
     *  service: 'api',
     *  severity: 'high'
     * })
     */
    addLabels(labels):: std.foldl(
      function(nb, key)
        local value = if std.isString(labels[key]) then labels[key] else '';
        nb.addLabel(key, value),
      std.objectFields(validate.object('labels', labels)),
      self
    ),
  },
};

/**
 * @class cell.Cell
 * @classdesc An individual cell in a notebook
 */
local cell = {
  // Base type that cells are built from.
  // Each cell-specific function will merge other
  // fields into the object returned here.
  local base = function(type, content, readOnly)
    formattedContent(content) + {
      id: '',
      type: type,
      readOnly: validate.nullOr.boolean('readOnly', readOnly),
      _class:: 'CELL',
      /**
       * Lock the cell
       *
       * @method cell.Cell#setReadOnly
       * @param {boolean} readOnly=true
       * @returns {cell.Cell}
       */
      setReadOnly(readOnly=true):: self {
        readOnly: readOnly,
      },
    },

  // List item
  local li = function(listType, content, startNumber, level, readOnly)
    base('list_item', content, readOnly) + {
      listType: listType,
      level: validate.nullOr.number('level', level),
      startNumber: validate.nullOr.number('startNumber', startNumber),
    },

  // Function to create a list from an array of strings, cells, and/or other lists.
  // It sets the startNumber field for all list items.
  // If it also sets the level field for all nested list items.
  local list = function(listType, cells, startNumber, level, readOnly)
    std.foldl(
      function(accumulator, content)
        // Treat strings as list items and increment the start number
        if std.isString(content) || isFormattedContent(content) then
          local cell = li(listType, content, accumulator.startNumber, level, readOnly);
          // Merge these values into the accumulator
          // (the + operator is optional when merging objects)
          accumulator {
            startNumber+: 1,
            array+: [cell],
          }
        else if std.isArray(content) then
          // Nested lists need to have their level incremented
          local nextLevel = if std.isNumber(level) then level + 1 else 1;
          accumulator {
            array+: list(listType, content, 1, nextLevel, readOnly),
          }
        else if isCell(content) then
          // Add the cell to the array and update the level if the cell is a list item
          local cellWithLevel = content {
            [if content.type == 'list_item' then 'level']: level,
          };
          accumulator {
            array+: [cellWithLevel],
          }
        else error 'Expected a string, formatted content, cell, or array of those. Got: ' + std.toString(content),
      cells,
      { startNumber: startNumber, array: [] },
    ).array,

  /**
   * Create a checkbox cell
   *
   * @function cell.checkbox
   * @param {boolean} checked=false - Whether the checkbox is checked
   * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
   * @param {number | null} level=null - Specify the indentation level.
   *  The top level is `null`, the first indented level is `1`, and so on
   * @param {boolean} readOnly=false - Whether the cell is locked
   * @returns {cell.Cell}
   */
  checkbox(content='', checked=false, level=null, readOnly=null)::
    base('checkbox', content, readOnly) + {
      checked: validate.boolean('checked', checked),
      level: validate.nullOr.number('level', level),
    },

  /**
   * Create a code cell
   *
   * @function cell.code
   * @param {boolean} checked=false - Whether the checkbox is checked
   * @param {string} content='' - Cell text content
   * @param {string | null} syntax=null - Specify the syntax to use for rendering the code
   * @param {boolean} readOnly=false - Whether the cell is locked
   * @returns {cell.Cell}
   */
  code(content='', syntax=null, readOnly=null)::
    base('code', validate.string('content', content), readOnly) + {
      syntax: validate.nullOr.string('syntax', syntax),
    },
  /**
   * Create a divider (horizontal rule) cell
   *
   * @function cell.divider
   * @param {boolean} readOnly=false - Whether the cell is locked
   * @returns {cell.Cell}
   */
  divider(readOnly=null)::
    base('divider', null, readOnly),

  /**
   * Heading cells
   * @namespace cell.heading
   */
  heading:: {
    local h = function(headingType, content, readOnly)
      base('heading', content, readOnly) + {
        headingType: headingType,
      },

    /**
     * Create an H1 cell
     *
     * Also accessible as `cell.h1`
     *
     * @function cell.heading.h1
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @param {boolean} readOnly=false - Whether the cell is locked
     * @returns {cell.Cell}
     */
    h1(content='', readOnly=null):: h('h1', content, readOnly),

    /**
     * Create an H2 cell
     *
     * Also accessible as `cell.h2`
     *
     * @function cell.heading.h2
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @param {boolean} readOnly=false - Whether the cell is locked
     * @returns {cell.Cell}
     */
    h2(content='', readOnly=null):: h('h2', content, readOnly),

    /**
     * Create an H3 cell
     *
     * Also accessible as `cell.h3`
     *
     * @function cell.heading.h3
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @param {boolean} readOnly=false - Whether the cell is locked
     * @returns {cell.Cell}
     */
    h3(content='', readOnly=null):: h('h3', content, readOnly),
  },
  h1:: cell.heading.h1,
  h2:: cell.heading.h2,
  h3:: cell.heading.h3,

  /**
    * Helper functions for easily creating lists
    *
    * @namespace cell.list
    */
  list:: {
    /**
     * Create an ordered list
     *
     * Also accessible as `cell.ol` and `cell.orderedList`
     *
     * @function cell.list.ordered
     * @param {Array.<(string | cell.Cell | Array)>} cells An array of strings, cells, or nested lists.
     *  Strings will become numbered list items. Other cell types are included as they are.
     *  Nested lists have their indentation `level` automatically incremented.
     * @param {number} startNumber=1 Starting number for the whole list. This function automatically handles
     *  numbering for all items in this list.
     * @param {number | null} level=null - Specify the indentation level.
     *  The top level is `null`, the first indented level is `1`, and so on
     * @param {boolean} readOnly=false - Whether the cells are locked
     * @returns {cell.Cell[]}
     */
    ordered(cells=[], startNumber=1, level=null, readOnly=null)::
      list('ordered', cells, startNumber, level, readOnly),

    /**
     * Create an unordered list
     *
     * Also accessible as `cell.ul` and `cell.unorderedList`
     *
     * @function cell.list.unordered
     * @param {Array.<(string | cell.Cell | Array)>} cells An array of strings, cells, or nested lists.
     *  Strings will become list items. Other cell types are included as they are.
     *  Nested lists have their indentation `level` automatically incremented.
     * @param {number | null} level=null - Specify the indentation level.
     *  The top level is `null`, the first indented level is `1`, and so on
     * @param {boolean} readOnly=false - Whether the cells are locked
     * @returns {cell.Cell[]}
     */
    unordered(cells=[], startNumber=1, level=null, readOnly=null)::
      list('unordered', cells, startNumber, level, readOnly),
  },
  ul:: cell.list.unordered,
  unorderedList:: cell.list.unordered,
  ol:: cell.list.ordered,
  orderedList:: cell.list.ordered,

  /**
    * Individual list items.
    *
    * In most cases, you will want to use {@link Cell.list} instead.
    *
    * @namespace cell.listItem
    */
  listItem:: {

    /**
     * Create an ordered list item
     *
     * @function cell.listItem.ordered
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @param {number | null} startNumber=null - Specify the starting number.
     *  Mostly useful if you want to start the list at a number other than `1`.
     * @param {number | null} level=null - Specify the indentation level.
     *  The top level is `null`, the first indented level is `1`, and so on
     * @param {boolean} readOnly=false - Whether the cell is locked
     * @returns {cell.Cell}
     */
    ordered(content='', level=null, startNumber=null, readOnly=null)::
      li('ordered', content, startNumber, level, readOnly),

    /**
     * Create an unordered list item
     *
     * @function cell.listItem.unordered
     * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
     * @param {number | null} level=null - Specify the indentation level.
     *  The top level is `null`, the first indented level is `1`, and so on
     * @param {boolean} readOnly=false - Whether the cell is locked
     * @returns {cell.Cell}
     */
    unordered(content='', level=null, startNumber=null, readOnly=null)::
      li('unordered', content, startNumber, level, readOnly),
  },

  local provider = function(intent='', title='', queryData=null, readOnly=null) {
    type: 'provider',
    output: [],
    intent: validate.string('intent', intent),
    queryData: validate.nullOr.string('queryData', queryData),
    readOnly: validate.nullOr.boolean('readOnly', readOnly),
  },

  /**
    * Create a provider cell
    *
    * @function cell.provider
    * @param {string} intent - The intent of the new provider cell
    * @param {string} title - Title for the new provider cell (deprecated)
    * @param {string} queryData - Query data that the provider will understand
    * @param {boolean} readOnly=false - Whether the cell is locked
   */
  provider:: provider,

  /**
   * Create a Prometheus query cell
   *
   * @function cell.prometheus
   * @param {string} content='' - Prometheus query
   * @param {boolean} readOnly=false - Whether the cell is locked
   * @returns {cell.Cell}
   */
  prometheus(content='', readOnly=null, title=''):: provider('prometheus,timeseries', title, if validate.string('content', content) == '' then null else 'application/x-www-form-urlencoded,query=' + encodeFormComponent(content), readOnly),

  /**
   * Create an Elasticsearch query cell
   *
   * @function cell.elasticsearch
   * @param {string} content='' - Elasticsearch query
   * @param {boolean} readOnly=false - Whether the cell is locked
   * @returns {cell.Cell}
   */
  elasticsearch(content='', readOnly=null, title=''):: provider('elasticsearch,events', title, if validate.string('content', content) == '' then null else 'application/x-www-form-urlencoded,query=' + encodeFormComponent(content), readOnly),

  /**
   * Create a Loki query cell
   *
   * @function cell.loki
   * @param {string} content='' - Loki query
   * @param {boolean} readOnly=false - Whether the cell is locked
   * @returns {cell.Cell}
   */
  loki(content='', readOnly=null, title=''):: provider('loki,events', title, if validate.string('content', content) == '' then null else 'application/x-www-form-urlencoded,query=' + encodeFormComponent(content), readOnly),

  /**
   * Create a plain text cell
   *
   * @function cell.text
   * @param {string | format.FormattedContent | Array.<(string | format.FormattedContent)>} content - The content to add
   * @param {boolean} readOnly=false - Whether the cell is locked
   * @returns {cell.Cell}
   */
  text(content='', readOnly=null):: base('text', content, readOnly),

  /**
   * Create an image cell
   *
   * @function cell.image
   * @param {string} url - URL of the image
   * @param {boolean} readOnly=false - Whether the cell is locked
   */
  image(url=null, readOnly=null)::
    base('image', '', readOnly) + {
      content: null,
      url: validate.nullOr.string('url', url),
    },
};

// Create a dummy notebook just to reuse the addCells functionality (which adds cell IDs)
local snippet = function(cells)
  notebook.new('')
  .addCells(cells)
  .cells;

// Library exports
{
  /**
   * Functions for creating Fiberplane Notebooks
   * @namespace notebook
   *
   * @example fp.notebook.new('My Notebook')
   *  .setTimeRangeRelative(minutes=60)
   *  .addCells([...])
   */
  notebook: notebook,

  /**
   * Function for creating Snippets, or reusable groups of cells.
   * @function snippet
   * @param {cell.Cell[]} cells
   * @returns {cell.Cell[]}
   *
   * @example fp.snippet([
   *  c.text('Hello, world!'),
   *  c.code('This is a snippet'),
   * ])
   */
  snippet: snippet,
  /**
   * Functions for creating notebook cells
   * @namespace cell
   *
   * @example <caption>Adding cells to a notebook</caption>
   * notebook.addCells([
   *   cell.h1('Title'),
   *   cell.text('Hello world!'),
   *   // See below for all of the available cell types
   * ])
   */
  cell: cell,
  /**
   * Functions for formatting text
   *
   * @namespace format
   *
   * @example fp.format.bold('hello')
   * @example <caption>Nested formatting</caption>
   * fp.format.bold(fp.format.italic('hello'))
   * @example <caption>Creating a cell with different text formats</caption>
   * fp.cell.text(['hello ', fp.format.bold('world '), fp.format.italics('!')])
   * // This is equivalent to:
   * fp.cell.text(fp.format.raw('hello ').bold('world ').italics('!'))
   *
   * @borrows format.FormattedContent#raw as raw
   * @borrows format.FormattedContent#bold as bold
   * @borrows format.FormattedContent#code as code
   * @borrows format.FormattedContent#highlight as highlight
   * @borrows format.FormattedContent#italics as italics
   * @borrows format.FormattedContent#underline as underline
   * @borrows format.FormattedContent#strikethrough as strikethrough
   * @borrows format.FormattedContent#link as link
   */
  format: formattedContent(),
}
