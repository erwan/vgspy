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

function vgsAmazonLoader(aListener) {
  this.listener = aListener;
}

vgsAmazonLoader.prototype = {
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
    var title;
    var cover;
    var manufacturer;
    var platform;
    var agerating;
    var price = null;
    var lowestprice = null;
    var usedprice = null;
    var url;

    var xml = this.httpReq.responseXML;
    var itemSearchResponse = xml.getElementsByTagName("ItemSearchResponse")[0];
    var items = itemSearchResponse.getElementsByTagName("Items")[0];
    var item = items.getElementsByTagName("Item")[0];
    var image = item.getElementsByTagName("MediumImage")[0];
    cover = image.getElementsByTagName("URL")[0].firstChild.nodeValue;
    var attributes = item.getElementsByTagName("ItemAttributes")[0];
    title = attributes.getElementsByTagName("Title")[0].firstChild.nodeValue;
    url = item.getElementsByTagName("DetailPageURL")[0].firstChild.nodeValue;
    manufacturer = attributes.getElementsByTagName("Manufacturer")[0].firstChild.nodeValue;
    platform = attributes.getElementsByTagName("Platform")[0].firstChild.nodeValue;
    agerating = attributes.getElementsByTagName("ESRBAgeRating")[0].firstChild.nodeValue;
    price = attributes.getElementsByTagName("ListPrice")[0]
                      .getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
    var offer = item.getElementsByTagName("OfferSummary")[0];
    if (offer.getElementsByTagName("LowestNewPrice") &&
        offer.getElementsByTagName("LowestNewPrice")[0]) {
      lowestprice = offer.getElementsByTagName("LowestNewPrice")[0]
                   .getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
    }
    if (offer.getElementsByTagName("LowestUsedPrice") &&
        offer.getElementsByTagName("LowestUsedPrice")[0]) {
      usedprice = offer.getElementsByTagName("LowestUsedPrice")[0]
                       .getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
    }

    this.currentItem = {
      title: title,
      cover: cover,
      manufacturer: manufacturer,
      platform: platform,
      agerating: agerating,
      price: price,
      lowestprice: lowestprice,
      usedprice: usedprice,
      url: url
    };
    this.listener.onSuccess("load", this.currentItem);
    this.httpReq = null;
  },

  httpGetResult: function(aResultCode) {
    this.loading = false;
    this.listener.onError("error", aResultCode);
    // clean up
    this.httpReq = null;
  },

  _makeURL: function(aTitle) {
    var base = "http://ecs.amazonaws.com/onca/xml"
    var args = {
      Service: "AWSECommerceService",
      AWSAccessKeyId: this.ACCESSID,
      Operation: "ItemSearch",
      SearchIndex: "VideoGames",
      ResponseGroup: "Large,Images,OfferSummary",
      Title: encodeURIComponent(aTitle)
    }

    var result = base;
    for (let key in args) {
      result += (result == base) ? "?" : "&";
      result += (key + "=" + args[key]);
    }

    return result;
  },

  query: function(aTitle) {
    this.httpReq = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                   .createInstance(Components.interfaces.nsIXMLHttpRequest);
    this.httpReq.mozBackgroundRequest = true;
    this.httpReq.open("GET", this._makeURL(aTitle));

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