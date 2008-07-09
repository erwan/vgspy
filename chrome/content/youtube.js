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

function vgsYoutubeLoader() {
}

vgsYoutubeLoader.prototype = {
  MEDIARSS_NS: "http://search.yahoo.com/mrss/",
  _parseResult: function(aXML) {
    var result = [];
    var entries = aXML.getElementsByTagName("entry");
    for (i = 0; i < entries.length; i++) {
      var entry = entries[i];
      var playerUrl = entry.getElementsByTagNameNS(this.MEDIARSS_NS, "content")[0]
                           .getAttribute("url");
      var label = entry.getElementsByTagNameNS(this.MEDIARSS_NS, "title")[0]
                       .firstChild.nodeValue;
      result.push({
        label: label,
        url: playerUrl
      });
    }
    return result;
  },

  query: function(aTitle, aListener) {
    var inst = this;
    var listener = {
      onSuccess: function(aText, aXML) {
        dump(aText);
        var result = inst._parseResult(aXML);
        aListener.onSuccess("load", result);
      },
      onError: function(aError) {
      }
    }

    var args = {
      vq: encodeURIComponent(aTitle),
      format: 5
    }
    args["max-results"] = 10;
    var hloader = new vgsHttpLoader("http://gdata.youtube.com/feeds/api/videos");
    hloader.call(listener, args);
  }
}