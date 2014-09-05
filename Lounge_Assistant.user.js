// ==UserScript==
// @name        Lounge Assistant
// @namespace   csgolounge.com/*
// @include     http://csgolounge.com/*
// @version     1
// @grant       GM_xmlhttpRequest
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_getResourceText
// @resource css https://raw.githubusercontent.com/LoungeAssistant/Lounge-Assistant/master/style.css
// @require     http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js

// ==/UserScript==


GM_addStyle(GM_getResourceText("css"));

//######################################################################
// ITEMS
//######################################################################
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
function UpdateItemColor()
{
    $.each($(".item"), function (idx, data){
	var rarityDiv = $(data).find(".rarity");
	var rarity = rarityDiv.attr('class').replace("rarity ", "");
	var itemName = $(data).find(".smallimg").attr("alt");

	if (itemName.match("(^.*Any .*$)|(^.*Key.*$)|(^\\s+Knife\\s+$)"))
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
	} else {
	    $(data).find(".rarity").css({
		"visibility" : "hidden",
	    });
	}
    });
}

$(document).ready(function(){
    UpdateItemColor();
    $("#tradelist").bind("DOMSubtreeModified", function(){UpdateItemColor()});
});

$(".item" ).click(function() {
    var newSrc = $(this).find("img").attr("src").replace("99fx66f", "512fx388f");
    $("#modalImg").attr("src", newSrc);
    $("#modalPreview").fadeIn("fast");
});


$("#submenu>div").first()
    .append($('<a>').attr({'class' : 'menuAssistant'}).html("Lounge Assistant"))
    .append($("<a>").html("Check for Update"))
    .append($("<a>").html("Donations ♥"));

