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

function vgsMetacriticLoader(aListener) {
  this.listener = aListener;
}

vgsMetacriticLoader.prototype = {
  ACCESSID: "0ABF9S44F25FA1XJ22G2",

  RESULT_OK: 0,
  RESULT_PARSE_ERROR: 1,
  RESULT_NOT_RSS: 2,
  RESULT_NOT_FOUND: 3,
  RESULT_NOT_AVAILABLE: 4,
  RESULT_ERROR_FAILURE: 5,

  abort: function() {
    if (this.loading) {
      if (this.httpReq) {
        this.httpReq.abort();
      }
      this.httpReq = null;
      this.loading = false;
      this._callListeners("abort", this.uri);
    }
  },

  onHttpError: function(e) {
    this.httpGetResult(this.RESULT_NOT_AVAILABLE);
  },

  onHttpReadyStateChange: function(e) {
    if (this.httpReq.readyState == 2)
    {
      try
      {
        if (this.httpReq.status == 404)
        {
          this.httpGetResult(this.RESULT_NOT_FOUND);
        }
      }
      catch (e)
      {
        this.httpGetResult(this.RESULT_NOT_AVAILABLE);
        return;
      }
    }
  },

  onHttpLoaded: function(e) {
    var text = this.httpReq.responseText;
    // dump("========== " + text + "\n");

    var score = "XX";
    var re = /\/_images\/scores\/games\/([0-9]+)\.gif/;
    var arr = re.exec(text);
    if (arr && arr[1]) {
      score = arr[1];
    }

    this.listener.onSuccess("load", {
      score: score,
      url: this.url
    });
    this.httpReq = null;
  },

  httpGetResult: function(aResultCode) {
    this.loading = false;
    this.listener.onError("error", aResultCode);
    // clean up
    this.httpReq = null;
  },

  _makeURL: function(aTitle, aPlatform) {
    var base = "http://www.metacritic.com/games/platforms/";
    var flatTitle = aTitle.toLowerCase().replace(/[^a-z]/g, "");

    this.url = base + aPlatform + "/" + flatTitle
    return this.url;
  },

  query: function(aTitle, aPlatform) {
    this.httpReq = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                   .createInstance(Components.interfaces.nsIXMLHttpRequest);
    this.httpReq.mozBackgroundRequest = true;
    this.httpReq.open("GET", this._makeURL(aTitle, aPlatform));

    var oThis = this;
    this.httpReq.onload = function (e) { return oThis.onHttpLoaded(e); };
    this.httpReq.onerror = function (e) { return oThis.onHttpError(e); };
    this.httpReq.onreadystatechange = function (e) { return oThis.onHttpReadyStateChange(e); };

    try {
      this.httpReq.send(null);
    } catch (ex) {
    }
  }
}