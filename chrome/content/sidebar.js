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

var _wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
          .getService(Components.interfaces.nsIWindowMediator);

var sidebarController;

function SidebarController() {
  this.pricesBox = document.getElementById("vgspyPricesPremium");
  this.pricesBoxNew = document.getElementById("vgspyPricesNew");
  this.pricesBoxUsed = document.getElementById("vgspyPricesUsed");
  this.scoresBox = document.getElementById("vgspyScores");
}

SidebarController.prototype = {
  clear: function() {
    this.pricesBox.clear();
    this.pricesBoxNew.clear();
    this.pricesBoxUsed.clear();

    while (this.scoresBox.firstChild) {
      this.scoresBox.removeChild(this.scoresBox.firstChild);
    }
  },

  addScore: function(aLabel, aScoreElt, aURL) {
    var score = document.createElement("hbox");

    var scoreLabel = document.createElement("label");
    scoreLabel.setAttribute("value", aLabel + ": ");
    var space = document.createElement("spacer");
    space.setAttribute("flex", "1");
    var scoreLink = document.createElement("label");
    scoreLink.setAttribute("value", "Details...");
    scoreLink.setAttribute("class", "priceLink");
    scoreLink.onclick = function(event) {
      VGSSidebar._openLink(aURL, "tab");
    };

    score.appendChild(scoreLabel);
    score.appendChild(aScoreElt);
    score.appendChild(space);
    score.appendChild(scoreLink);

    this.scoresBox.appendChild(score);
  },

  addPrice: function(aItem) {
    var box;
    switch (aItem.condition) {
      case VGSpyCommon.CONDITION_NEW:
        box = this.pricesBoxNew;
        break;
      case VGSpyCommon.CONDITION_PREMIUM:
        box = this.pricesBox;
        break;
      case VGSpyCommon.CONDITION_USED:
        box = this.pricesBoxUsed;
    }

    box.addPrice(aItem.label, aItem.price, aItem.url + "");
  }
};

var VGSSidebar = {
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

    sidebarController = new SidebarController();
    this._refreshBoxes();

    // Is there a default game to load?
    var win = _wm.getMostRecentWindow("navigator:browser");
    var games = win.VGSDiscover.gamesForUrl[win.VGSDiscover.progressListener.currentUrl];
    if (games && games[0]) {
      this.searchFor(games[0]);
    }
  },

  _refreshBoxes: function() {
    for (var i = 0; i < BOXES.length; i++) {
      var box = BOXES[i];
      $(box).setAttribute("hidden", !VGSpyCommon.getBoolPref(box));
    }
  },

  _openLink: function(aURL, aWhere) {
    var win = _wm.getMostRecentWindow("navigator:browser");
    if (win) {
      win.openUILinkIn(aURL, aWhere);
    }
  },

  keypress: function(aEvent) {
    if (aEvent.keyCode == KeyEvent.DOM_VK_RETURN) {
      this.search(aEvent);
    }
  },

  getPrices: function(aTitle) {
    var pricelistener = function () {};
    pricelistener.prototype = {
      onSuccess: function(aSubject, aResult) {
        if (!aResult) {
          return;
        }
        var items = aResult;
        for (var i in items) {
          sidebarController.addPrice(items[i]);
        }
      },
      onError: function(aSubject, aCode) {
      }
    };

    var ebloader = new vgsEbayLoader();
    ebloader.getPrices(aTitle, new pricelistener());
    this._amzloader.getPrices(aTitle, new pricelistener());
  },

  search: function(aEvent) {
    this.searchFor(this.searchBox.value);
  },

  searchFor: function(aValue) {
    sidebarController.clear();
    this.deck.selectedIndex = this.DECK_LOADING;

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
          sidebarController.addScore("Amazon", domscore, aResult.url);
        }

        inst.getPrices(aResult.title);

        var mcloader;
        var mclistener = {
          onSuccess: function(aSubject, aResult) {
            var mcdomscore = document.createElement("label");
            mcdomscore.setAttribute("value", aResult.score);
            mcdomscore.setAttribute("class",
                                    mcloader.getClassForScore(aResult.score));
            sidebarController.addScore("Metacritic", mcdomscore, aResult.url);
          },
          onError: function(aSubject, aCode) {
          }
        };
        mcloader = new vgsMetacriticLoader();
        mcloader.query(aResult.title, aResult.platform, mclistener);

        var youtubelistener = {
          onSuccess: function(aSubject, aResult) {
            document.getElementById("player").videos = aResult;
          },
          onError: function(aSubject, aCode) {
          }
        };

        var ytloader = new vgsYoutubeLoader();
        ytloader.query(aResult.title, youtubelistener);
      },
      onError: function(aSubject, aCode) {
      }
    };

    this._amzloader = new vgsAmazonLoader();
    this._amzloader.getBaseInfo(aValue, amzlistener);
  }
};
