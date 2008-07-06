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

Components.utils.import("resource://gre/modules/JSON.jsm");

function vgsEbayLoader() {
}

vgsEbayLoader.prototype = {
  APPID: "ErwanLoi-fc39-49aa-88c4-fabb44de2b08",
  CAMPID: "5336003373",
  CUSTOMID: "1",

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

  onHttpLoaded: function(e, aProcessor) {
    var json = this.httpReq.responseText;
    dump("================ "+json+"\n");
    var result = JSON.fromString(json);
    aProcessor(result);

    this.httpReq = null;
  },

  httpGetResult: function(aResultCode) {
    this.loading = false;
    this.listener.onError("error", aResultCode);
    // clean up
    this.httpReq = null;
  },

  _makeURL: function(aArgs) {
    var base = "http://open.api.ebay.com/shopping";
    var args = aArgs;
    args.appid = this.APPID;
    args.version = 527;
    args.campid = this.CAMPID;
    args.customid = this.CUSTOMID;
    args.responseencoding = "JSON";

    var result = base;
    for (let key in args) {
      result += (result == base) ? "?" : "&";
      result += (key + "=" + args[key]);
    }

    return result;
  },

  query: function(aTitle, aListener) {
    var args = {
      callname: "FindHalfProducts",
      DomainName: "Video Games",
      IncludeSelector: "Items",
      QueryKeywords: encodeURIComponent(aTitle)
    }
    var inst = this;
    var processor = function(aData) {
      aListener.onSuccess("load", aData);
/*      var productId = aData.Products.Product[0].ProductID[0];
      var args = {
        callname: "FindHalfProducts",
        DomainName: "Video Games",
        IncludeSelector: "Items"
      };
      args["ProductID.type"] = productId.Type;
      args["ProductID.Value"] = productId.Value;
      var process2 = function(aData2) {
        aListener.onSuccess("load", aData2);
      }
      inst.call(args, process2);*/
    };
    this.call(args, processor);
  },

  call: function(aArgs, aProcessor) {
    this.httpReq = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                   .createInstance(Components.interfaces.nsIXMLHttpRequest);
    this.httpReq.mozBackgroundRequest = true;
    this.httpReq.open("GET", this._makeURL(aArgs));

    var oThis = this;
    this.httpReq.onload = function (e) {
      return oThis.onHttpLoaded(e, aProcessor);
    };
    this.httpReq.onerror = function (e) {
      return oThis.onHttpError(e);
    };
    this.httpReq.onreadystatechange = function (e) { return oThis.onHttpReadyStateChange(e); };

    try {
      this.httpReq.send(null);
    } catch (ex) {
    }
  }

}
