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

// This file is not included in any overlay of browser.xul, only in
// vgspy-specific xul files - so no risk of collision with other
// extensions

const PREFS_PREFIX = "extensions.vgspy."

const BOXES = [
  "scores",
  "videos",
  "prices"
]

var prefs = CC["@mozilla.org/preferences-service;1"]
            .getService(CI.nsIPrefBranch);

function $(aId) {
  return document.getElementById(aId);
}

var VGSpyCommon = {
  CONDITION_PREMIUM: 1,
  CONDITION_NEW: 2,
  CONDITION_USED: 3
}

VGSpyCommon.getBoolPref = function(aPrefName) {
  return prefs.getBoolPref(PREFS_PREFIX + aPrefName);
}

VGSpyCommon.setBoolPref = function(aPrefName, aValue) {
  prefs.setBoolPref(PREFS_PREFIX + aPrefName, aValue);
}
