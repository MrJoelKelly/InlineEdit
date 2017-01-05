# jQuery InlineEdit Plugin

A jQuery plugin to allow inline edits of data, with the changes then sent via AJAX to a server.

## Requirements

jQuery (Tested on v3.1.1)

inlineedit.js

inlineedit.css

## Browser Support

Tested on:
* Chrome 55.0.2883.87
* Firefox 50.1.0
* Microsoft Edge 38.14393.0.0
* Internet Explorer 11

## Functionality

On double click of an initiated element, creates a text input containing the existing data from the element. The user may then change this data with changes sent to the server. If the data is succesfully handled by the server, the data will also be updated client-side without the need for additional requests.. Works with any text-based data within an element, i.e. if your `<div>` element contains the text `Orange`, then this will be the editable data.

The data *may* be validated client-side if a valid *data-regex* is given. Check **build** for a working example (requires a custom server-side URL).

## Setup

Include the necessary files stated in **Requirements** i.e.
```
<script type="text/javascript" src="/path/to/jquery-latest.js"></script>
<script type="text/javascript" src="/path/to/inlineedit.js"></script>
<link rel="stylesheet" type="text/css" href="/path/to/inlineedit.css">
```

It can be setup on any regular HTML DOM element, e.g. div, article, section etc. Initialise the element like the following:
```
$(document).ready(function(){
  $('#myElement').inlineEdit();
})
```
et voilà! You're all set to go.

You can initialise elements by any valid jQuery selector. Even if multiple elements are initialised at once, they will still be handled separately when editing.

#### Element Attributes

Some data-* attributes are required on the affected element for InlineEdit to function correctly:

| Attribute | Description | Valid Parameters  | Mandatory/Optional |
| ------------- |:-------------:|:-----------------:|:------:
| **data-identifier** | Used as a unique identifier (ID) for the element. This will be sent to the server to allow you to better process the data. | Any String/Int etc. | **Mandatory** |
| **data-regex** | Regular expression to validate (client-side) the new value entered by the user. | A valid JS Regular Expression. E.g. "^([a-z])+$" | *Optional* |
| **data-regex-comment** | Error comment to display to the user on a failed RegEx test (if exists). Will only be used in conjunction with *data-regex*, however *data-regex* does **not** require this attribute. | Any string | *Optional* |

### Options

To add an option to your DateTimePicker, simply include it in the initialisation as follows:
```
$(document).ready(function(){
  $('#myElement').inlineEdit({ optionName: value(s) });
})
```


| optionName    | Description   | Valid Parameters  | Default Value | Mandatory/Optional |
| ------------- |:-------------:|:-----------------:|:------:|:-----:|
| **url** | The server-side URL to send the new data to. | An absolute or relative URL |  | **Mandatory** |
| **keycodes** | Unicode keycodes used to allow a user to save/cancel an edit with their keyboard. May contain empty arrays to not allow for keyboard input, but the valid format must still be followed. | An object containg an array in each of the keys *cancel* and *save*, i.e. of the following format: ***keycodes: { cancel: [10], save: [55] }*** | *cancel*: [27] (Esc), *save*: [13] (Enter) | *Optional* |
| **input_type** | The HTML input type attribute. Only minor support exists in this version, intend to expand functionality of this option in the future. | text, number, password, search, tel | text | *Optional* |
| **outer_click** | On mouse-click outside of the editable unit, whether to save/cancel the data. *enabled* decides whether anything happens on this click (*true* for yes, *false* for no). *action* decides whether to save (*true*) or cancel (*false*) the edit | An object of the format ***outer_click: { enabled: true, action: false }*** | {enabled: true, action: false} | *Optional* |

## Server-Side Handling

New data is sent to the server via an AJAX POST request. Values passed are:

| POST Name | Description | Value |
| ------------- |:-------------:|:-----------------:|
| **type** | Used to identify the data as being from InlineEdit. | "InlineEdit" |
| **id** | The unique identifier for the element. | The value taken from the *data-identifier* attribute |
| **old_data** | To allow for cross-validation | The previous value of the element |
| **new_data** | The user-updated value | The new value of the element |

It is recommended that you take additional precautions to validate the data received from the client.

This data should be handled as all other POST requests, i.e. for a PHP handler:
```
if($_POST["type"] == "InlineEdit"){
  $data = $_POST["new_data"];
  ...
  doSomething();
}
```
