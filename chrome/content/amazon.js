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

function zeropad (s, l) {
  s = s.toString(); // force it to a string
  while (s.length < l) {
    s = '0' + s;
  }
  return s;
}

function toISO8601(myDate) {
  var result = zeropad(myDate.getUTCFullYear (), 4) + "-" +
               zeropad(myDate.getUTCMonth () + 1, 2) + "-" +
               zeropad(myDate.getUTCDate (), 2) + 'T' +
               zeropad(myDate.getUTCHours (), 2) + ':' +
               zeropad(myDate.getUTCMinutes (), 2) + ':' +
               zeropad(myDate.getUTCSeconds (), 2) + 'Z';
  return result;
}

function vgsAmazonLoader() {
  this.ch = Components.classes["@mozilla.org/security/hash;1"]
                      .createInstance(Components.interfaces.nsICryptoHash);
  this.ch.init(this.ch.SHA256);
}

const AWS_KEY = "0ABF9S44F25FA1XJ22G2";
const AWS_SECRET = "oVODGvOV6jNL5OP6maGFkTDO15c+sTvA9kMGjKge";
const AWS_ENDPOINT = "ecs.amazonaws.com";
const AWS_REQUESTURI = "/onca/xml";

vgsAmazonLoader.prototype = {
  BASEURL: "http://ecs.amazonaws.com/onca/xml",
  ASSOCIATEID: "vidgamspy-20",

  _parseResult: function(aXML) {
    var title;
    var cover;
    var manufacturer;
    var platform;
    var releasedate;
    var agerating;
    var listprice;
    var score = null;
    var price = null;
    var lowestprice = null;
    var usedprice = null;
    var url;

    var itemSearchResponse = aXML.getElementsByTagName("ItemSearchResponse")[0];
    var items = itemSearchResponse.getElementsByTagName("Items")[0];
    var item = items.getElementsByTagName("Item")[0];
    if (!item) {
      // No result
      return null;
    }

    var image = item.getElementsByTagName("MediumImage")[0];
    cover = image.getElementsByTagName("URL")[0].firstChild.nodeValue;
    var attributes = item.getElementsByTagName("ItemAttributes")[0];
    title = attributes.getElementsByTagName("Title")[0].firstChild.nodeValue;
    url = item.getElementsByTagName("DetailPageURL")[0].firstChild.nodeValue;
    manufacturer = attributes.getElementsByTagName("Manufacturer")[0].firstChild.nodeValue;
    platform = attributes.getElementsByTagName("Platform")[0].firstChild.nodeValue;
    releasedate = attributes.getElementsByTagName("ReleaseDate")[0].firstChild.nodeValue;
    agerating = attributes.getElementsByTagName("ESRBAgeRating")[0].firstChild.nodeValue;
    var offers = item.getElementsByTagName("Offers")[0];
    var totalOffers = offers.getElementsByTagName("TotalOffers")[0].firstChild.nodeValue;
    if (totalOffers !== "0") {
      var offerListing = offers.getElementsByTagName("Offer")[0]
                               .getElementsByTagName("OfferListing")[0];
      price = offerListing.getElementsByTagName("Price")[0]
                          .getElementsByTagName("Amount")[0].firstChild.nodeValue;
    }
    listprice = attributes.getElementsByTagName("ListPrice")[0]
                          .getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
    var offer = item.getElementsByTagName("OfferSummary")[0];
    if (offer.getElementsByTagName("LowestNewPrice") &&
        offer.getElementsByTagName("LowestNewPrice")[0]) {
      lowestprice = offer.getElementsByTagName("LowestNewPrice")[0]
                   .getElementsByTagName("Amount")[0].firstChild.nodeValue;
    }
    if (offer.getElementsByTagName("LowestUsedPrice") &&
        offer.getElementsByTagName("LowestUsedPrice")[0]) {
      usedprice = offer.getElementsByTagName("LowestUsedPrice")[0]
                       .getElementsByTagName("Amount")[0].firstChild.nodeValue;
    }
    var reviews = item.getElementsByTagName("CustomerReviews")[0];
    if (reviews) {
      score = reviews.getElementsByTagName("AverageRating")[0].firstChild.nodeValue;
    }
    this._priceList = [];
    if (price) {
      this._priceList.push({
        label: "Amazon",
        condition: VGSpyCommon.CONDITION_PREMIUM,
        price: parseInt(price, 10) / 100.0,
        url: url
      });
    }
    if (lowestprice) {
      this._priceList.push({
        label: "Amazon (new)",
        condition: VGSpyCommon.CONDITION_NEW,
        price: parseInt(lowestprice, 10) / 100.0,
        url: url
      });
    }
    if (usedprice) {
      this._priceList.push({
        label: "Amazon (used)",
        condition: VGSpyCommon.CONDITION_USED,
        price: parseInt(usedprice, 10) / 100.0,
        url: url
      });
    }

    return {
      title: title,
      cover: cover,
      manufacturer: manufacturer,
      platform: platform,
      releasedate: releasedate,
      agerating: agerating,
      score: score,
      listprice: listprice,
      url: url
    };
  },

  getBaseInfo: function(aTitle, aListener) {
    var inst = this;
    this._priceList = null;
    var listener = {
      onSuccess: function(aText, aXML) {
        var result = inst._parseResult(aXML);
        aListener.onSuccess("load", result);
      },
      onError: function(aError) {
      }
    }

    var args = {
      AssociateTag: this.ASSOCIATEID,
      Operation: "ItemSearch",
      ResponseGroup: "Large,Images,OfferSummary",
      SearchIndex: "VideoGames",
      Service: "AWSECommerceService",
      Title: encodeURIComponent(aTitle)
    }
    var hloader = new vgsHttpLoader("http://ecs.amazonaws.com/onca/xml");

    hloader.callContent(listener, this._signRequest(args));
  },

  // Some code borrowed from Ubiquity
  _doEscape: function(aString) {
    var charMap = {
      "!": "%21",
      "*": "%2A",
      "'": "%27",
      "(": "%28",
      ")": "%29"
    };
    var result = encodeURIComponent(aString);
    for (var c in charMap)
      result = result.replace(c, charMap[c]);
    return result;
  },

  _signRequest: function(aParams) {
    var key;
    var params = {};
    for (key in aParams)
      params[key] = aParams[key];
    params.Timestamp = toISO8601(new Date());
    params.AWSAccessKeyId = AWS_KEY;
    var paramArray = [];
    for (key in params)
      paramArray.push(this._doEscape(key) + "=" + this._doEscape(params[key]));
    paramArray.sort();
    var paramString = paramArray.join("&");
    var sigBaseString = "GET\n" + AWS_ENDPOINT + "\n" + AWS_REQUESTURI + "\n" + paramString;
    var signature = this._signHMAC("SHA256", AWS_SECRET, sigBaseString);
    return paramString + "&Signature=" + this._doEscape(signature);
  },

  _signHMAC: function (algo, key, str) {
    var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
                    .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
    converter.charset = "UTF-8";
    var data = converter.convertToByteArray(str, {});
    var crypto = Components.classes["@mozilla.org/security/hmac;1"]
                    .createInstance(Components.interfaces.nsICryptoHMAC);
    var keyObject = Components.classes["@mozilla.org/security/keyobjectfactory;1"]
                      .getService(Components.interfaces.nsIKeyObjectFactory)
                      .keyFromString(Components.interfaces.nsIKeyObject.HMAC, key);
    crypto.init(Components.interfaces.nsICryptoHMAC[algo], keyObject);
    crypto.update(data, data.length);
    var hash = crypto.finish(true);
    return hash;
  },

  getPrices: function(aTitle, aListener) {
    aListener.onSuccess("load", this._priceList);
  }

}
