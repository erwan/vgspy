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

function load() {
  for (i = 0; i < BOXES.length; i++) {
    var box = BOXES[i];
    $(box).setAttribute("checked", VGSpyCommon.getBoolPref(box));
  }
}

function accept() {
  for (i = 0; i < BOXES.length; i++) {
    var box = BOXES[i];
    VGSpyCommon.setBoolPref(box, $(box).checked);
  }
}