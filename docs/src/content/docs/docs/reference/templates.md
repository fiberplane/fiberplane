---
title: Fiberplane Templates reference
---

## Objects

<dl>
<dt><a href="#notebook">`notebook`</a> : <code>object</code></dt>
<dd><p>Functions for creating Fiberplane Notebooks</p></dd>
<dt><a href="#cell">`cell`</a> : <code>object</code></dt>
<dd><p>Functions for creating notebook cells</p></dd>
<dt><a href="#format">`format`</a> : <code>object</code></dt>
<dd><p>Functions for formatting text</p></dd>
<dt><a href="#frontMatter">`frontMatter`</a> : <code>object</code></dt>
<dd><p>Functions for creating frontmatter</p></dd>
</dl>

## Functions

<dl>
<dt><a href="#snippet">`snippet(cells)`</a> ⇒ <code><a href="#cell.Cell">Array.&lt;Cell&gt;</a></code></dt>
<dd><p>Function for creating Snippets, or reusable groups of cells.</p></dd>
</dl>

<a name="notebook"></a>

## `notebook` : <code>object</code>
<p>Functions for creating Fiberplane Notebooks</p>

**Kind**: global namespace  
**Example**  
```js
fp.notebook.new('My Notebook')
 .setTimeRangeRelative(minutes=60)
 .addCells([...])
```

* [`notebook`](#notebook) : <code>object</code>
    * [.Notebook](#notebook.Notebook)
        * [`.setTimeRangeRelative(minutes)`](#notebook.Notebook+setTimeRangeRelative) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.setTimeRangeAbsolute(from, to)`](#notebook.Notebook+setTimeRangeAbsolute) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.setSelectedDataSource(providerType, dataSourceName, proxyName)`](#notebook.Notebook+setSelectedDataSource) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addCell(cell)`](#notebook.Notebook+addCell) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addCells(cells)`](#notebook.Notebook+addCells) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addLabel(key, value)`](#notebook.Notebook+addLabel) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addLabels(labels)`](#notebook.Notebook+addLabels) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addFrontMatterCollection(name)`](#notebook.Notebook+addFrontMatterCollection) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addFrontMatterCollections(names)`](#notebook.Notebook+addFrontMatterCollections) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addFrontMatterSchema(frontMatterSchema)`](#notebook.Notebook+addFrontMatterSchema) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addFrontMatterValue(key, value)`](#notebook.Notebook+addFrontMatterValue) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addFrontMatterValues(vals)`](#notebook.Notebook+addFrontMatterValues) ⇒ [<code>Notebook</code>](#notebook.Notebook)
        * [`.addFrontMatter(value)`](#notebook.Notebook+addFrontMatter) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.new(title)`](#notebook.new) ⇒ [<code>Notebook</code>](#notebook.Notebook)

<a name="notebook.Notebook"></a>

### notebook.Notebook
<p>A Fiberplane Notebook.</p>

**Kind**: static class of [<code>notebook</code>](#notebook)  
**See**: [notebook\.new](#notebook.new) to create a Notebook  

* [.Notebook](#notebook.Notebook)
    * [`.setTimeRangeRelative(minutes)`](#notebook.Notebook+setTimeRangeRelative) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.setTimeRangeAbsolute(from, to)`](#notebook.Notebook+setTimeRangeAbsolute) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.setSelectedDataSource(providerType, dataSourceName, proxyName)`](#notebook.Notebook+setSelectedDataSource) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addCell(cell)`](#notebook.Notebook+addCell) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addCells(cells)`](#notebook.Notebook+addCells) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addLabel(key, value)`](#notebook.Notebook+addLabel) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addLabels(labels)`](#notebook.Notebook+addLabels) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addFrontMatterCollection(name)`](#notebook.Notebook+addFrontMatterCollection) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addFrontMatterCollections(names)`](#notebook.Notebook+addFrontMatterCollections) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addFrontMatterSchema(frontMatterSchema)`](#notebook.Notebook+addFrontMatterSchema) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addFrontMatterValue(key, value)`](#notebook.Notebook+addFrontMatterValue) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addFrontMatterValues(vals)`](#notebook.Notebook+addFrontMatterValues) ⇒ [<code>Notebook</code>](#notebook.Notebook)
    * [`.addFrontMatter(value)`](#notebook.Notebook+addFrontMatter) ⇒ [<code>Notebook</code>](#notebook.Notebook)

<a name="notebook.Notebook+setTimeRangeRelative"></a>

#### `notebook.setTimeRangeRelative(minutes)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Set the notebook time range relative to when it is created.</p>
<p>For example, specifying <code>minutes=60</code> will set the start timestamp
to 60 minutes before the notebook is created. The end timestamp
will automatically be set to the time when the notebook is created.</p>
<p>By default, the time range is set to 60 minutes relative to when the notebook is created.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type |
| --- | --- |
| minutes | <code>number</code> | 

<a name="notebook.Notebook+setTimeRangeAbsolute"></a>

#### `notebook.setTimeRangeAbsolute(from, to)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Set the time range of the notebook using absolute timestamps.</p>
<p>Note: in most cases, you will want to use [notebook#setTimeRangeRelative](notebook#setTimeRangeRelative) instead.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| from | <code>string</code> | <p>ISO 8601/RFC 3339 formatted start timestamp</p> |
| to | <code>string</code> | <p>ISO 8601/RFC 3339 formatted end timestamp</p> |

<a name="notebook.Notebook+setSelectedDataSource"></a>

#### `notebook.setSelectedDataSource(providerType, dataSourceName, proxyName)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Select a data source for the given provider type.</p>
<p>The workspace defaults will be used if none is specified.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| providerType | <code>string</code> | <p>The type of provider to select the data source for</p> |
| dataSourceName | <code>string</code> | <p>The name of the data source to select for the given provider type</p> |
| proxyName | <code>string</code> \| <code>null</code> | <p>If the data source is configured in a proxy, the name of the proxy</p> |

<a name="notebook.Notebook+addCell"></a>

#### `notebook.addCell(cell)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Add a single cell to the notebook.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type |
| --- | --- |
| cell | [<code>Cell</code>](#cell.Cell) | 

<a name="notebook.Notebook+addCells"></a>

#### `notebook.addCells(cells)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Add an array of cells to the notebook.</p>
<p>Note: this function supports nested arrays of cells.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type |
| --- | --- |
| cells | [<code>Array.&lt;Cell&gt;</code>](#cell.Cell) | 

<a name="notebook.Notebook+addLabel"></a>

#### `notebook.addLabel(key, value)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Add a single label to the notebook.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | <p>Key of the label</p> |
| value | <code>string</code> | <p>Value of the label</p> |

**Example**  
```js
notebook.addLabel(key='service', value='api')
```
<a name="notebook.Notebook+addLabels"></a>

#### `notebook.addLabels(labels)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Add an object of labels to the notebook.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| labels | <code>object</code> | <p>Map of keys and values</p> |

**Example**  
```js
notebook.addLabels({
 service: 'api',
 severity: 'high'
})
```
<a name="notebook.Notebook+addFrontMatterCollection"></a>

#### `notebook.addFrontMatterCollection(name)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Add a single front matter collection to the notebook.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | <p>Name of the front matter collection in the workspace</p> |

**Example**  
```js
notebook.addFrontMatterCollection(name='post-mortem')
```
<a name="notebook.Notebook+addFrontMatterCollections"></a>

#### `notebook.addFrontMatterCollections(names)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Add multiple front matter collections to the notebook.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| names | <code>Array.&lt;string&gt;</code> | <p>Names of the front matter collections in the workspace</p> |

**Example**  
```js
notebook.addFrontMatterCollections(['post-mortem', 'opsgenie'])
```
<a name="notebook.Notebook+addFrontMatterSchema"></a>

#### `notebook.addFrontMatterSchema(frontMatterSchema)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>UNSTABLE: this function has no validation and the parameters might change.</p>
<p>Append front matter schema to a notebook inline. The method allows describing the schema
directly in template source.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| frontMatterSchema | <code>Array.&lt;object&gt;</code> | <p>Front Matter Schema as expected by the API</p> |

<a name="notebook.Notebook+addFrontMatterValue"></a>

#### `notebook.addFrontMatterValue(key, value)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Add a single front matter value to the notebook. The value will <em>not</em> appear in the
notebook unless the front matter <em>schema</em> of the notebook has an entry for the given key.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | <p>Key of the front matter entry</p> |
| value | <code>string</code> \| <code>number</code> | <p>Front matter value</p> |

**Example**  
```js
notebook.addFrontMatterValue(key='status', value='Created')
```
<a name="notebook.Notebook+addFrontMatterValues"></a>

#### `notebook.addFrontMatterValues(vals)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Add multiple front matter values to the notebook. The value will <em>not</em> appear in the
notebook unless the front matter <em>schema</em> of the notebook has an entry for the given key.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| vals | <code>object</code> | <p>Map of keys and values</p> |

**Example**  
```js
notebook.addFrontMatterValues({
 status: 'Created',
 ticket: 23
})
```
<a name="notebook.Notebook+addFrontMatter"></a>

#### `notebook.addFrontMatter(value)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Add a front matter value and schema to the notebook. Recommended to be
used with the <code>frontmatter.*</code> helpers.</p>

**Kind**: instance method of [<code>Notebook</code>](#notebook.Notebook)  

| Param | Type | Description |
| --- | --- | --- |
| value | <code>object</code> | <p>Map of frontMatter and frontMatterSchema to add to the notebook.</p> |

**Example**  
```js
notebook.addFrontMatter(
  frontMatter.pagerdutyIncident(pagerduty_frontmatter)
)
```
<a name="notebook.new"></a>

### `notebook.new(title)` ⇒ [<code>Notebook</code>](#notebook.Notebook)
<p>Create a new notebook with the given title.</p>

**Kind**: static method of [<code>notebook</code>](#notebook)  

| Param |
| --- |
| title | 

<a name="cell"></a>

## `cell` : <code>object</code>
<p>Functions for creating notebook cells</p>

**Kind**: global namespace  
**Example** *(Adding cells to a notebook)*  
```js
notebook.addCells([
  cell.h1('Title'),
  cell.text('Hello world!'),
  // See below for all of the available cell types
])
```

* [`cell`](#cell) : <code>object</code>
    * [.Cell](#cell.Cell)
        * [`.setReadOnly(readOnly)`](#cell.Cell+setReadOnly) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.heading`](#cell.heading) : <code>object</code>
        * [`.h1(content, readOnly)`](#cell.heading.h1) ⇒ [<code>Cell</code>](#cell.Cell)
        * [`.h2(content, readOnly)`](#cell.heading.h2) ⇒ [<code>Cell</code>](#cell.Cell)
        * [`.h3(content, readOnly)`](#cell.heading.h3) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.list`](#cell.list) : <code>object</code>
        * [`.ordered(cells, startNumber, level, readOnly)`](#cell.list.ordered) ⇒ [<code>Array.&lt;Cell&gt;</code>](#cell.Cell)
        * [`.unordered(cells, level, readOnly)`](#cell.list.unordered) ⇒ [<code>Array.&lt;Cell&gt;</code>](#cell.Cell)
    * [`.listItem`](#cell.listItem) : <code>object</code>
        * [`.ordered(content, startNumber, level, readOnly)`](#cell.listItem.ordered) ⇒ [<code>Cell</code>](#cell.Cell)
        * [`.unordered(content, level, readOnly)`](#cell.listItem.unordered) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.checkbox(checked, content, level, readOnly)`](#cell.checkbox) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.code(checked, content, syntax, readOnly)`](#cell.code) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.divider(readOnly)`](#cell.divider) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.provider(intent, title, queryData, readOnly)`](#cell.provider)
    * [`.prometheus(content, readOnly)`](#cell.prometheus) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.elasticsearch(content, readOnly)`](#cell.elasticsearch) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.loki(content, readOnly)`](#cell.loki) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.text(content, readOnly)`](#cell.text) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.image(url, readOnly)`](#cell.image)

<a name="cell.Cell"></a>

### cell.Cell
<p>An individual cell in a notebook</p>

**Kind**: static class of [<code>cell</code>](#cell)  
<a name="cell.Cell+setReadOnly"></a>

#### `cell.setReadOnly(readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Lock the cell</p>

**Kind**: instance method of [<code>Cell</code>](#cell.Cell)  

| Param | Type | Default |
| --- | --- | --- |
| readOnly | <code>boolean</code> | <code>true</code> | 

<a name="cell.heading"></a>

### `cell.heading` : <code>object</code>
<p>Heading cells</p>

**Kind**: static namespace of [<code>cell</code>](#cell)  

* [`.heading`](#cell.heading) : <code>object</code>
    * [`.h1(content, readOnly)`](#cell.heading.h1) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.h2(content, readOnly)`](#cell.heading.h2) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.h3(content, readOnly)`](#cell.heading.h3) ⇒ [<code>Cell</code>](#cell.Cell)

<a name="cell.heading.h1"></a>

#### `heading.h1(content, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create an H1 cell</p>
<p>Also accessible as <code>cell.h1</code></p>

**Kind**: static method of [<code>heading</code>](#cell.heading)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> |  | <p>The content to add</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.heading.h2"></a>

#### `heading.h2(content, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create an H2 cell</p>
<p>Also accessible as <code>cell.h2</code></p>

**Kind**: static method of [<code>heading</code>](#cell.heading)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> |  | <p>The content to add</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.heading.h3"></a>

#### `heading.h3(content, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create an H3 cell</p>
<p>Also accessible as <code>cell.h3</code></p>

**Kind**: static method of [<code>heading</code>](#cell.heading)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> |  | <p>The content to add</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.list"></a>

### `cell.list` : <code>object</code>
<p>Helper functions for easily creating lists</p>

**Kind**: static namespace of [<code>cell</code>](#cell)  

* [`.list`](#cell.list) : <code>object</code>
    * [`.ordered(cells, startNumber, level, readOnly)`](#cell.list.ordered) ⇒ [<code>Array.&lt;Cell&gt;</code>](#cell.Cell)
    * [`.unordered(cells, level, readOnly)`](#cell.list.unordered) ⇒ [<code>Array.&lt;Cell&gt;</code>](#cell.Cell)

<a name="cell.list.ordered"></a>

#### `list.ordered(cells, startNumber, level, readOnly)` ⇒ [<code>Array.&lt;Cell&gt;</code>](#cell.Cell)
<p>Create an ordered list</p>
<p>Also accessible as <code>cell.ol</code> and <code>cell.orderedList</code></p>

**Kind**: static method of [<code>list</code>](#cell.list)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cells | <code>Array.&lt;(string\|cell.Cell\|Array)&gt;</code> |  | <p>An array of strings, cells, or nested lists. Strings will become numbered list items. Other cell types are included as they are. Nested lists have their indentation <code>level</code> automatically incremented.</p> |
| startNumber | <code>number</code> | <code>1</code> | <p>Starting number for the whole list. This function automatically handles numbering for all items in this list.</p> |
| level | <code>number</code> \| <code>null</code> | <code></code> | <p>Specify the indentation level. The top level is <code>null</code>, the first indented level is <code>1</code>, and so on</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cells are locked</p> |

<a name="cell.list.unordered"></a>

#### `list.unordered(cells, level, readOnly)` ⇒ [<code>Array.&lt;Cell&gt;</code>](#cell.Cell)
<p>Create an unordered list</p>
<p>Also accessible as <code>cell.ul</code> and <code>cell.unorderedList</code></p>

**Kind**: static method of [<code>list</code>](#cell.list)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| cells | <code>Array.&lt;(string\|cell.Cell\|Array)&gt;</code> |  | <p>An array of strings, cells, or nested lists. Strings will become list items. Other cell types are included as they are. Nested lists have their indentation <code>level</code> automatically incremented.</p> |
| level | <code>number</code> \| <code>null</code> | <code></code> | <p>Specify the indentation level. The top level is <code>null</code>, the first indented level is <code>1</code>, and so on</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cells are locked</p> |

<a name="cell.listItem"></a>

### `cell.listItem` : <code>object</code>
<p>Individual list items.</p>
<p>In most cases, you will want to use [Cell.list](Cell.list) instead.</p>

**Kind**: static namespace of [<code>cell</code>](#cell)  

* [`.listItem`](#cell.listItem) : <code>object</code>
    * [`.ordered(content, startNumber, level, readOnly)`](#cell.listItem.ordered) ⇒ [<code>Cell</code>](#cell.Cell)
    * [`.unordered(content, level, readOnly)`](#cell.listItem.unordered) ⇒ [<code>Cell</code>](#cell.Cell)

<a name="cell.listItem.ordered"></a>

#### `listItem.ordered(content, startNumber, level, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create an ordered list item</p>

**Kind**: static method of [<code>listItem</code>](#cell.listItem)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> |  | <p>The content to add</p> |
| startNumber | <code>number</code> \| <code>null</code> | <code></code> | <p>Specify the starting number. Mostly useful if you want to start the list at a number other than <code>1</code>.</p> |
| level | <code>number</code> \| <code>null</code> | <code></code> | <p>Specify the indentation level. The top level is <code>null</code>, the first indented level is <code>1</code>, and so on</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.listItem.unordered"></a>

#### `listItem.unordered(content, level, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create an unordered list item</p>

**Kind**: static method of [<code>listItem</code>](#cell.listItem)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> |  | <p>The content to add</p> |
| level | <code>number</code> \| <code>null</code> | <code></code> | <p>Specify the indentation level. The top level is <code>null</code>, the first indented level is <code>1</code>, and so on</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.checkbox"></a>

### `cell.checkbox(checked, content, level, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create a checkbox cell</p>

**Kind**: static method of [<code>cell</code>](#cell)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| checked | <code>boolean</code> | <code>false</code> | <p>Whether the checkbox is checked</p> |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> |  | <p>The content to add</p> |
| level | <code>number</code> \| <code>null</code> | <code></code> | <p>Specify the indentation level. The top level is <code>null</code>, the first indented level is <code>1</code>, and so on</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.code"></a>

### `cell.code(checked, content, syntax, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create a code cell</p>

**Kind**: static method of [<code>cell</code>](#cell)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| checked | <code>boolean</code> | <code>false</code> | <p>Whether the checkbox is checked</p> |
| content | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | <p>Cell text content</p> |
| syntax | <code>string</code> \| <code>null</code> | <code>null</code> | <p>Specify the syntax to use for rendering the code</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.divider"></a>

### `cell.divider(readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create a divider (horizontal rule) cell</p>

**Kind**: static method of [<code>cell</code>](#cell)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.provider"></a>

### `cell.provider(intent, title, queryData, readOnly)`
<p>Create a provider cell</p>

**Kind**: static method of [<code>cell</code>](#cell)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| intent | <code>string</code> |  | <p>The intent of the new provider cell</p> |
| title | <code>string</code> |  | <p>Title for the new provider cell (deprecated)</p> |
| queryData | <code>string</code> |  | <p>Query data that the provider will understand</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.prometheus"></a>

### `cell.prometheus(content, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create a Prometheus query cell</p>

**Kind**: static method of [<code>cell</code>](#cell)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| content | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | <p>Prometheus query</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.elasticsearch"></a>

### `cell.elasticsearch(content, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create an Elasticsearch query cell</p>

**Kind**: static method of [<code>cell</code>](#cell)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| content | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | <p>Elasticsearch query</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.loki"></a>

### `cell.loki(content, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create a Loki query cell</p>

**Kind**: static method of [<code>cell</code>](#cell)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| content | <code>string</code> | <code>&quot;&#x27;&#x27;&quot;</code> | <p>Loki query</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.text"></a>

### `cell.text(content, readOnly)` ⇒ [<code>Cell</code>](#cell.Cell)
<p>Create a plain text cell</p>

**Kind**: static method of [<code>cell</code>](#cell)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> |  | <p>The content to add</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="cell.image"></a>

### `cell.image(url, readOnly)`
<p>Create an image cell</p>

**Kind**: static method of [<code>cell</code>](#cell)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| url | <code>string</code> |  | <p>URL of the image</p> |
| readOnly | <code>boolean</code> | <code>false</code> | <p>Whether the cell is locked</p> |

<a name="format"></a>

## `format` : <code>object</code>
<p>Functions for formatting text</p>

**Kind**: global namespace  
**Example**  
```js
fp.format.bold('hello')
```
**Example** *(Nested formatting)*  
```js
fp.format.bold(fp.format.italic('hello'))
```
**Example** *(Creating a cell with different text formats)*  
```js
fp.cell.text(['hello ', fp.format.bold('world '), fp.format.italics('!')])
// This is equivalent to:
fp.cell.text(fp.format.raw('hello ').bold('world ').italics('!'))
```

* [`format`](#format) : <code>object</code>
    * [.FormattedContent](#format.FormattedContent)
        * [`.raw(content)`](#format.FormattedContent+raw) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.bold(content)`](#format.FormattedContent+bold) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.italics(content)`](#format.FormattedContent+italics) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.code(content)`](#format.FormattedContent+code) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.highlight(content)`](#format.FormattedContent+highlight) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.strikethrough(content)`](#format.FormattedContent+strikethrough) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.underline(content)`](#format.FormattedContent+underline) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.link(content, url)`](#format.FormattedContent+link) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.mention(userName, userId)`](#format.FormattedContent+mention) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.timestamp(timestamp)`](#format.FormattedContent+timestamp) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
        * [`.label(key, url)`](#format.FormattedContent+label) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.raw(content)`](#format.raw) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.bold(content)`](#format.bold) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.code(content)`](#format.code) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.highlight(content)`](#format.highlight) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.italics(content)`](#format.italics) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.underline(content)`](#format.underline) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.strikethrough(content)`](#format.strikethrough) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.link(content, url)`](#format.link) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)

<a name="format.FormattedContent"></a>

### format.FormattedContent
<p>A class representing formatted text. Each of the formatting functions can be called as methods to append text with the given formatting.</p>

**Kind**: static class of [<code>format</code>](#format)  

* [.FormattedContent](#format.FormattedContent)
    * [`.raw(content)`](#format.FormattedContent+raw) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.bold(content)`](#format.FormattedContent+bold) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.italics(content)`](#format.FormattedContent+italics) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.code(content)`](#format.FormattedContent+code) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.highlight(content)`](#format.FormattedContent+highlight) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.strikethrough(content)`](#format.FormattedContent+strikethrough) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.underline(content)`](#format.FormattedContent+underline) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.link(content, url)`](#format.FormattedContent+link) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.mention(userName, userId)`](#format.FormattedContent+mention) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.timestamp(timestamp)`](#format.FormattedContent+timestamp) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
    * [`.label(key, url)`](#format.FormattedContent+label) ⇒ [<code>FormattedContent</code>](#format.FormattedContent)

<a name="format.FormattedContent+raw"></a>

#### `formattedContent.raw(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add raw text.
Note that if this is added inside a formatting helper, the outer formatting will be applied to this text.</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.FormattedContent+bold"></a>

#### `formattedContent.bold(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add bold text</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.FormattedContent+italics"></a>

#### `formattedContent.italics(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add italicized text</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.FormattedContent+code"></a>

#### `formattedContent.code(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add code-formatted text</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.FormattedContent+highlight"></a>

#### `formattedContent.highlight(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add highlighted text</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.FormattedContent+strikethrough"></a>

#### `formattedContent.strikethrough(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add strikethrough text</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.FormattedContent+underline"></a>

#### `formattedContent.underline(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add underlined text</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.FormattedContent+link"></a>

#### `formattedContent.link(content, url)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add a link</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |
| url | <code>string</code> \| <code>null</code> | <p>The URL of the link. If none is provided, the content will be used as the link URL</p> |

**Example**  
```js
fmt.link('Example', 'https://example.com')
```
**Example**  
```js
fmt.link('https://example.com')
```
<a name="format.FormattedContent+mention"></a>

#### `formattedContent.mention(userName, userId)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add a mention</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| userName | <code>string</code> | <p>The username to mention</p> |
| userId | <code>string</code> | <p>The ID of the user to mention</p> |

<a name="format.FormattedContent+timestamp"></a>

#### `formattedContent.timestamp(timestamp)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add a timestamp</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| timestamp | <code>string</code> | <p>The RFC3339-formatted timestamp to add</p> |

<a name="format.FormattedContent+label"></a>

#### `formattedContent.label(key, url)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add a label</p>

**Kind**: instance method of [<code>FormattedContent</code>](#format.FormattedContent)  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | <p>The label's key</p> |
| url | <code>string</code> | <p>The label's value (optional)</p> |

<a name="format.raw"></a>

### `format.raw(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add raw text.
Note that if this is added inside a formatting helper, the outer formatting will be applied to this text.</p>

**Kind**: static method of [<code>format</code>](#format)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.bold"></a>

### `format.bold(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add bold text</p>

**Kind**: static method of [<code>format</code>](#format)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.code"></a>

### `format.code(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add code-formatted text</p>

**Kind**: static method of [<code>format</code>](#format)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.highlight"></a>

### `format.highlight(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add highlighted text</p>

**Kind**: static method of [<code>format</code>](#format)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.italics"></a>

### `format.italics(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add italicized text</p>

**Kind**: static method of [<code>format</code>](#format)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.underline"></a>

### `format.underline(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add underlined text</p>

**Kind**: static method of [<code>format</code>](#format)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.strikethrough"></a>

### `format.strikethrough(content)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add strikethrough text</p>

**Kind**: static method of [<code>format</code>](#format)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |

<a name="format.link"></a>

### `format.link(content, url)` ⇒ [<code>FormattedContent</code>](#format.FormattedContent)
<p>Add a link</p>

**Kind**: static method of [<code>format</code>](#format)  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> \| [<code>FormattedContent</code>](#format.FormattedContent) \| <code>Array.&lt;(string\|format.FormattedContent)&gt;</code> | <p>The content to add</p> |
| url | <code>string</code> \| <code>null</code> | <p>The URL of the link. If none is provided, the content will be used as the link URL</p> |

**Example**  
```js
fmt.link('Example', 'https://example.com')
```
**Example**  
```js
fmt.link('https://example.com')
```
<a name="frontMatter"></a>

## `frontMatter` : <code>object</code>
<p>Functions for creating frontmatter</p>

**Kind**: global namespace  
**Example** *(Adding a PagerDuty incident to a notebook)*  
```js
notebook.addFrontMatter(
  frontMatter.pagerdutyIncident(pagerduty_frontmatter)
)
```
<a name="frontMatter.pagerdutyIncident"></a>

### `frontMatter.pagerdutyIncident(frontMatterValue, key, displayName)` ⇒ <code>object</code>
<p>Creates a PagerDuty Incident frontmatter value and schema.</p>

**Kind**: static method of [<code>frontMatter</code>](#frontMatter)  

| Param | Type | Description |
| --- | --- | --- |
| frontMatterValue | <code>string</code> | <p>The value of the front matter as defined by the api. Recommended to use the value provided by the PagerDuty integration.</p> |
| key | <code>string</code> | <p>The key of the front matter entry</p> |
| displayName | <code>string</code> | <p>The display name of the front matter entry</p> |

<a name="snippet"></a>

## `snippet(cells)` ⇒ [<code>Array.&lt;Cell&gt;</code>](#cell.Cell)
<p>Function for creating Snippets, or reusable groups of cells.</p>

**Kind**: global function  

| Param | Type |
| --- | --- |
| cells | [<code>Array.&lt;Cell&gt;</code>](#cell.Cell) | 

**Example**  
```js
fp.snippet([
 c.text('Hello, world!'),
 c.code('This is a snippet'),
])
```
