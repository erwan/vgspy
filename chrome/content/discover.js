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
 * Portions of the code from Flock Inc. <contact@flock.com>
 *
 */

var VGSDiscover = {
  init: function() {
    this.button = document.getElementById("vgspy-toolbar-button");
    this.gamesForUrl = {};
    if (gBrowser) {
      gBrowser.addProgressListener(this.progressListener);
      gBrowser.addEventListener("DOMTitleChanged", this.domListener, false);
    }
  },

  uninit: function() {
    if (gBrowser) {
      gBrowser.removeProgressListener(this);
    }
  },

  refreshButton: function() {
    var games = this.gamesForUrl[this.progressListener.currentUrl];
    this.button.setAttribute("discovered", games && games.length > 0);
  },

  // EventListener
  domListener: {
    handleEvent: function(aEvent) {
      var element = aEvent.target;
      var documentUrl = element.URL;
      if (!documentUrl) {
        return;
      }
      // Look for IGN
      if (documentUrl.match(/[wii|ps3|xbox360|ds|psp|ps2]\.ign\.com\/objects/)) {
        re = /IGN:\s([^\(\)]+)/;
        arr = re.exec(element.title);
        if (arr && arr[1]) {
          gameTitle = arr[1];
          VGSDiscover.gamesForUrl[documentUrl] = [gameTitle];
          VGSDiscover.refreshButton();
        }
        return;
      }
      // Look for Metacritic
      if (documentUrl.match(/metacritic\.com\/games\/platforms/)) {
        re = /[^\(]+/;
        arr = re.exec(element.title);
        if (arr && arr[0]) {
          gameTitle = arr[0];
          VGSDiscover.gamesForUrl[documentUrl] = [gameTitle];
          VGSDiscover.refreshButton();
        }
        return;
      }
      // Look for Gamespot
      if (documentUrl.match(/gamespot\.com/)) {
        re = /(.+)\sfor\s(PS2|PS3|WII|Xbox\s360|DS|PSP)/;
        arr = re.exec(element.title);
        if (arr && arr[1]) {
          gameTitle = arr[1];
          VGSDiscover.gamesForUrl[documentUrl] = [gameTitle];
          VGSDiscover.refreshButton();
        }
      }
    }
  },

  // nsIWebProgressListener
  progressListener: {
    lastUrl: null,
    currentUrl: null,

    onStateChange: function(aWebProgress,
                            aRequest,
                            aStateFlags,
                            aStatus) {
    },

    onProgressChange: function(aWebProgress,
                               aRequest,
                               aCurSelfProgress,
                               aMaxSelfProgress,
                               aCurTotalProgress,
                               aMaxTotalProgress) {
    },

    onLocationChange: function(aWebProgress,
                               aRequest,
                               aLocation) {
      var url = null;
      if (aLocation) {
        // strip anchors
        url = aLocation.spec.replace(/#.*/, "");
      }
      if (this.lastUrl != url) {
        this._newLocation(url);
        this.lastUrl = url;
      }
    },

    onStatusChange: function(aWebProgress,
                             aRequest,
                             aStatus,
                             aMessage) {
    },

    onSecurityChange: function(aWebProgress,
                               aRequest,
                               aState) {
    },

    _newLocation: function(aUrl) {
      this.currentUrl = aUrl;
      VGSDiscover.refreshButton();
    }

  }

};
