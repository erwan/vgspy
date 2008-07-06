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

    // Discovery (find video games on web pages)
    VGSDiscover.init();
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

  unload: function() {
    VGSDiscover.uninit();
  },

  showDiscovered: function(aEvent) {
  }

};

window.addEventListener("load", function(e) { vgspy.load(e); }, false);
window.addEventListener("unload", function(e) { vgspy.unload(e); }, false);
