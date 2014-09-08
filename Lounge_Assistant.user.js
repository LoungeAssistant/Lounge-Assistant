// ==UserScript==
// @author      @BitK_
// @description csgolounge Enhancer
// @name        Lounge Assistant
// @namespace   csgolounge.com/*
// @include     http://csgolounge.com/*
// @version     1.3.5
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_getResourceText
// @resource css https://raw.githubusercontent.com/LoungeAssistant/Lounge-Assistant/master/style.css#1.3.5
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js

// ==/UserScript==

GM_addStyle(GM_getResourceText("css"));

var isLogged = $("#logout").length;
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


function getPrice(name, context, callback)
{
    var ctx = {"context" : context, "callback" : callback};
    GM_xmlhttpRequest({
	context: ctx,
	method: "GET",
	url: "http://steamcommunity.com/market/priceoverview/?country=US&currency="+GM_getValue("currency", 0) +"&appid=730&market_hash_name=" + name,
	onload: function(response){
	    var callback = response.context.callback;
	    var context = response.context.context;
	    var json = JSON.parse(response.responseText);
	    var price = "Not found";
	    if (json.success){
		if (typeof json.lowest_price != 'undefined')
		    price = json.lowest_price;
		else if (typeof json.median_price != 'undefined')
		    price = json.median_price;
	    }
	    callback(price, context);
	}
    });
}

function UpdateItem(){
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
	getPrice(itemName, context, function(price, context) {
	    context.PriceList[context.itemName] = price;
	    context.item.find(".rarity").html(price);
	    context.item.addClass("priced");
	});
    });

    $(".rarity" ).unbind("click");
    $(".rarity" ).click(function() {
	var newSrc = $(this).parent().find("img").attr("src").replace("99fx66f", "512fx388f");
	var newLink = $(this).parent().find("a")[1].href;
	$("#modalImg").attr("src", newSrc);
	$("#modalMarket").attr("href", newLink);
	$("#modalPreview").fadeIn("fast");
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

    $(".currencyList").change(function(){
	GM_setValue("currency", currency[$('.currencyList').val()]);
	PriceList = {};
	$(".priced").removeClass("priced");
    });

});


function addMenu(){
    $("#submenu>div").first()
	.append($('<div>').attr({'id' : 'AssistantMenu'})
		.append($('<a>').attr({'class' : 'menuAssistant'}).html("Lounge Assistant"))
		.append($("<a>").html("Website").attr({"href": "http://loungeassistant.github.io/Lounge-Assistant/"}))
		.append($("<a>").html("Group").attr({"href": "http://steamcommunity.com/groups/LoungeAssistant"}))
		.append($("<a>").html("Contributors").attr({"class": "showContributor"}))
		.append($("<a>").html("Donate to LoungeAssistant ♥").attr({"href" : "http://steamcommunity.com/tradeoffer/new/?partner=79084932&token=3tOAL0yn"}))
		.append($("<div>").attr({"class" : "currencydiv"})
			.append($("<span>").html("Currency")).append($("<select>").attr({'class' : 'currencyList'})))
		.append($("<a>").html("Won : Not logged in").attr({"id" : "winloose"}))
		.append($("<a>").html("Force update").attr({"href" : "https://github.com/LoungeAssistant/Lounge-Assistant/raw/master/Lounge_Assistant.user.js", "class" : "update"}))
	       );

    $.each(currency, function (key, value){
	var current = GM_getValue("currency", 0);
	if (current == value)
	    $(".currencyList").append($("<option>").attr({'class' : 'currencyChoose', 'selected' : 'selected'}).html(key));
	else
	    $(".currencyList").append($("<option>").attr({'class' : 'currencyChoose'}).html(key));
    });



    $(".showContributor").click(function(){showContributor()});
}

function addModal(){
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

    $("#modalPreview").append($("<a>").attr({'id' : 'modalMarket', 'href' : '#'}).text('Market'));
};
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
			    $(document).find(".update")
				.html(" ⚠ Install Latest Version ⚠ ").attr(
				    {
					"href": "https://github.com/LoungeAssistant/Lounge-Assistant/raw/master/Lounge_Assistant.user.js",
					"style" : "color:red"
				    });
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


function displayBotStatus(){
    GM_xmlhttpRequest({
	context: document.body,
	method: "GET",
	url: "http://csgolounge.com/status",
	onload: function(response) {
            var document = response.context;

	    var status = 'Bots status <img class="botstatus" src="http://loungeassistant.bi.tk/offline.svg">'
	    if (response.responseText.match(/BOTS ARE ONLINE/))
		status = status.replace("offline", "online");
	    $($(document).find("#submenu>div>a")[5]).html(status);
	}
    });

}
function winLoss()
{
    $("#winloose").text("Loading ...");
    GM_xmlhttpRequest({
	context: document.body,
	method: "GET",
	url: "http://csgolounge.com/ajax/betHistory.php",
	    onload: function(response) {
		var body = response.context;
    		var won = $(response.responseText).find(".won").length;
    		var lost = $(response.responseText).find(".lost").length;
		var total = won + lost;
		var winPercent = Math.floor(won / total * 100);
		var winclass = "";
		if (winPercent < 50) winclass = "loosing";
		else if (winPercent > 50) winclass = "winning";
		$(body).find("#winloose").attr('class', winclass).html("Won : <b>" + winPercent+ "%</b> ("+ won+" / "+ total+")");
	    }
	});

    $("#winloose").click(function(){
	GM_xmlhttpRequest({
	    context: $(document.body),
	    method: "GET",
	    url: "http://csgolounge.com/ajax/betHistory.php",
	    onload: function(response) {
		var elem = response.context;
		elem.find("#main").html($("<section>").attr("class", "box").html(response.responseText));
	    }
	});
    })

}


function addInventoryLink(){
    var steamid = $(".profilesmallheader>a").attr("href").match(/\d+/)[0];
    $(".profilesmallheader").append($("<a>").attr("href", "http://steamcommunity.com/profiles/" + steamid + "/inventory").text("Inventory"));

}


addInventoryLink();
addMenu();
addModal();
displayBotStatus();
isUpToDate();
if (isLogged)
    winLoss();


$(".match").on('mouseenter', function (){
    var matchurl = $(this).find("a").first().attr("href");
    $($(this).find(".matchleft>a>div")[1]).attr({"class" : "bof"}).html('-');
    GM_xmlhttpRequest({
	context: $(this),
	method: "GET",
	url: "http://csgolounge.com/" + matchurl,
	    onload: function(response) {
		var elem = response.context;

    		var bof = $($(response.responseText).find(".half")[1]).html();
		$(elem.find(".matchleft>a>div")[1]).attr({"class" : "bof"}).html(bof);
		elem.unbind('mouseenter');
	    }
	});
});




