// ==UserScript==
// @name        Lounge Assistant
// @namespace   csgolounge.com/*
// @include     http://csgolounge.com/*
// @version     1.1.1
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
    $(document.body).bind("DOMSubtreeModified", function(){UpdateItemColor()});
});

$(".item" ).click(function() {
    var newSrc = $(this).find("img").attr("src").replace("99fx66f", "512fx388f");
    $("#modalImg").attr("src", newSrc);
    $("#modalPreview").fadeIn("fast");
});


$("#submenu>div").first()
    .append($('<div>').attr({'id' : 'AssistantMenu'})
	    .append($('<a>').attr({'class' : 'menuAssistant'}).html("Lounge Assistant"))
	    .append($("<a>").html("Website").attr({"href": "http://loungeassistant.github.io/Lounge-Assistant/"}))
	    .append($("<a>").html("Group").attr({"href": "http://steamcommunity.com/groups/LoungeAssistant"}))
	    .append($("<a>").html("Github").attr({"href": "https://github.com/LoungeAssistant/Lounge-Assistant"}))
	    .append($("<a>").html("Contributors").attr({"class": "showContributor"}))
	    .append($("<a>").html("Donate to LoungeAssistant ♥").attr({"href" : "http://steamcommunity.com/tradeoffer/new/?partner=79084932&token=3tOAL0yn"})));




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

    console.log(date);
    console.log(lastCheck);
    if (date - lastCheck > 3600 * 1000)
	{
	    GM_xmlhttpRequest({
		context: document.body,
		method: "GET",
		url: "https://github.com/LoungeAssistant/Lounge-Assistant/raw/master/Lounge_Assistant.user.js",
		onload: function(response) {
		    var document = response.context
		    var newVersion = response.responseText.match('^// @version\\s+(.*)$', "m");
		    console.log(newVersion[1]);
		    console.log(GM_info.script.version);
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

isUpToDate();

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
