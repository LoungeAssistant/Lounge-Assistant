// ==UserScript==
// @author      @BitK_
// @description csgolounge Enhancer
// @name        Lounge Assistant
// @namespace   csgolounge.com/*
// @include     http://csgolounge.com/*
// @version     1.2.8
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_getResourceText
// @resource css https://raw.githubusercontent.com/LoungeAssistant/Lounge-Assistant/master/style.css
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js

// ==/UserScript==

GM_addStyle(GM_getResourceText("css"));


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
}
var colors = {
    "Base"          : "#B0C3D9",
    "Consumer"      : "#B0C3D9",
    "Mil-Spec"      : "#4B69FF",
    "Industrial"    : "#5E98D9",
    "Hight"         : "#4B69FF",
    "Restricted"    : "#8847FF",
    "Remarkable"    : "#8847FF",
    "Classified"    : "#D32CE6",
    "Covert"        : "#EB4B4B",
    "Exotic"        : "#D32CE6",
    "Extraordinary" : "#000000",
    "Contraband"    : "#E4AE39",
};

var PriceList = {};

//######################################################################
// ITEMS
//######################################################################



function UpdateItem()
{
    $.each($(".item"), function (idx, data){
	var rarityDiv = $(data).find(".rarity");
	var rarity = rarityDiv.attr('class').replace("rarity ", "");
	var itemName = $(data).find(".smallimg").attr("alt");


	if (itemName.match("(^.*Any .*$)|(^\\s+Knife\\s+$)"))
	{
	    $(data).find(".rarity").css({
		"visibility" : "hidden",
	    });
	    return 1;
	}

	if (rarity in colors) {
	    $(data).find(".rarity").css({
		"background-color" : colors[rarity],
	    });
	}
    });

    $("div.item").unbind("mouseenter");
    $("div.item").bind("mouseenter", function(evt){

	if ($(this).hasClass("priced"))
	    return;

	var itemName = $(this).find(".smallimg").first().attr("alt");

	if (itemName in PriceList) {
	    $(this).find(".rarity").html(PriceList[itemName]);
	    return;
	}
	$(this).find(".rarity").html("Loading ...");
	var context = {'PriceList' : PriceList, 'item' : $(this), 'itemName' : itemName};
	GM_xmlhttpRequest({
	    context: context,
	    method: "GET",
	    url: "http://steamcommunity.com/market/priceoverview/?country=US&currency="+GM_getValue("currency", 0) +"&appid=730&market_hash_name=" + itemName,
	    onload: function(response) {
		var item = response.context.item;
		var itemName = response.context.itemName;
		var PriceList = response.context.PriceList;
		var json = JSON.parse(response.responseText);
		var price = 'Not found';

		if (json.success){
		    if (typeof json.lowest_price != 'undefined')
			price = json.lowest_price;
		    else if (typeof json.median_price != 'undefined')
			price = json.median_price;
		}
		PriceList[itemName] = price;
		item.find(".rarity").html(price);
		item.addClass("priced");
	    }
	});
    });
}


var observer = new MutationObserver(function(mutations) {
    mutations.forEach(function( mutation ) {
        var newNodes = mutation.addedNodes;
	if(newNodes !== null && newNodes.length > 0) {
	    $.each(newNodes, function(idx, n){
		if (n.nodeName != "#text"){
		    UpdateItem();
		    return false;
		}
	    });
	}
    });
});

$(document).ready(function(){
    UpdateItem();
    observer.observe(document.body, {
	childList: true,
	subtree : true,
	characterData: true
    });
});

$(".item" ).click(function() {
    var newSrc = $(this).find("img").attr("src").replace("99fx66f", "512fx388f");
    $("#modalImg").attr("src", newSrc);
    $("#modalPreview").fadeIn("fast");
});

function addMenu(){
    $("#submenu>div").first()
	.append($('<div>').attr({'id' : 'AssistantMenu'})
		.append($('<a>').attr({'class' : 'menuAssistant'}).html("Lounge Assistant"))
		.append($("<a>").html("Website").attr({"href": "http://loungeassistant.github.io/Lounge-Assistant/"}))
		.append($("<a>").html("Group").attr({"href": "http://steamcommunity.com/groups/LoungeAssistant"}))
		.append($("<a>").html("Github").attr({"href": "https://github.com/LoungeAssistant/Lounge-Assistant"}))
		.append($("<a>").html("Contributors").attr({"class": "showContributor"}))
		.append($("<a>").html("Donate to LoungeAssistant ♥").attr({"href" : "http://steamcommunity.com/tradeoffer/new/?partner=79084932&token=3tOAL0yn"}))
		.append($("<div>").attr({"class" : "currencydiv"})
			.append($("<span>").html("Currency")).append($("<select>").attr({'class' : 'currencyList'}))
		       )
	       );

    $.each(currency, function (key, value){
	var current = GM_getValue("currency", 0);
	if (current == value)
	    $(".currencyList").append($("<option>").attr({'class' : 'currencyChoose', 'selected' : 'selected'}).html(key));
	else
	    $(".currencyList").append($("<option>").attr({'class' : 'currencyChoose'}).html(key));
    });

}

$("body").append(
    $("<div>").attr(
	{
	    "id" : "modalAssistant"
	}
    ).append(
	$("<a>").attr(
	    {
		"class" : "buttonright",
		"onclick" : "$(this).parent().fadeOut('fast')"
	    }
	).html("  X ")
    ).append(
	$("<div>").attr(
	    {
		"id" : "modalCnt"
	    }
	)
    )
);


function isUpToDate(){
    var date = Date.now();
    var lastCheck = GM_getValue('lastCheck', 0);

    if (date - lastCheck > 3600 * 1000)
	{
	    GM_xmlhttpRequest({
		context: document.body,
		method: "GET",
		url: "https://github.com/LoungeAssistant/Lounge-Assistant/raw/master/Lounge_Assistant.user.js",
		onload: function(response) {
		    var document = response.context
		    var newVersion = response.responseText.match('^// @version\\s+(.*)$', "m");
		    if (newVersion[1] != GM_info.script.version)
			{
			    $(document).find("#AssistantMenu").append(
				$("<a>").html(" ⚠ Install Latest Version ⚠ ").attr(
				    {
					"href": "https://github.com/LoungeAssistant/Lounge-Assistant/raw/master/Lounge_Assistant.user.js",
					"style" : "color:red"
				    }));
 			}
		}
	    });
	    GM_setValue('lastCheck', date);
	}
}

function showContributor() {
    $("#modalCnt").html('<img src="../img/load.gif" id="loading" style="margin: 0.75em 2%">');
    GM_xmlhttpRequest({
	context: document.body,
	method: "GET",
	url: "https://github.com/LoungeAssistant/Lounge-Assistant/raw/master/contributors.html",
	onload: function(response) {
            var document = response.context
	    $(document).find("#modalCnt").html(response.responseText);
	}
    });
    $("#modalAssistant").slideDown('fast');
}

$(".showContributor").click(function(){showContributor()});

$(".currencyList").change(function(){
    GM_setValue("currency", currency[$('.currencyList').val()]);
    PriceList = {};
    $(".priced").removeClass("priced");
});




function displayBotStatus(){
    GM_xmlhttpRequest({
	context: document.body,
	method: "GET",
	url: "http://csgolounge.com/status",
	onload: function(response) {
            var document = response.context;

	    var status = 'Bot status <img class="botstatus" height="15px" src="http://loungeassistant.bi.tk/offline.svg">'
	    if (response.responseText.match(/BOTS ARE ONLINE/))
		status = status.replace("offline", "online");
	    $($(document).find("#submenu>div>a")[5]).html(status);
	}
    });

}


addMenu();
displayBotStatus();
isUpToDate();
