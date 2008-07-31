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
      Service: "AWSECommerceService",
      AWSAccessKeyId: this.ACCESSID,
      AssociateTag: this.ASSOCIATEID,
      Operation: "ItemSearch",
      SearchIndex: "VideoGames",
      ResponseGroup: "Large,Images,OfferSummary",
      Title: encodeURIComponent(aTitle)
    }
    var hloader = new vgsHttpLoader("http://ecs.amazonaws.com/onca/xml");
    hloader.call(listener, args);
  },

  getPrices: function(aTitle, aListener) {
    aListener.onSuccess("load", this._priceList);
  }

}
