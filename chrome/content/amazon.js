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

function vgsAmazonLoader() {
}

vgsAmazonLoader.prototype = {
  BASEURL: "http://ecs.amazonaws.com/onca/xml",
  ACCESSID: "0ABF9S44F25FA1XJ22G2",

  _parseResult: function(aXML) {
    var title;
    var cover;
    var manufacturer;
    var platform;
    var agerating;
    var score = null;
    var price = null;
    var lowestprice = null;
    var usedprice = null;
    var url;

    var itemSearchResponse = aXML.getElementsByTagName("ItemSearchResponse")[0];
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
                      .getElementsByTagName("Amount")[0].firstChild.nodeValue;
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
    return {
      title: title,
      cover: cover,
      manufacturer: manufacturer,
      platform: platform,
      agerating: agerating,
      score: score,
      price: parseInt(price, 10) / 100.0,
      lowestprice: parseInt(lowestprice, 10) / 100.0,
      usedprice: parseInt(usedprice, 10) / 100.0,
      url: url
    };
  },

  query: function(aTitle, aListener) {
    var inst = this;
    var listener = {
      onSuccess: function(aText, aXML) {
        var result = inst._parseResult(aXML);
        aListener.onSuccess("load", result);
      },
      onError: function(aError) {
      }
    }

    var args = {
      Service: "AWSECommerceService",
      AWSAccessKeyId: this.ACCESSID,
      Operation: "ItemSearch",
      SearchIndex: "VideoGames",
      ResponseGroup: "Large,Images,OfferSummary",
      Title: encodeURIComponent(aTitle)
    }
    var hloader = new vgsHttpLoader("http://ecs.amazonaws.com/onca/xml");
    hloader.call(listener, args);
  }
}