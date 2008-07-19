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

var parseJSON;

if (Components.classes["@mozilla.org/dom/json;1"]) {
  // FF3
  var JSON = Components.classes["@mozilla.org/dom/json;1"]
                .createInstance(Components.interfaces.nsIJSON);
  parseJSON = function(aText) {
    return JSON.decode(aText);
  };
} else {
  // FF2
  var sandbox = new Components.utils.Sandbox("about:blank");
  parseJSON = function(aText) {
    return Components.utils.evalInSandbox("(" + aText + ")", sandbox);
  }
}

function vgsEbayLoader() {
}

vgsEbayLoader.prototype = {
  APPID: "ErwanLoi-fc39-49aa-88c4-fabb44de2b08",
  CAMPID: "5336003373",
  CUSTOMID: "1",

  onHttpLoaded: function(e, aProcessor) {
    var json = this.httpReq.responseText;
    dump("================ "+json+"\n");
    var result = parseJSON(json);
    aProcessor(result);

    this.httpReq = null;
  },

  _addBaseArgs: function(aArgs) {
    var args = aArgs;
    args.appid = this.APPID;
    args.version = 527;
    args.campid = this.CAMPID;
    args.customid = this.CUSTOMID;
    args.responseencoding = "JSON";

    return args;
  },

  // Dedup
  _sortItemResults: function(aText) {
    var json = parseJSON(aText);
    items = json.Products.Product[0].ItemArray.Item;
    // Sort
    var sorted = items.sort(function(a, b) {
      return a.CurrentPrice.Value > b.CurrentPrice.Value;
    });

    var result = [];
    for each (item in sorted) {
      var already = false;
      for each (item2 in result) {
        if (item.ItemID == item2.itemid) {
          already = true;
          break;
        }
      }
      if (!already) {
        result.push({
          itemid: item.ItemID,
          label: "Half.com",
          condition: item.HalfItemCondition == "BrandNew"
                    ? VGSpyCommon.CONDITION_NEW
                    : VGSpyCommon.CONDITION_USED,
          price: item.CurrentPrice.Value,
          url: item.ViewItemURLForNaturalSearch
        });
      }
    }
    return result;
  },

  getPrices: function(aTitle, aListener) {
    var inst = this;
    var args = {
      callname: "FindHalfProducts",
      DomainName: "Video Games",
      IncludeSelector: "Items",
      QueryKeywords: encodeURIComponent(aTitle)
    }
    var args = this._addBaseArgs(args);
    var listener = {
      onSuccess: function(aText, aXML) {
        var json = parseJSON(aText);
        if (json.Ack != "Success") {
          aListener.onSuccess("load", null);
          return;
        }
        var productId = json.Products.Product[0].ProductID[0];
        var args2 = {
          callname: "FindHalfProducts",
          DomainName: "Video Games",
          IncludeSelector: "Items"
        };
        var args2 = inst._addBaseArgs(args2);
        var listener2 = {
          onSuccess: function(aText, aXML) {
            var sortedItems = inst._sortItemResults(aText);
            aListener.onSuccess("load", sortedItems);
          },
          onError: function(aError) {
          }
        }
        args2["ProductID.type"] = productId.Type;
        args2["ProductID.Value"] = productId.Value;
        var hloader = new vgsHttpLoader("http://open.api.ebay.com/shopping");
        hloader.call(listener2, args2);
      },
      onError: function(aError) {
      }
    };
    var hloader = new vgsHttpLoader("http://open.api.ebay.com/shopping");
    hloader.call(listener, args);
  }

}
