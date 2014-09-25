var currency = {
    "$"    : "1",
    "£"    : "2",
    "€"    : "3",
    "pуб"  : "5",
    "R$"   : "7",
    "¥"    : "8",
    "kr"   : "9",
    "Rp"   : "10",
    "RM"   : "11",
    "P"    : "12",
    "S$"   : "13",
    "฿"    : "14",
    "₫"    : "15",
    "₩"    : "16",
    "TL"   : "17",
    "₴"    : "18",
    "Mex$" : "19",
    "C$"   : "20",
    "A$"   : "21",
    "NZ$"  : "22"
};

var defaultBg = "http://cdn.steamcommunity.com/economy/image/xJFAJwB220HYP78WfVEW3nzdipZEBtUBDPFsDJm3XnkNmnfcWWqdU3jmo-hbMVhUcciThRFElxkH_HEUmLRffgCeZJxHYo5Rebvv7kJ7RlM7ns3WUUycWwr3MVnT9xsuCJEygx03jFR9-KaxD38bGSSYmodKG81VWaUzWYLqQGwL";

var options = self.options;
var sendMsg = self.postMessage;

var version = "2.1";

var storage = {
    get: function (name, callback){
	if (typeof chrome == "undefined")
	    {
		callback(options[name]);
	    }
	else
	    {
		chrome.storage.local.get(name, function(data){callback(data[name])});
	    }
    },
    set: function (name, value){
	if (typeof chrome == "undefined") {
	    options[name] = value;
	    sendMsg(options);
	}
	else {
	    var obj = {};
	    obj[name] = value
	    chrome.storage.local.set(obj);
	}
    }
};


function reloadDonator()
{
    $("#donatorsList").html("Loading ...");
    $.getJSON("http://loungeassistant.bi.tk/donators.json?"+ Math.random(), function(donators){
	donators.sort(function(a, b) {
	    return b.totalprice - a.totalprice;
	})

	$("#donatorsList").html("");
	$.each(donators, function(idx, donator){
	    $("#donatorsList").append(
		$("<tr>").append(
		    $("<td>").append(
			$("<a>").attr("href", donator.link).text(donator.name)
		    )
		).append(
		    $("<td>").text(donator.items)
		).append(
		    $("<td>").text(donator.totalprice + "€")
		)
	    );
	});
    });
}

$(document).ready(function(){
    $("#version").text(version);

    $(".la-option-validate").click(function(e){
	var background = $("#la-option-background").val();

	storage.set('currency', currency[$("#la-currency-list").val()]);
	storage.set('background', background != "" ? background : defaultBg);

	$("#la-option-msg").text("Saved !").show().fadeOut(3000);
    });

    storage.get('currency', function(current){
	$.each(currency, function (key, value){
	    $("#la-currency-list").append($("<option>").attr(current == value ? {'selected' : 'selected'} : {}).html(key));
	});
    });

    storage.get('background', function(background){
	$("#la-option-background").val(background);
    });

    $("#la-reload").click(function(){
	reloadDonator();
    });

    reloadDonator();
});



