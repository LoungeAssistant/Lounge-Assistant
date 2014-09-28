var data = require("sdk/self").data;

var ss = require("sdk/simple-storage");

var pageMod = require("sdk/page-mod");

ss.storage.currency = ss.storage.currency ? ss.storage.currency : 1;
ss.storage.background = ss.storage.background ? ss.storage.background : "http://cdn.steamcommunity.com/economy/image/xJFAJwB220HYP78WfVEW3nzdipZEBtUBDPFsDJm3XnkNmnfcWWqdU3jmo-hbMVhUcciThRFElxkH_HEUmLRffgCeZJxHYo5Rebvv7kJ7RlM7ns3WUUycWwr3MVnT9xsuCJEygx03jFR9-KaxD38bGSSYmodKG81VWaUzWYLqQGwL";
ss.storage.timeFormat = ss.storage.timeFormat ? ss.storage.timeFormat : "12h";

pageMod.PageMod({
    include: "http://csgolounge.com/*",
    contentStyleFile : data.url("css/style.css"),
    contentScriptFile: [
	data.url("js/lib/jquery.min.js"),
	data.url("js/main.js")
    ],
    contentScriptOptions: ss.storage,

    onAttach: function(worker) {
	worker.postMessage(ss.storage);
    },

});

pageMod.PageMod({
    include: "http://dota2lounge.com/*",
    contentStyleFile : data.url("css/style.css"),
    contentScriptFile: [
	data.url("js/lib/jquery.min.js"),
	data.url("js/main.js")
    ],
    contentScriptOptions: ss.storage,

    onAttach: function(worker) {
	worker.postMessage(ss.storage);
    },

});

var setting_panel = require("sdk/panel").Panel({
    contentURL: data.url("settings.html"),
    contentScriptOptions: ss.storage,
    contentStyleFile : [data.url("css/lib/boostrap.min.css"),
			data.url("css/settings.css")],
    contentScriptFile: [
	data.url("js/lib/jquery.min.js"),
	data.url("js/lib/bootstrap.min.js"),
	data.url("js/settings.js")
    ],

    width: 600,
    height: 550,
    onMessage: function(msg){
	ss.storage = msg;
    }
});


require("sdk/ui/button/action").ActionButton({
    id: "show-panel",
    label: "Show Panel",
    icon: {
	"16": "./icon-16.png",
	"32": "./icon-32.png",
	"64": "./icon-64.png"
    },
    onClick: function (state) {
	setting_panel.show({position : {top: 0, right:0}});
    }
});
