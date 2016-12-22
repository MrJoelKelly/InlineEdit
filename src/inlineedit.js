/*
  jQuery InlineEdit Plugin
  https://github.com/MrJoelKelly/InlineEdit
  Joel Kelly (Joel.Kelly@keltec.systems)
*/
(function($){
  var InlineEdit; //The editable element

  var system_options = {};

  //Pre-determined options, will be updated based on user-set options
  var options = {
    url: '', //Passed to jQuery ajax directly, so absolute/relative handled accordingly
    keycodes: { //Contains the keycode values to cancel/save an edit
      cancel: [27], //27 = Esc
      save: [13] //13 = Enter
    },
    input_type: 'text'
  };

  //Values pertaining to the element
  var values = {
    current_data: '', //The current text value of the element, sent to the server in case of wanting to record changes more accurately
    identifier: '', //From the data-identifier attribute
    regex: ''
  }

  $.fn.inlineEdit = function(user_options){
    InlineEdit = $(this);
    setOptions(user_options);
    initiate();
    console.log(options)
  };

  //Takes user defined options and updates the default options where appropriate
  //Ignores any invalid options
  function setOptions(user_options){
    //Iterate through keys given in users options
    for(var key in user_options){
      //Check not empty value
      var empty_test = user_options[key] + ""; //Convert to string to perform boolean test
      if(empty_test){ //If value not empty
        //If exists in default_options, these are user-definable options
        if(key in options){
          //If the key exists in system_options, we need to check that the parameter passed is also valid
          if(key in system_options){
            //If a valid option from system_options
            if(!(user_options[key] in system_options[key])) continue //Skips rest of loop if the key doesn't have a valid value within system_options
          }

          //Validation tests
          valid = false; //Presume invalidity
          switch(key){
            case 'input_type': //Check against valid HTML5 input types (which we want to use)
              var validTypes = ['text','number','password','search','tel'] //Valid input types
              if($.inArray(user_options[key], validTypes) > -1){
                valid = true;
              }
              break;
            case 'keycodes':
              break;
            default: //Any others that don't require validation, such as buttonText
              valid = true;
              break;
          };

          if(valid){
            options[key] = user_options[key]; //Update default_options values
          }
        }
      }
    }
  };

  //Initialises the element
  function initiate(){
    //Make sure a server url has been set
    if(!isEmpty(options.url)){
      values.current_data = InlineEdit.text();
      values.identifier = InlineEdit.attr('data-identifier');
      if(!isEmpty(InlineEdit.attr('data-regex'))){
        values.regex = new RegExp(InlineEdit.attr('data-regex'));
      }

      console.log(values)
      //Apply InlineEdit class
      InlineEdit.addClass('InlineEdit');

      //Bind element on double click
      InlineEdit.dblclick(function(){ makeEditable(); });
    }
  }

  //Makes an element editable
  function makeEditable(){
    if(!InlineEdit.hasClass('InlineEdit-active')){ //Not already editable
      var input_element = '<input class="InlineEdit-input" type="' + options.input_type + '" value="' + values.current_data + '">';
      var button_element = '<div class="InlineEdit-buttons"><div class="InlineEdit-cancel">Cancel</div><div class="InlineEdit-save">Save</div></div>'; //Save/Cancel floating buttons

      InlineEdit.addClass('InlineEdit-active').empty().append(input_element).append(button_element).find('input').focus();

      //Bind button elements
      InlineEdit.find('div.InlineEdit-cancel').click(function(){ cancelEdit(); })
      InlineEdit.find('div.InlineEdit-save').click(function(){ saveEdit(); })

      //Check for cancel/save when input is focused
      InlineEdit.find('input[type=text]').keyup(function(e){ //e.which contains the keydown KeyCode
        if($.inArray(e.which, options.keycodes.cancel) > -1){ // Revert to original content
          cancelEdit();
        }else if($.inArray(e.which, options.keycodes.save) > -1){ //Test & Save new value
          saveEdit();
        }
      })
    }
  }

  function cancelEdit(){
    InlineEdit.removeClass('InlineEdit-active').empty().append(values.current_data);
  }

  function saveEdit(){
    removeErrors();
    var new_data = InlineEdit.find('input').val();
    if(!isEmpty(values.regex)){ //If data-regex is set
      if(!values.regex.test(new_data)){ //Test new data against regexp
        throwError('Invalid value entered.');
        return false;
      }
    }

    //Now send to server
    if(new_data != values.current_data){ //If data has changed
      $.ajax({
        method: "POST",
        url: options.url,
        data: {
          type: 'InlineEdit',
          id: values.identifier,
          old_data: values.current_data,
          new_data: new_data
        }
      })
        .done(function(){ //On success
          values.current_data = new_data;
          cancelEdit();
        })
        .fail(function(){ //On Fail, revert to previous
          cancelEdit();
          throwError('Error sending to server',5000)
        });
    }else{
      cancelEdit();
    }
  }

  function removeErrors(){
    InlineEdit.removeClass('InlineEdit-error').find('div.InlineEdit-error-float').remove();
  }

  //Used to test if an object/val is empty.
  //Return true if empty, false if not
  function isEmpty(value){
    var test_string = value+'';
    if(!test_string || value == null){
      return true;
    }else{
      return false;
    }
  }

  //Throws an error on the object
  function throwError(text,timer){
    if(isEmpty(text)){ //Default error string
      text = 'An unknown error occurred';
    }
    var error_element = $('<div class="InlineEdit-error-float">' + text + '</div>');

    InlineEdit.addClass('InlineEdit-error').append(error_element);

    if(!isEmpty(timer)){ //Setting timeout to hide certain errors after some time
      setTimeout(function(){
        error_element.fadeOut(function(){error_element.remove();});
      }, timer);
    }
  }
})(jQuery);
