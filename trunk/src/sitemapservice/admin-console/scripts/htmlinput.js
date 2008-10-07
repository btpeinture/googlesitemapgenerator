// Copyright 2007 Google Inc.
// All Rights Reserved.

/**
 * @fileoverview
 *
 * @author chaiying@google.com
 */

/**
 * Usage:
 * After class constructor, call
 *   ClassName.inheritsFrom(ValueChangeManage);
 * @constructor
 */
function ValueChangeManage() {
  this.valuechangehandlers_ = [];
}
/**
 * Call it on each time the value is changed by user.
 */
ValueChangeManage.prototype.onValueChange_ = function() {
  _arr(this.valuechangehandlers_, function(o) {
    o.func(o.listener);
  });
};

/**
 * Allow other code being notified when value is changed by user.
 * All the handlers will be called in onValueChange_
 * @param {Object} f
 */
ValueChangeManage.prototype.registValueChangeHandler = function(listener, f) {
  this.valuechangehandlers_.push({listener: listener, func: f});
};

ValueChangeManage.prototype.clearValueChangeHandlers = function() {
  this.valuechangehandlers_ = [];
};

ValueChangeManage.util = {};
ValueChangeManage.util.propagateChangeEvent = function(from, to) {
  from.registValueChangeHandler(null, function(){
    to.onValueChange_();
  });
};
ValueChangeManage.util.regHandlerToElem = function(elem, event, owner) {
  _event(elem, event, function() {
    if (owner.isElemOwner())
      owner.onValueChange_();
  });
};
///////////////////////////////
// For default display functions
/**
 * 
 * @constructor
 */
function CustomNotify() {

}
// logic layer, no variety
/**
 * Usage:
 * call ClassA.borrowFrom(CustomNotify) after ClassA's constructor definition.
 * Implement addDefaultCSS_ and removeDefaultCSS_ functions.
 * @param {Object} isDefault
 */
CustomNotify.prototype.setDefault = function(isDefault) {
  this.isDefault_ = isDefault;
  if (isDefault)
    this.addDefaultCSS_();
  else
    this.removeDefaultCSS_();
};

/**
 * handle variety for value comparation.
 * @param {Object} val
 */
CustomNotify.prototype.compareValue = function(val) {
  return this.getValue() == val;
};

/**
 * handle variety for adding 'default' CSS to html UI.
 */
CustomNotify.prototype.addDefaultCSS_ = function() {
  _err('Not implemented');
};

/**
 * handle variety for removing 'default' CSS to html UI.
 */
CustomNotify.prototype.removeDefaultCSS_ = function() {
  _err('Not implemented');
};

CustomNotify.setDefaultCSS = function(elem, isDefault) {
  isDefault ? Util.CSS.changeClass(elem, 'custom-val', 'default-val') :
              Util.CSS.changeClass(elem, 'default-val', 'custom-val');
};

//////////////////////////////////////////
/**
 * 
 * @constructor
 */
function ValidNotify() {
}
// TODO: overwrite the function for all htmlinput classes.
ValidNotify.prototype.setValid = function(isValid) {
  _err('Not implemented');
};
///////////////////////////////////////////////////////////
/**
 *
 * @constructor
 * @param {Object} id
 */
function HtmlInput(id) {
  if (arguments[0] == 'inheritsFrom') {
    // called by inheritsFrom function
    return;
  }

  HtmlInput.prototype.parent.constructor.call(this);

  // If id is null, it must be called from subclass, and subclass must overwrite
  // functions that related to the html element
  this.id_ = id;
  if (id) {
    this.element_ = _gel(id);
  }
  Component.regist(this);
}
HtmlInput.inheritsFrom(ValueChangeManage);
HtmlInput.borrowFrom(CustomNotify);
HtmlInput.borrowFrom(ValidNotify);

HtmlInput.prototype.setValid = function(isValid) {
  ValidateManager.setElementValidation_(this.element_, isValid);
};

HtmlInput.prototype.release = function() {
  if (this.element_) {
    this.element_.setting_ = null;
    this.element_ = null;
  }
};

HtmlInput.prototype.focus = function() {
  this.element_.focus();
};

/**
 * Sets access right to the HTML element of the setting.
 * @param {AccessManager} access  The access manager of this setting
 * @param {HTMLELement} elem  The HTML element of the setting
 */
HtmlInput.prototype.setAccess = function(readonly) {
  AccessManager.util.setAccessForElem(readonly, this.element_);
};

HtmlInput.prototype.setElemOwner = function() {
  this.element_.setting_ = this;
};

HtmlInput.prototype.isElemOwner = function() {
  return this.element_.setting_ == this;
};

// should be implemented by subclass
HtmlInput.prototype.setValue = function(value) {
  _err('Not implemented');
};

// should be implemented by subclass
HtmlInput.prototype.getValue = function() {
  _err('Not implemented');
};

HtmlInput.prototype.appendRangeToTip = function(range) {
  var elem = this.element_;
  if (elem.tip && !elem.tipWithoutRange_) {
    // add range info to tips
    elem.tipWithoutRange_ = elem.tip;
    elem.tip += ' Range=' + range;
  }
};


///////////////////////////////

/**
 * handle variety for adding 'default' CSS to html UI.
 */
HtmlInput.prototype.addDefaultCSS_ = function() {
  CustomNotify.setDefaultCSS(this.element_, true);
};

/**
 * handle variety for removing 'default' CSS to html UI.
 */
HtmlInput.prototype.removeDefaultCSS_ = function() {
  CustomNotify.setDefaultCSS(this.element_, false);
};

//////////////////////////////////////////////////////////////
/**
 * TODO: test its usage, and deside whether it is necessary.
 * for setting that need to change value by user, but do not have a html element
 * to contain the value. It is currently used by siteEnable setting in
 * SiteManageGroup.
 * @constructor
 */
function FakeHtmlInput() {
  this.parent.constructor.call(this);
  this.value_ = null;
  Component.regist(this);
}
FakeHtmlInput.inheritsFrom(HtmlInput);

FakeHtmlInput.prototype.setValue = function(value) {
  this.value_ = value;
};

FakeHtmlInput.prototype.getValue = function() {
  return this.value_;
};

// fake functions
FakeHtmlInput.prototype.release = function() {
};

FakeHtmlInput.prototype.focus = function() {
};

FakeHtmlInput.prototype.addDefaultCSS_ = function() {
};

FakeHtmlInput.prototype.removeDefaultCSS_ = function() {
};

FakeHtmlInput.prototype.setAccess = function(readonly) {
};

FakeHtmlInput.prototype.setElemOwner = function() {
};

FakeHtmlInput.prototype.isElemOwner = function() {
  // FakeHtmlInput don't need to share html element with others, since it has
  // no html element.
  return true;
};

FakeHtmlInput.prototype.appendRangeToTip = function(range) {
};

FakeHtmlInput.prototype.setValid = function(isValid) {
};
//////////////////////////////////////////////////////////////
/**
 * 
 * @constructor
 * @param {Object} id
 */
function BoolHtmlInput(id){
  this.parent.constructor.call(this, id);
  ValueChangeManage.util.regHandlerToElem(this.element_, 'click', this);
  var me = this;
  this.registValueChangeHandler(this, function() {
    me.onValueChange();
  });

  // hack code for sitemap disable warning box.
  var pos = id.search('-enable');
  if (pos != -1) {
    this.sitemapId_ = id.substr(0, pos);
    this.warning_ = _gel(this.sitemapId_ + '-warning');

    // set 'Enable' link in sitemap disable warning message on sitemap page.
    var a = this.warning_.getElementsByTagName('a')[0];
    _event(a, 'click', function() {
      // equal to _getSetting().setEnable(id, true); and _hide(me.warning_);
      me.setValue(true);
    });
    // call  _getPager().onSettingChange();
    ValueChangeManage.util.regHandlerToElem(a, 'click', this);
  }
}
BoolHtmlInput.inheritsFrom(HtmlInput);

BoolHtmlInput.prototype.setValue = function(value) {
  this.element_.checked = value;
  this.onValueChange();
};

BoolHtmlInput.prototype.onValueChange = function() {
  if (this.warning_) {
    var value = this.getValue();
    !value ? _show(this.warning_) : _hide(this.warning_);
  }
};

BoolHtmlInput.prototype.getValue = function() {
  return this.element_.checked;
};

//////////////////////////////////////////////////////////////
/**
 * 
 * @constructor
 * @param {Object} id
 */
function TextHtmlInput(id) {
  this.parent.constructor.call(this, id);
  this.prefix_ = null;
  ValueChangeManage.util.regHandlerToElem(this.element_, 'change', this);
}
TextHtmlInput.inheritsFrom(HtmlInput);

TextHtmlInput.prototype.setPrefix = function(value) {
  this.prefix_ = value;
  this.prefixLen_ = this.prefix_.length;
};

TextHtmlInput.prototype.setValue = function(value) {
  if (this.prefix_ != null &&
      value.substr(0, this.prefixLen_) == this.prefix_) {
    value = value.substr(this.prefixLen_, value.length - this.prefixLen_);
  }
  this.element_.value = value;

};

TextHtmlInput.prototype.getValue = function() {
  var value = this.element_.value;
  if (this.prefix_ != null)
    value = this.prefix_ + value;
  return value;
};

//////////////////////////////////////////////////////////////
/**
 * 
 * @constructor
 * @param {Object} id
 */
function RadioHtmlInput(id) {
  this.parent.constructor.call(this, id);
  ValueChangeManage.util.regHandlerToElem(this.element_, 'click', this);
}
RadioHtmlInput.inheritsFrom(HtmlInput);

RadioHtmlInput.prototype.setValue = function(value) {
  this.element_.setAttribute('value', value);
};

RadioHtmlInput.prototype.getValue = function() {
  return this.element_.getAttribute('value');
};

/**
 *
 * @param {Boolean} value
 */
RadioHtmlInput.prototype.setChecked = function(value) {
  this.element_.checked = value;
};

RadioHtmlInput.prototype.getChecked = function() {
  return this.element_.checked;
};


//////////////////////////////////////////////////////////////
/**
 *
 * @param {Array.<string>} idset  The last id is for custom value if
 *   opt_customHtmlInput != null
 * @constructor
 */
function RadioGroup(id) {
  this.parent.constructor.call(this);

  // add input radios to this group
  this.radios_ = [];
  var inputs = _gel(id).getElementsByTagName('input');
  var len = inputs.length;
  var n = 0;
  for (var i = 0; i < len; i++) {
    var input = inputs[i];
    if (input.type == 'radio') {
      input.id = id + '-' + (n++);
      var r = new RadioHtmlInput(input.id);
      this.radios_.push(r);
      ValueChangeManage.util.propagateChangeEvent(r, this);
    } else if (input.type == 'text') {
      if (this.customInput_)
        _err('unexpect input html');
      input.id = id + '-c';
      this.customInput_ = new TextHtmlInput(input.id);
      ValueChangeManage.util.propagateChangeEvent(this.customInput_, this);
      this.radios_[n - 1].clearValueChangeHandlers();
    } else {
      _err('invalid input type');
    }
  }

  Component.regist(this);
}
RadioGroup.inheritsFrom(ValueChangeManage);
RadioGroup.borrowFrom(CustomNotify);
RadioGroup.borrowFrom(ValidNotify);

RadioGroup.prototype.setValid = function(isValid) {
  // Not sure which style is good for this type of input.
};

/**
 * handle variety for adding 'default' CSS to html UI.
 */
RadioGroup.prototype.addDefaultCSS_ = function() {
  _arr(this.radios_, function(r) {
    r.addDefaultCSS_();
  });
  if (this.customInput_)
    this.customInput_.addDefaultCSS_();
};

/**
 * handle variety for removing 'default' CSS to html UI.
 */
RadioGroup.prototype.removeDefaultCSS_ = function() {
  _arr(this.radios_, function(r) {
    r.removeDefaultCSS_();
  });
  if (this.customInput_)
    this.customInput_.removeDefaultCSS_();
};

RadioGroup.prototype.getValue = function() {
  var len = this.radios_.length;
  if (this.customInput_ && this.radios_[len - 1].getChecked()) {
    return this.customInput_.getValue();
  }
  for (var i = 0; i < len; i++) {
    var r = this.radios_[i];
    if (r.getChecked()) {
      return r.getValue();
    }
  }
};

RadioGroup.prototype.setValue = function(value) {
  // clean custom setting
  if (this.customInput_) {
    this.customInput_.setValue('');
  }
  // compare to the preset values
  var len = this.radios_.length;
  for (var i = 0; i < len; i++) {
    var r = this.radios_[i];
    if (r.getValue() == value) {
      r.setChecked(true);
      return;
    }
  }
  // set as custom value
  if (this.customInput_) {
    this.customInput_.setValue(value);
    this.radios_[len - 1].setChecked(true);
  }
};

RadioGroup.prototype.release = function() {
  this.customInput_ = null;
};

RadioGroup.prototype.focus = function() {
  this.radios_[0].focus();
};

/**
 * Sets access right to the HTML element of the setting.
 * @param {AccessManager} access  The access manager of this setting
 * @param {HTMLELement} elem  The HTML element of the setting
 */
RadioGroup.prototype.setAccess = function(readonly) {
  _arr(this.radios_, function(r) {
    r.setAccess(readonly);
  });
  if (this.customInput_)
    this.customInput_.setAccess(readonly);
};

RadioGroup.prototype.setElemOwner = function() {
  _arr(this.radios_, function(r) {
    r.setElemOwner();
  });
  if (this.customInput_)
    this.customInput_.setElemOwner();
};

RadioGroup.prototype.isElemOwner = function() {
  return this.radios_[0].isElemOwner();
};

RadioGroup.prototype.appendRangeToTip = function(range) {
  if (this.customInput_)
    this.customInput_.appendRangeToTip(range);
};

//////////////////////////////////////////////////////////////
/**
 * Note: Don't need external validator for this.
 * @param {Object} id
 * @constructor
 */
function ListHtmlInput(id) {
  if (arguments[0] == 'inheritsFrom') {
    // called by inheritsFrom function
    return;
  }
  ListHtmlInput.prototype.parent.constructor.call(this);
  this.id_ = id;
  this.input_ = _gel(id + '-input');
  this.addButton_ = _gel(id + '-add');
  this.area_ = _gel(id + '-area');
  /**
   * @type {Array.<UrlItem>}
   */
  this.items_ = [];
  this.validator_ = null;
  var me = this;
  function addComplete() {
    if (me.isElemOwner()) {
      var value = me.input_.value;
      if (value.length == 0) {
        return;
      }
      if (!me.validator_.check(value)) {
        alert(VALIDATING_FAIL_MSG);
        me.setValid(false);
        return;
      } else {
        me.setValid(true);
      }

      me.addItem(value);
      if (me.areaExt_) me.areaExt_.open();
      me.input_.value = '';
      me.onValueChange_();
    }
  }
  _event(this.addButton_, 'click', addComplete);
  Util.event.addEnterKey(this.input_, addComplete);
  Component.regist(this);
}
ListHtmlInput.inheritsFrom(ValueChangeManage);
ListHtmlInput.borrowFrom(CustomNotify);
ListHtmlInput.borrowFrom(ValidNotify);

ListHtmlInput.prototype.setValid = function(isValid) {
  ValidateManager.setElementValidation_(this.input_, isValid);
};

/**
 * handle variety for adding 'default' CSS to html UI.
 */
ListHtmlInput.prototype.addDefaultCSS_ = function() {
  _arr(this.items_, function(item) {
    item.addDefaultCSS_();
  });
};

/**
 * handle variety for removing 'default' CSS to html UI.
 */
ListHtmlInput.prototype.removeDefaultCSS_ = function() {
  _arr(this.items_, function(item) {
    item.removeDefaultCSS_();
  });
};

ListHtmlInput.prototype.release = function() {
  if (this.addButton_) {
    this.addButton_.setting_ = null;
    this.addButton_ = null;
  }
  this.area_ = null;
  this.input_ = null;
};

ListHtmlInput.prototype.setValidator = function(v) {
  this.validator_ = v;
};

ListHtmlInput.prototype.addItem = function(value, opt_status) {
  var repItem;
  var repeat = Util.array.checkIfAny(this.items_, function(item) {
    if (item.getValueOnly_() == value) {
      repItem = item;
      return true;
    }
    return false;
  });
  if (repeat) {
    if (repItem.isDeleted()) {
      repItem.recover();
    } else {
      alert('This value has existed in the list: ' + value);
    }
    return;
  }
  var index = this.items_.length;
  var itemId = this.id_ + '-' + index;

  if (index == 0) {
    // clear
    this.area_.innerHTML = '';
  }

  // this function should be implemented by subclass
  var item = this.createItem_(itemId);

  // propagate the value change from subcomp to this.
  ValueChangeManage.util.propagateChangeEvent(item, this);
  if (opt_status != null)
    item.setStatus(opt_status);
  item.setValue(value);
  item.setDefault(this.isDefault_);
  item.setValidator(this.validator_);
  // addItem occur only when it is the owner of the Html element.
  item.setElemOwner();
  this.items_.push(item);
};
/**
 *
 * @param {Object} itemId
 * @return {ListItem}
 */
ListHtmlInput.prototype.createItem_ = function(itemId) {
  _err('Not implemented');
};

ListHtmlInput.prototype.setValue = function(value) {
  // clear value first
  this.items_ = [];
  this.area_.innerHTML = 'no items';
  var me = this;
  _arr(value, function(val) {
    me.addItem(val[0], val[1]);
  });
};

ListHtmlInput.prototype.getValue = function() {
  for (var i = this.items_.length - 1; i >= 0; i--) {
    if (this.items_[i].isDeleted()) {
      this.items_.splice(i, 1);
    }
  }
  var vals = [];
  _arr(this.items_, function(item) {
    // only for single attribute now.
    var v = item.getValue();
    if (v != null)
      vals.push(v);
  });
  return vals;
};

ListHtmlInput.prototype.compareValue = function(value) {
  return Util.array.equals(value, this.getValue());
};

ListHtmlInput.prototype.focus = function() {
  this.input_.focus();
};

/**
 * Sets access right to the HTML element of the setting.
 * @param {AccessManager} access  The access manager of this setting
 * @param {HTMLELement} elem  The HTML element of the setting
 */
ListHtmlInput.prototype.setAccess = function(readonly) {
  AccessManager.util.setAccessForElem(readonly, this.addButton_);
  AccessManager.util.setAccessForElem(readonly, this.input_);

  _arr(this.items_, function(item) {
    item.setAccess(readonly);
  });
};

ListHtmlInput.prototype.setElemOwner = function() {
  this.addButton_.setting_ = this;
  this.input_.setting_ = this;

  _arr(this.items_, function(item) {
    item.setElemOwner();
  });
};

ListHtmlInput.prototype.isElemOwner = function() {
  return this.addButton_.setting_ == this;
};

ListHtmlInput.prototype.appendRangeToTip = function(range) {
};
//////////////////////////////////////////////////////////////
/**
 * 
 * @constructor
 * @param {Object} id
 */
function UrlList(id) {
  // set the name of the node
  UrlList.prototype.parent.constructor.call(this, id);
  this.areaExt_ = new ExpandHtml(_gel(id + '-s'), [this.area_],
                                 {open: 'Show all', close: 'Hide all'});
  FLAG_LIST_AUTO_EXTEND ? this.areaExt_.open() : this.areaExt_.close();
}
UrlList.inheritsFrom(ListHtmlInput);

/**
 *
 * @param {Object} itemId
 * @return {ListItem}
 */
UrlList.prototype.createItem_ = function(itemId) {
  /* insert the html
   * <div><span class='urltext'>value</span>
   * <span class='actions'>
   * - <a>Edit</a>
   * - <a>Disable</a>
   * - <img src='/images/del.gif'>
   * </span></div>
   */
  var itembox = document.createElement('div');
  itembox.id = itemId;
  Util.CSS.addClass(itembox, 'item');
  itembox.innerHTML = ['<span id=', itemId, '-name class=hidden></span>',
                       '<span id=', itemId, '-txt class=urltext></span>',
                       '<input id=', itemId,
                       '-input type=text class="item-input hidden">',
                       '<span class=actions>',
                       ' - <a id=', itemId,
                       '-edit href=#>Edit</a>',
                       ' - <a id=', itemId,
                       '-disable href=#>Disable</a>',
                       ' - <img  id=', itemId,
                       '-del src=/images/del.gif>',
                       '</span>'].join('');

  // add it to document
  this.area_.insertBefore(itembox, this.area_.firstChild);

  return new UrlItem(itemId);
};

//////////////////////////////////////////////////////////////
/**
 * 
 * @constructor
 * @param {Object} id
 */
function QueryFieldList(id) {
  // set the name of the node
  QueryFieldList.prototype.parent.constructor.call(this, id);
}
QueryFieldList.inheritsFrom(ListHtmlInput);


QueryFieldList.prototype.addItem = function(value, opt_status) {
  var vals = value.split(/,[ ]*/); // seperate by comma, allow some whitespace
  var len = vals.length;
  for (var i = 0; i < len; i++) {
    QueryFieldList.prototype.parent.addItem.call(this, vals[i], opt_status);
  }
};

/**
 *
 * @param {Object} itemId
 * @return {ListItem}
 */
QueryFieldList.prototype.createItem_ = function(itemId) {
  /* insert the html
   * <div class='queryfield-name' id='xxx'>
   * <input type='checkbox' id='xxx-chk' checked>
   * <label id='xxx-txt' for='xxx-chk'>name1</label>
   * - <img id='xxx-del' src='/images/del.gif'>
   * </div>
   */
  var itembox = document.createElement('div');
  itembox.id = itemId;
  Util.CSS.addClass(itembox, 'queryfield-name')
  itembox.innerHTML =
      '<input type=checkbox class=hidden id=' + itemId + '-chk checked>'
      //+ '<label id=' + itemId + '-txt for=' + itemId + '-chk></label>'
      + '<span id=' + itemId + '-txt></span>'
      + ' - <img  id=' + itemId + '-del src=/images/del.gif>';

  this.area_.appendChild(itembox);

  return new QueryField(itemId);
};
//////////////////////////////////////////////////////////////
/**
 * 
 * @constructor
 * @param {Object} id
 */
function ListItem(id) {
  if (arguments[0] == 'inheritsFrom') {
    // called by inheritsFrom function
    return;
  }
  ListItem.prototype.parent.constructor.call(this);
  this.initHtml_(id);

  this.enable();

  var me = this;
  _event(this.delBtn_, 'click', function() {
    if (!me.isElemOwner())
      return;
    me.del();
    me.onValueChange_();
  });

  Component.regist(this);
}
ListItem.inheritsFrom(ValueChangeManage);
ListItem.borrowFrom(CustomNotify);
ListItem.borrowFrom(ValidNotify);

ListItem.status = {
    DISPLAY: 0, EDIT: 1, ENABLE: 2, DISABLE: 3, ACTIVE: 4, DELETED: 5};

ListItem.prototype.initHtml_ = function(id) {
  this.itembox_ = _gel(id);
  this.delBtn_ = _gel(id + '-del');
  this.textbox_ = _gel(id + '-txt');
  this.value_ = null;
  this.status_ = ListItem.status.ACTIVE;
  this.enableStatus_ = ListItem.status.ENABLE;
};
ListItem.prototype.release = function() {
  if (this.itembox_) {
    this.itembox_ = null;
    this.delBtn_.setting_ = null;
    this.delBtn_ = null;
    this.textbox_.setting_ = null;
    this.textbox_ = null;
  }
};
/**
 * handle variety for adding 'default' CSS to html UI.
 */
ListItem.prototype.addDefaultCSS_ = function() {
  CustomNotify.setDefaultCSS(this.textbox_, true);
};

/**
 * handle variety for removing 'default' CSS to html UI.
 */
ListItem.prototype.removeDefaultCSS_ = function() {
  CustomNotify.setDefaultCSS(this.textbox_, false);
};

ListItem.prototype.setValidator = function(v) {
  this.validator_ = v;
};

ListItem.prototype.setStatus = function(status) {
  status == 'true' ? this.enable() : this.disable();
};

ListItem.prototype.enable = function() {
  Util.CSS.removeClass(this.textbox_, 'disable');
  this.enableStatus_ = ListItem.status.ENABLE;
};
ListItem.prototype.disable = function() {
  Util.CSS.addClass(this.textbox_, 'disable');
  this.enableStatus_ = ListItem.status.DISABLE;
};
ListItem.prototype.del = function() {
  _hide(this.itembox_);
  this.status_ = ListItem.status.DELETED;
};
ListItem.prototype.recover = function() {
  _show(this.itembox_);
  this.status_ = ListItem.status.ACTIVE;
};
ListItem.prototype.isDeleted = function() {
  return this.status_ == ListItem.status.DELETED;
};
ListItem.prototype.setAccess = function(readonly) {
  AccessManager.util.setAccessForElem(readonly, this.delBtn_);
  AccessManager.util.setAccessForElem(readonly, this.textbox_);
};

ListItem.prototype.setElemOwner = function() {
  this.delBtn_.setting_ = this;
  this.textbox_.setting_ = this;
};

ListItem.prototype.isElemOwner = function() {
  return this.textbox_.setting_ == this;
};

/**
 * Interface for super class
 * @param {Object} value
 */
ListItem.prototype.setValue = function(value) {
  this.setValueOnly_(value);
};
ListItem.prototype.setValueOnly_ = function(value) {
  // word wrap url text
  this.value_ = value;
  this.textbox_.innerHTML = ListItem.wordWrap_(
      value, MAX_WORDS_ONE_LINE_FOR_URLEDITOR);
};

ListItem.wordWrap_ = function(text, len) {
  if (text.length > len) {
    var pos = 0;
    var slices = [];
    while (text.length - pos > len) {
      slices.push(text.substr(pos, len));
      pos += len;
    }
    slices.push(text.substr(pos));
    return slices.join('&#8203;');
  }
  return text;
};

ListItem.prototype.getValue = function() {
  var status =
      this.enableStatus_ == ListItem.status.ENABLE ? 'true' : 'false';
  return [this.getValueOnly_(), status];
};
ListItem.prototype.getValueOnly_ = function() {
  return this.value_;
};

ListItem.prototype.appendRangeToTip = function(range) {
  // DO NOTHING
};
ListItem.prototype.triggerEnable = function() {
  if (!this.isElemOwner())
    return;

  if (this.enableStatus_ == ListItem.status.ENABLE) {
    this.disable();
  } else if (this.enableStatus_ == ListItem.status.DISABLE) {
    this.enable();
  }
};
//////////////////////////////////////////////////////////////
/**
 * 
 * @constructor
 * @param {Object} id
 */
function UrlItem(id) {
  UrlItem.prototype.parent.constructor.call(this, id);

  var me = this;
  _event(this.disableLink_, 'click', function() {
    me.triggerEnable();
    me.onValueChange_();
  });
  _event(this.editBtn_, 'click', function() {
    if (!me.isElemOwner())
      return;

    if (me.editBtn_.status_ == ListItem.status.DISPLAY) {
      me.editbox_.value = me.getValueOnly_();
      _show(me.editbox_);
      // hide the actions area
      _hide(me.textbox_);
      _hide(me.editBtn_.parentNode);

      me.editBtn_.innerHTML = 'Save';
      me.editBtn_.status_ = ListItem.status.EDIT;
      me.editbox_.focus();
    }
  });
  function editComplete() {
    if (me.editBtn_.status_ == ListItem.status.EDIT) {
      if (!me.validator_.check(me.editbox_.value)) {
        ValidateManager.setElementValidation_(me.editbox_, false);
        return;
      }
      me.setValueOnly_(me.editbox_.value);
      me.setName(me.editbox_.value);
      _hide(me.editbox_);
      // show the actions area
      _show(me.textbox_);
      _show(me.editBtn_.parentNode);

      me.editBtn_.innerHTML = 'Edit';
      me.editBtn_.status_ = ListItem.status.DISPLAY;
      me.onValueChange_();
    }
  }
  _event(this.editbox_, 'blur', editComplete);
  Util.event.addEnterKey(this.editbox_, editComplete);

}
UrlItem.inheritsFrom(ListItem);

UrlItem.prototype.initHtml_ = function(id) {
  this.parent.initHtml_.call(this, id);
  this.disableLink_ = _gel(id + '-disable');
  this.editbox_ = _gel(id + '-input');
  this.editBtn_ = _gel(id + '-edit');
  this.editBtn_.status_ = ListItem.status.DISPLAY;
  this.namebox_ = _gel(id + '-name');
};

UrlItem.prototype.release = function() {
  UrlItem.prototype.parent.release.call(this);
  if (this.disableLink_) {
    this.disableLink_.setting_ = null;
    this.disableLink_ = null;
    this.editBtn_.setting_ = null;
    this.editBtn_ = null;
    this.editbox_.setting_ = null;
    this.editbox_ = null;
    this.namebox_ = null;
  }
};

UrlItem.prototype.focus = function() {
  this.editBtn_.focus();
};

UrlItem.prototype.enable = function() {
  UrlItem.prototype.parent.enable.call(this);
  this.disableLink_.innerHTML = 'Disable';
};
UrlItem.prototype.disable = function() {
  UrlItem.prototype.parent.disable.call(this);
  this.disableLink_.innerHTML = 'Enable';
};
/**
 * Sets access right to the HTML element of the setting.
 * @param {AccessManager} access  The access manager of this setting
 * @param {HTMLELement} elem  The HTML element of the setting
 */
UrlItem.prototype.setAccess = function(readonly) {
  UrlItem.prototype.parent.setAccess.call(this, readonly);

  AccessManager.util.setAccessForElem(readonly, this.editBtn_);
  AccessManager.util.setAccessForElem(readonly, this.disableLink_);
  AccessManager.util.setAccessForElem(readonly, this.editbox_);
};

UrlItem.prototype.setElemOwner = function() {
  UrlItem.prototype.parent.setElemOwner.call(this);
  this.editBtn_.setting_ = this;
  this.disableLink_.setting_ = this;
  this.editbox_.setting_ = this;
};

UrlItem.prototype.setName = function(value) {
  var seName;
  var match =
      Util.array.checkIfAny(ConstVars.defaultSearchEngines, function(se) {
        if (se.url == value) {
          seName = se.name;
          return true;
        }
        return false;
      });

  if (match) {
    this.namebox_.innerHTML = '(' + seName + ') ';
    _show(this.namebox_);
  } else {
    _hide(this.namebox_);
  }
};
UrlItem.prototype.setValue = function(value) {
  this.parent.setValue.call(this, value);
  this.setName(value);
};

//////////////////////////////////////////////////////////////
/**
 * 
 * @constructor
 * @param {Object} id
 */
function QueryField(id) {
  QueryField.prototype.parent.constructor.call(this, id);

  var me = this;
  _event(this.enableChk_, 'click', function() {
    me.triggerEnable();
  });
}
QueryField.inheritsFrom(ListItem);

QueryField.prototype.initHtml_ = function(id) {
  this.parent.initHtml_.call(this, id);
  this.enableChk_ = _gel(id + '-chk');
};

QueryField.prototype.release = function() {
  QueryField.prototype.parent.release.call(this);
  if (this.enableChk_) {
    this.enableChk_.setting_ = null;
    this.enableChk_ = null;
  }
};

QueryField.prototype.focus = function() {
  this.enableChk_.focus();
};
QueryField.prototype.enable = function() {
  QueryField.prototype.parent.enable.call(this);
  this.enableChk_.checked = true;
};
QueryField.prototype.disable = function() {
  QueryField.prototype.parent.disable.call(this);
  this.enableChk_.checked = false;
};

/**
 * Sets access right to the HTML element of the setting.
 * @param {AccessManager} access  The access manager of this setting
 * @param {HTMLELement} elem  The HTML element of the setting
 */
QueryField.prototype.setAccess = function(readonly) {
  QueryField.prototype.parent.setAccess.call(this, readonly);
  AccessManager.util.setAccessForElem(readonly, this.enableChk_);
};

QueryField.prototype.setElemOwner = function() {
  QueryField.prototype.parent.setElemOwner.call(this);
  this.enableChk_.setting_ = this;
};

/////////////////////////////////////////////////////////////////////////
/**
 * 
 * @constructor
 * @param {Object} id
 */
function TimeHtmlInput(id) {
  TimeHtmlInput.prototype.parent.constructor.call(this);
  this.date_ = _gel(id + '-date');
  this.time_ = _gel(id + '-time');
  ValueChangeManage.util.regHandlerToElem(this.date_, 'change', this);
  ValueChangeManage.util.regHandlerToElem(this.time_, 'change', this);

  Component.regist(this);
}
TimeHtmlInput.inheritsFrom(ValueChangeManage);
TimeHtmlInput.borrowFrom(CustomNotify);
TimeHtmlInput.borrowFrom(ValidNotify);

TimeHtmlInput.prototype.setValid = function(isValid) {
  if (!isValid) {
    // Some hack code.
    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.date_.value)) {
      ValidateManager.setElementValidation_(this.date_, false);
    }
    if (!/^\d{2}:\d{2}:\d{2}$/.test(this.time_.value)) {
      ValidateManager.setElementValidation_(this.time_, false);
    }
  } else {
    ValidateManager.setElementValidation_(this.date_, true);
    ValidateManager.setElementValidation_(this.time_, true);
  }
};
/**
 * handle variety for adding 'default' CSS to html UI.
 */
TimeHtmlInput.prototype.addDefaultCSS_ = function() {
  CustomNotify.setDefaultCSS(this.date_, true);
  CustomNotify.setDefaultCSS(this.time_, true);
};

/**
 * handle variety for removing 'default' CSS to html UI.
 */
TimeHtmlInput.prototype.removeDefaultCSS_ = function() {
  CustomNotify.setDefaultCSS(this.date_, false);
  CustomNotify.setDefaultCSS(this.time_, false);
};

TimeHtmlInput.prototype.getValue = function() {
  return this.date_.value + ' ' + this.time_.value;
};

TimeHtmlInput.prototype.setValue = function(value) {
  var strs = value.split(' ');
  this.date_.value = strs[0];
  this.time_.value = strs[1];
};

TimeHtmlInput.prototype.release = function() {
  if (this.enableChk_) {
    this.date_.setting_ = null;
    this.date_ = null;
    this.time_.setting_ = null;
    this.time_ = null;
  }
};

TimeHtmlInput.prototype.focus = function() {
  this.date_.focus();
};

/**
 * Sets access right to the HTML element of the setting.
 * @param {AccessManager} access  The access manager of this setting
 * @param {HTMLELement} elem  The HTML element of the setting
 */
TimeHtmlInput.prototype.setAccess = function(readonly) {
  AccessManager.util.setAccessForElem(readonly, this.date_);
  AccessManager.util.setAccessForElem(readonly, this.time_);
};

TimeHtmlInput.prototype.setElemOwner = function() {
  this.date_.setting_ = this;
  this.time_.setting_ = this;
};

TimeHtmlInput.prototype.isElemOwner = function() {
  return this.date_.setting_ == this;
};
