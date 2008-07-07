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
    this.deck = document.getElementById("vgspyDeck");

    this.cover = document.getElementById("vgspyPanelCover");
    this.title = document.getElementById("vgspyPanelTitle");
    this.subtitle = document.getElementById("vgspyPanelSubtitle");
    this.platform = document.getElementById("vgspyPlatform");
    this.agerating = document.getElementById("vgspyRating");
    this.pricesBox = document.getElementById("vgspyPrices");
    this.scoresBox = document.getElementById("vgspyScores");
  },

  _clear: function() {
    while (this.pricesBox.firstChild) {
      this.pricesBox.removeChild(this.pricesBox.firstChild);
    }
    while (this.scoresBox.firstChild) {
      this.scoresBox.removeChild(this.scoresBox.firstChild);
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
    var priceLabel = document.createElement("label");
    priceLabel.setAttribute("value", aLabel);
    priceLabel.setAttribute("class", "priceLink");
    var space = document.createElement("spacer");
    space.setAttribute("flex", "1");
    var priceValue = document.createElement("label");
    priceValue.setAttribute("value", aPrice);

    price.appendChild(priceLabel);
    price.appendChild(space);
    price.appendChild(priceValue);

    this.pricesBox.appendChild(price);
  },

  _addScore: function(aLabel, aScoreElt, aURL) {
    var score = document.createElement("hbox");
    
    var scoreLabel = document.createElement("label");
    // scoreLabel.setAttribute("value", aLabel + ": " + aScore);
    scoreLabel.setAttribute("value", aLabel + ": ");
    var space = document.createElement("spacer");
    space.setAttribute("flex", "1");
    var scoreLink = document.createElement("label");
    scoreLink.setAttribute("value", "Details...");
    scoreLink.setAttribute("class", "priceLink");
    var inst = this;
    scoreLink.onclick = function(event) {
      inst._openLink(aURL, "tab");
    }

    score.appendChild(scoreLabel);
    score.appendChild(aScoreElt);
    score.appendChild(space);
    score.appendChild(scoreLink);

    this.scoresBox.appendChild(score);
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
    this._clear();
    var query = this.searchBox.value;

    var inst = this;
    var amzlistener = {
      onSuccess: function(aSubject, aResult) {
        inst.deck.selectedIndex = 1;
        function setValue(aDOMElt, aValue) {
          aDOMElt.setAttribute("value", aValue);
          aDOMElt.setAttribute("tooltiptext", aValue);
        }
        inst.cover.setAttribute("src", aResult.cover);
        setValue(inst.title, aResult.title);
        setValue(inst.subtitle, aResult.manufacturer);
        setValue(inst.platform, aResult.platform);
        setValue(inst.agerating, "ESRB: " + aResult.agerating);

        if (aResult.score !== null) {
          var domscore = document.createElement("label");
          domscore.setAttribute("value", aResult.score.replace(".0", "") + "/5");
          inst._addScore("Amazon",
                         domscore,
                         aResult.url);
        }

        if (aResult.price !== null) {
          inst._addPrice("Amazon", aResult.price, aResult.url);
        }
        if (aResult.price !== null) {
          inst._addPrice("Amazon (lowest new)", aResult.lowestprice, aResult.url);
        }
        if (aResult.usedprice !== null) {
          inst._addPrice("Amazon (used)", aResult.usedprice, aResult.url);
        }
        var mcloader;
        var mclistener = {
          onSuccess: function(aSubject, aResult) {
            var mcdomscore = document.createElement("label");
            mcdomscore.setAttribute("value", aResult.score);
            mcdomscore.setAttribute("class",
                                    mcloader.getClassForScore(aResult.score));
            inst._addScore("Metacritic",
                           mcdomscore,
                           aResult.url);
          },
          onError: function(aSubject, aCode) {
          }
        }
        mcloader = new vgsMetacriticLoader();
        mcloader.query(aResult.title, aResult.platform, mclistener);
      },
      onError: function(aSubject, aCode) {
      }
    };

    var ebaylistener = {
      onSuccess: function(aSubject, aResult) {
        var product = aResult.Products.Product[0];
        var url = product.DetailsURL;
        var price = product.MinPrice.Value;
        inst._addPrice("Half.com", "$" + price.toFixed(2), url);
      },
      onError: function(aSubject, aCode) {
      }
    };

    var loader = new vgsAmazonLoader();
    //var ebloader = new vgsEbayLoader();
    loader.query(aValue, amzlistener);
    //ebloader.query(aValue, ebaylistener);
  }
};
