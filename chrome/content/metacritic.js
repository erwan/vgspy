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

function vgsMetacriticLoader() {
}

vgsMetacriticLoader.prototype = {
  ACCESSID: "0ABF9S44F25FA1XJ22G2",

  _parseResult: function(aText) {
    var score = "XX";
    var re = /\/_images\/scores\/games\/([0-9]+)\.gif/;
    var arr = re.exec(aText);
    if (arr && arr[1]) {
      score = arr[1];
    }

    return {
      score: score,
      url: this.url
    };
  },

  _makeURL: function(aTitle, aPlatform) {
    var base = "http://www.metacritic.com/games/platforms/";
    var flatTitle = aTitle.toLowerCase().replace(/[^a-z]/g, "");
    var platform = this._getPlatform(aPlatform);

    this.url = base + platform + "/" + flatTitle
    return this.url;
  },

  query: function(aTitle, aPlatform, aListener) {
    var inst = this;
    var listener = {
      onSuccess: function(aText, aXML) {
        var result = inst._parseResult(aText);
        aListener.onSuccess("load", result);
      },
      onError: function(aError) {
      }
    }

    var url = this._makeURL(aTitle, aPlatform)
    var hloader = new vgsHttpLoader(url);
    hloader.call(listener);
  },

  _getPlatform: function(aAmzPlatform) {
    var platform = "";
    if (aAmzPlatform.match(/Wii/)) {
      platform = "wii";
    } else if (aAmzPlatform.match(/GameCube/)) {
      platform = "gamecube";
    } else if (aAmzPlatform.match(/PlayStation2/)) {
      platform = "ps2";
    } else if (aAmzPlatform.match(/PLAYSTATION/)) {
      platform = "ps3";
    } else {
      platform = "xbox360";
    }
    return platform;
  },

  getClassForScore: function(aScore) {
    if (aScore > 74) {
      return "highscore";
    }
    if (aScore > 49) {
      return "mediumscore";
    }
    return "lowscore";
  }

}