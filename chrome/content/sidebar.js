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
 */

const CC = Components.classes;
const CI = Components.interfaces;

var _wm = CC["@mozilla.org/appshell/window-mediator;1"]
          .getService(CI.nsIWindowMediator);


var VGSSidebar = {
  load: function() {
    this.initialized = true;

    this.searchBox = document.getElementById("searchBox");

    this.cover = document.getElementById("vgspyPanelCover");
    this.title = document.getElementById("vgspyPanelTitle");
    this.subtitle = document.getElementById("vgspyPanelSubtitle");
    this.platform = document.getElementById("vgspyPlatform");
    this.agerating = document.getElementById("vgspyRating");
    this.pricesBox = document.getElementById("vgspyPrices");
  },

  _clearPrices: function() {
    while (this.pricesBox.firstChild) {
      this.pricesBox.removeChild(this.pricesBox.firstChild);
    }
  },

  _openLink: function(aURL, aWhere) {
    var win = _wm.getMostRecentWindow("navigator:browser");
    if (win) {
      win.openUILinkIn(aURL, aWhere);
    }
  },

  _addPrice: function(aLabel, aPrice, aURL) {
    var price = document.createElement("hbox");
    var inst = this;
    price.onclick = function(event) {
      inst._openLink(aURL, "tab");
    }
    var priceLabel = document.createElement("description");
    priceLabel.setAttribute("value", aLabel);
    priceLabel.setAttribute("class", "priceLink");
    var space = document.createElement("spacer");
    space.setAttribute("flex", "1");
    var priceValue = document.createElement("description");
    priceValue.setAttribute("value", aPrice);

    price.appendChild(priceLabel);
    price.appendChild(space);
    price.appendChild(priceValue);

    this.pricesBox.appendChild(price);
  },

  keypress: function(aEvent) {
    switch (aEvent.keyCode) {
      case KeyEvent.DOM_VK_RETURN:
        this.search(aEvent);
        break;
    }
  },

  search: function(aEvent) {
    this.searchFor(this.searchBox.value);
  },

  searchFor: function(aValue) {
    this._clearPrices();
    var query = this.searchBox.value;

    var inst = this;
    var listener = {
      onSuccess: function(aSubject, aResult) {
        function setValue(aDOMElt, aValue) {
          aDOMElt.setAttribute("value", aValue);
          aDOMElt.setAttribute("tooltiptext", aValue);
        }
        inst.cover.setAttribute("src", aResult.cover);
        setValue(inst.title, aResult.title);
        setValue(inst.subtitle, aResult.manufacturer);
        setValue(inst.platform, aResult.platform);
        setValue(inst.agerating, "ESRB: " + aResult.agerating);
        if (aResult.price !== null) {
          inst._addPrice("Amazon", aResult.price, aResult.url);
        }
        if (aResult.price !== null) {
          inst._addPrice("Amazon (lowest new)", aResult.lowestprice, aResult.url);
        }
        if (aResult.usedprice !== null) {
          inst._addPrice("Amazon (used)", aResult.usedprice, aResult.url);
        }
      },
      onError: function(aSubject, aCode) {
      }
    }

    var loader = new vgsAmazonLoader(listener);
    loader.query(aValue);
  }
};
