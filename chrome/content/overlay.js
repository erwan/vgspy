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

var vgspy = {
  load: function() {
    // DOM Stuff
    this.strings = document.getElementById("vgspy-strings");
    this.sbBroadcaster = document.getElementById("viewVgspySidebar");

    this.cover = document.getElementById("vgspyPanelCover");
    this.title = document.getElementById("vgspyPanelTitle");
    this.subtitle = document.getElementById("vgspyPanelSubtitle");
    this.pricesBox = document.getElementById("vgspyPrices");

    this.installInToolbar();

    var inst = this;
    var contextListener = function() {
      var selection = inst._getSelection();
      if (selection && selection != "") {
        document.getElementById("vgspyContextSearch")
                .setAttribute("label", 'Search VGSpy for "' + selection + '"');
        document.getElementById("vgspyContextSearch").setAttribute("hidden", "false");
      } else {
        document.getElementById("vgspyContextSearch").setAttribute("hidden", "true");
      }
    }
    document.getElementById("contentAreaContextMenu")
            .addEventListener("popupshowing",
                              contextListener,
                              false);

    // Discovery (find video games on web pages)
    VGSDiscover.init();
  },

  // If open: close it
  // If closed *and* there is a game on the current page, open it and query for that game
  // If closed but no game, just open it
  toggleSidebar: function() {
    toggleSidebar('viewVgspySidebar');
  },

  unload: function() {
    VGSDiscover.uninit();
  },

  _getSelection: function() {
    return top.document
              .getElementById("content")
              .mCurrentBrowser
              .contentWindow
              .getSelection() + "";
  },

  searchSelection: function(aEvent) {
    this.loadQuery(this._getSelection());
  },

  loadQuery: function(aQuery) {
    toggleSidebar("viewVgspySidebar", true);

    // Give time for the sidebar to load
    var callback= {};
    callback.notify = function () {
      var sidebarWindow = document.getElementById("sidebar").contentWindow;
      sidebarWindow.VGSSidebar.searchFor(aQuery);
    }

    var timer = Cc["@mozilla.org/timer;1"]
                .createInstance(Ci.nsITimer);
    timer.initWithCallback(callback, 300,
                           Ci.nsITimer.TYPE_ONE_SHOT);
  },

  installInToolbar: function() {
    var vgspyid = "vgspy-toolbar-button";
    var prefs = Cc["@mozilla.org/preferences-service;1"]
                .getService(Ci.nsIPrefService).getBranch("extensions.vgspy.");
    if (prefs.getPrefType("setup") || document.getElementById(vgspyid)) {
      return; // already installed
    }

    var before = document.getElementById("urlbar-container");
    var toolbar = document.getElementById("nav-bar");
    if (toolbar && "function" == typeof toolbar.insertItem) {
      if (before && before.parentNode != toolbar)
        before = null;

      toolbar.insertItem(vgspyid, before, null, false);

      toolbar.setAttribute("currentset", toolbar.currentSet);
      document.persist(toolbar.id, "currentset");
    }

    prefs.setBoolPref("setup", true); // Done! Never do this again.
  }

};

window.addEventListener("load", function(e) { vgspy.load(e); }, false);
window.addEventListener("unload", function(e) { vgspy.unload(e); }, false);
