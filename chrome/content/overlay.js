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
  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById("vgspy-strings");
  },
  onToolbarButtonCommand: function(e) {
    var panel = document.getElementById("vgspyPanel");
    panel.openPopup(document.getElementById("vgspy-toolbar-button"),
                    "after_start",
                    100,
                    0,
                    false,
                    false);
    panel.focus();
  }

};
window.addEventListener("load", function(e) { vgspy.onLoad(e); }, false);
