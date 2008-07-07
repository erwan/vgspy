/*
 * Copyright 2008 Erwan Loisant
 *
 * This file may be used under the terms of of the
 * GNU General Public License Version 2 or later (the "GPL"),
 * http://www.gnu.org/licenses/gpl.html
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * Portion of this code from The Sage Project http://sage.mozdev.org
 *
 */

function vgsHttpLoader(aBaseURL) {
  this._baseURL = aBaseURL;
}

vgsHttpLoader.prototype = {
  RESULT_OK: 0,
  RESULT_PARSE_ERROR: 1,
  RESULT_NOT_RSS: 2,
  RESULT_NOT_FOUND: 3,
  RESULT_NOT_AVAILABLE: 4,
  RESULT_ERROR_FAILURE: 5,

  _convertArgs: function(aArgs) {
    var result = "";
    for (let key in aArgs) {
      if (result.length > 0) {
        result += "&";
      }
      result += (key + "=" + encodeURIComponent(aArgs[key]));
    }
    return result;
  },

  call: function(aListener,
                 aArgs,
                 aMethod)
  {
    var inst = this;
    var method = aMethod ? aMethod : "GET";
    this._req = Components.classes['@mozilla.org/xmlextras/xmlhttprequest;1']
                .createInstance(Components.interfaces.nsIXMLHttpRequest);
    this._req.onreadystatechange = function (aEvt) {
      if (inst._req.readyState == 4) {
        var status = inst._req.status;
        if (status / 100 == 2) {
          aListener.onSuccess(inst._req.responseText, inst._req.responseXML);
          inst._req = null;
        } else {
          dump(inst._req.responseText);
          inst._req = null;
        }
      }
    };
    var url = this._baseURL + (aArgs ? ("?" + this._convertArgs(aArgs)) : "");
    this._req.open(method, url, true);
    this._req.send(null);
  }
}
