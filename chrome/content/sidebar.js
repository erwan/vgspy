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
  CONDITION_PREMIUM: 1,
  CONDITION_NEW: 2,
  CONDITION_USED: 3,

  DECK_DEFAULT: 0,
  DECK_RESULT: 1,
  DECK_NORESULT: 2,
  DECK_LOADING: 3,

  load: function() {
    this.initialized = true;

    this.searchBox = document.getElementById("searchBox");
    this.deck = document.getElementById("vgspyDeck");

    this.cover = document.getElementById("vgspyPanelCover");
    this.title = document.getElementById("vgspyPanelTitle");
    this.subtitle = document.getElementById("vgspyPanelSubtitle");
    this.platform = document.getElementById("vgspyPlatform");
    this.releasedate = document.getElementById("vgspyDate");
    this.agerating = document.getElementById("vgspyRating");
    this.pricesBox = document.getElementById("vgspyPricesPremium");
    this.pricesBoxNew = document.getElementById("vgspyPricesNew");
    this.pricesBoxUsed = document.getElementById("vgspyPricesUsed");
    this.scoresBox = document.getElementById("vgspyScores");

    // Is there a default game to load?
    var win = _wm.getMostRecentWindow("navigator:browser");
    var games = win.VGSDiscover.gamesForUrl[win.VGSDiscover.progressListener.currentUrl];
    if (games && games[0]) {
      this.searchFor(games[0]);
    }
  },

  _clear: function() {
    while (this.pricesBox.firstChild) {
      this.pricesBox.removeChild(this.pricesBox.firstChild);
    }
    while (this.pricesBoxNew.firstChild) {
      this.pricesBoxNew.removeChild(this.pricesBoxNew.firstChild);
    }
    while (this.pricesBoxUsed.firstChild) {
      this.pricesBoxUsed.removeChild(this.pricesBoxUsed.firstChild);
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

  _addPrice: function(aLabel,
                      aPrice,
                      aURL,
                      aCondition) {
    var box;
    switch (aCondition) {
      case this.CONDITION_NEW:
        box = this.pricesBoxNew;
        break;
      case this.CONDITION_PREMIUM:
        box = this.pricesBox;
        break;
      case this.CONDITION_USED:
        box = this.pricesBoxUsed;
    }

    box.addPrice(aLabel, aPrice, aURL);
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
    this.deck.selectedIndex = this.DECK_LOADING;
    var query = this.searchBox.value;

    var inst = this;
    var amzlistener = {
      onSuccess: function(aSubject, aResult) {
        if (aResult === null) {
          inst.deck.selectedIndex = inst.DECK_NORESULT;
          return;
        }
        inst.deck.selectedIndex = inst.DECK_RESULT;
        function setValue(aDOMElt, aValue) {
          aDOMElt.setAttribute("value", aValue);
          aDOMElt.setAttribute("tooltiptext", aValue);
        }
        inst.cover.setAttribute("src", aResult.cover);
        setValue(inst.title, aResult.title);
        setValue(inst.subtitle, aResult.manufacturer);
        setValue(inst.platform, aResult.platform);
        setValue(inst.releasedate, "Released: " + aResult.releasedate);
        setValue(inst.agerating, "ESRB: " + aResult.agerating);

        if (aResult.score !== null) {
          var domscore = document.createElement("label");
          domscore.setAttribute("value", aResult.score.replace(".0", "") + "/5");
          inst._addScore("Amazon",
                         domscore,
                         aResult.url);
        }

        if (aResult.price !== null) {
          inst._addPrice("Amazon", aResult.price, aResult.url, inst.CONDITION_PREMIUM);
        }
        if (aResult.lowestprice !== null) {
          inst._addPrice("Amazon", aResult.lowestprice, aResult.url, inst.CONDITION_NEW);
        }
        if (aResult.usedprice !== null) {
          inst._addPrice("Amazon", aResult.usedprice, aResult.url, inst.CONDITION_USED);
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
        if (!aResult) {
          return;
        }
        var items = aResult;
        for (var i in items) {
          var item = items[i];
          var price = item.CurrentPrice.Value;
          var url = item.ViewItemURLForNaturalSearch;
          var condition = (item.HalfItemCondition == "BrandNew")
                        ? inst.CONDITION_NEW
                        : inst.CONDITION_USED;
          inst._addPrice("Half.com", price, url, condition);
        }
      },
      onError: function(aSubject, aCode) {
      }
    };

    var youtubelistener = {
      onSuccess: function(aSubject, aResult) {
        document.getElementById("player").videos = aResult;
      },
      onError: function(aSubject, aCode) {
      }
    };

    var loader = new vgsAmazonLoader();
    var ebloader = new vgsEbayLoader();
    var ytloader = new vgsYoutubeLoader();
    loader.query(aValue, amzlistener);
    ebloader.queryHalf(aValue, ebaylistener);
    ytloader.query(aValue, youtubelistener);
  }
};
