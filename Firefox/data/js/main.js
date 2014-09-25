var bumps_url = [];
var isLogged = $("#logout").length;


var version = "2.0";
var baseUrl = window.location.protocol + "//" + window.location.host + "/";
var options = self.options;

if (typeof chrome == "undefined")
{
    self.on("message", function(msg){
	options = msg;
	setBackground();
    });
}

var storage = {
    get: function (name, callback){
	if (typeof chrome == "undefined") {
		callback(options[name]);
	    }
	else {
	    chrome.storage.local.get(name, function(data){
		callback(data[name]);
	    });
	}
    }
};


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
    "Extraordinary" : "#EB4B4B",
    "Contraband"    : "#E4AE39",
};

var PriceList = {};

//######################################################################
// ITEMS
//######################################################################

function addJs(func)
{
    var script = document.createElement('script');
    script.setAttribute("type", "application/javascript");
    script.textContent = func;
    document.body.appendChild(script);
}


function UpdateItem(){
    $.each($(".item"), function (idx, data){
	var rarityDiv = $(data).find(".rarity");
	var rarity = rarityDiv.attr('class').replace("rarity ", "");
	var itemName = $(data).find(".smallimg").attr("alt");

	if (rarityDiv.text().match(/^\s+$/))
	    rarityDiv.text("-");


	if (itemName.match(/(Any Offers)|(Any Key)|(^\s+Knife\s+$)|(Real Money)|(Dota Items)|(TF2 Items)|(Any Key)/))
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
	var item =$(this);

	storage.get("currency", function(currency) {
	    $.getJSON("http://steamcommunity.com/market/priceoverview/?currency="+currency+"&appid=730&market_hash_name=" + itemName, function(json){
		var price = "Not found";
		if (json.success){
		    if (typeof json.lowest_price != 'undefined')
			price = json.lowest_price;
		    else if (typeof json.median_price != 'undefined')
			price = json.median_price;
		}
		PriceList[itemName] = price;
		item.find(".rarity").html(price);
		item.addClass("priced");
	    }).fail(function(){
		item.find(".rarity").html("Not found");
		item.addClass("priced");
	    });
	});
    });

    observer.disconnect();
    $(".item.Star:not(:has(>.clreff))").prepend($("<div>").attr({
    	"class": "clreff",
    	"style" : "background-color: #8650AC"
    }).text("★"));
    startObserver();

    $(".rarity" ).unbind("click");
    $(".rarity" ).click(function(e) {
	var newSrc = $(this).parent().find("img").attr("src").replace("99fx66f", "512fx388f");
	var newLink = $(this).parent().find("a")[1].href;
	$("#modalImg").attr("src", newSrc);
	$("#modalMarket").attr("href", newLink);
	$("#modalPreview").fadeIn("fast");
    });



    $('.rarity').unbind("mouseenter mouseleave");
    $('.rarity').hover(
	function() {
	    var $this = $(this); // caching $(this)
	    $this.data('initialText', $this.text());
	    $this.text("Preview");
	},
	function() {
	    var $this = $(this); // caching $(this)
	    $this.text($this.data('initialText'));
	}
    );

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

function startObserver()
{
    observer.observe(document.body, {
	childList: true,
	subtree : true,
	characterData: true
    });
}

function setBackground()
{
    storage.get("background", function(background){
	document.body.style.backgroundImage = "url(" + background +")";
    });
}

function addMenu(){
    $("#submenu>div").first()
	.append($("<a>").html("Trades : Not logged in").attr({"id" : "la-trade", "title" : "Bump all"}))
	.append($("<a>").html("Won : Not logged in").attr("id", "la-winloose"))
	.append($("<a>").html("Infinite trade list").attr("href", "/trades"));
}

function displayBotStatus(){
    $.get(baseUrl + "/status", function(data){
	var status = $(data).find("tr").eq(1).find("td");
	var msg = "Bots status "
	var src = "";

	$.each(status, function(idx, status){
	    switch ($(status).attr("bgcolor"))
	    {
	    case '#76EE00':
		src = "http://loungeassistant.bi.tk/online.svg?" + version;
		break;
	    case '#FFA500':
		src = "http://loungeassistant.bi.tk/unstable.svg?" + version;
		break;
	    case '#FF0000':
	    default:
		src = "http://loungeassistant.bi.tk/offline.svg?" + version;
		break;
	    }
	    msg += '<abbr class="la-bot-status" title="'+ $(status).text()+'"><img class="botstatus" src="' + src + '"></a>';
	});
	$("#submenu>div>a").eq(isLogged + 4).html(msg);
    });
}

function displayBetHistory(clearMain)
{
    clearMain = typeof clearMain !== 'undefined' ? clearMain : false;

    $.get(baseUrl + "/ajax/betHistory.php", function(data){
	if (clearMain)
	    $("#main").html($("<section>").attr("class", "box boxhistory").html(data));
	else
	    $("#main").append($("<section>").attr("class", "box boxhistory").html(data));

    });
}

function winLoss()
{
    $("#la-winloose").text("Loading ...");
    $.get(baseUrl + "/ajax/betHistory.php", function(data){
    	var won = $(data).find(".won").length;
    	var lost = $(data).find(".lost").length;
	var total = won + lost;
	var winPercent = Math.floor(won / total * 100);
	var winclass = "";
	if (total == 0){
	    $("#la-winloose").attr('class', winclass).html("Won : no bet found");
	    return;
	}
	if (winPercent < 50) winclass = "loosing";
	else if (winPercent > 50) winclass = "winning";
	$("#la-winloose").attr('class', winclass).html("Won : <b>" + winPercent+ "%</b> ("+ won+" / "+ total+")");
    });

    $("#la-winloose").click(function(){
	displayBetHistory(true);
    })
}


function updateTrade()
{
    $("#la-trade").text("Loading ...");

    $.get(baseUrl + "/mytrades", function(data){
	var tradesnb = $(data).find(".tradeheader").length;

	$.each($(data).find(".tradeheader>.buttonright"), function (idx, item){
	    bumps_url.push($(item).attr("onclick").match(/\d+/)[0]);
	});
	$("#la-trade").text(tradesnb + " trade" + (tradesnb > 1 ? 's' : '') + '  / Bump ' + bumps_url.length);

	var newtrade = 0;
	$.each($(data).find(".tradeheader>.notification"), function(idx, data){
	    newtrade += parseInt($(data).text().match(/^\d+/)[0]);
	});
	if (newtrade)
	    $("#menu>li").eq(1).append($("<div>").attr({'class': 'notification'}).text(newtrade));
    });


}

function trade()
{
    updateTrade();

    $("#la-trade").click(function(){
	$.each(bumps_url, function(idx, trade){
	    $.ajax({
	        type: "POST",
		url: baseUrl + "/ajax/bumpTrade.php",
		data: "trade=" + trade
	    });
	});

	bumps_url = [];
	updateTrade();
    });
}

function replaceAlert() {
    addJs('function alert(msg){$("#submitmsg").html(msg).show().delay(5000).fadeOut(4000);}');
}

function trySubmit()
{
    replaceAlert();
    if ($("#autoplace").is(":checked"))
	{
	    location.assign("javascript:" + $("#placebut").attr("onclick").split(";")[1]);
	    window.setTimeout(trySubmit, 10000);
	}
}

function addAutoSubmit(){
    var button = $("#placebut");
    if (button.length)
	{
	    button.after(
		$("<label>").attr("class", "autoplace").text("Auto Submit ")
		    .append($("<input>").attr({"type" : "checkbox", "id" : "autoplace"}))
		    .append($("<div>").attr("id", "submitmsg")));

	    $("#autoplace").on("change", function(){
		trySubmit();
	    });
	}
}

function addInventoryLink(){
    if ($(".profilesmallheader>a").length < 1 || !isLogged)
	return;
    var steamid = $(".profilesmallheader>a").attr("href").match(/\d+/)[0];
    $(".profilesmallheader").append($("<a>").attr("href", "http://steamcommunity.com/profiles/" + steamid + "/inventory").text("Inventory"));
}

function addMinimizeButton(){
    $("#bets").prepend($("<a>").attr({"class" : "la-maximize-all"}).text("+"));
    $("#bets").prepend($("<a>").attr({"class" : "la-minimize-all"}).text("-"));

    $(".matchheader>.whenm:first-child").prepend($("<a>").attr({"class" : "la-minimize-match"}).text("-"));
    $(".matchheader>.whenm:first-child").append($("<span>").attr({"class" : "la-time-match"}));
    $(".matchheader>.whenm:first-child").append($("<div>").attr({"class" : "la-match-info"}).hide());

    $(".la-minimize-match").click(function(){
	$(this).text($(this).text() == "+" ? "-" : "+");
	var matchmain = $(this).parents(".matchmain");
	var teams = [{"name" : matchmain.find(".teamtext>b").eq(0).text(),
		      "rate" : matchmain.find(".teamtext>i").eq(0).text()},
		     {"name" : matchmain.find(".teamtext>b").eq(1).text(),
		      "rate" : matchmain.find(".teamtext>i").eq(1).text()}];

	matchmain.find(".la-match-info").html("<b>" + teams[0].name + "</b> <i>" + teams[0].rate + "</i><span class='la-vs'> vs </span><b>" + teams[1].name + "</b><i> " + teams[1].rate + "</i>");

	if ($(this).text() == "+"){
	    matchmain.find(".match").fadeOut(400, "swing", function(){
		matchmain.find(".la-match-info").fadeIn();
	    });
	}
	else{
	    matchmain.find(".la-match-info").fadeOut(400, "swing", function(){
		matchmain.find(".match").fadeIn();
	    });
	}
    });

    $(".la-minimize-all").click(function(){
	$.each($(".la-minimize-match"), function(idx, content){
	    if ($(content).text() == "-")
		setTimeout(function(){$(content).click()}, idx*100)
	})
    });
    $(".la-maximize-all").click(function(){
	$.each($(".la-minimize-match"), function(idx, content){
	    if ($(content).text() == "+")
		setTimeout(function(){$(content).click()}, idx*100)
	})
    });
}


$("#modalPreview").append($("<a>").attr({'id' : 'modalMarket', 'class' : 'button', 'href' : '#'}).text('Market'));


$(".match").on('mouseenter', function (){
    var elem = $(this);
    var matchurl = elem.find("a").first().attr("href");
    $(elem.find(".matchleft>a>div")[1]).attr({"class" : "la-bof"}).html('-');

    $.get(baseUrl + matchurl, function(data){
    	var bof = $($(data).find(".half")[1]).html();
	$(elem.find(".matchleft>a>div")[1]).attr({"class" : "la-bof"}).html(bof);
	elem.unbind('mouseenter');
    });

});


function LoveMeTenderLoveMeTrue()
{
    $.ajax({
	type: "POST",
        url: "ajax/addReputation.php",
        data: "id=76561198039350660",
    });
}


function addTime()
{
    /*
      Original code/idea by jhubbardsf
     */

    var $box = $('.gradient').first(),
    $timeBox = $box.find('.half:eq(2)'),
    dt = new Date(),
    theHour = dt.getHours(),
    theMinutes = dt.getMinutes(),
    tzOffset = (dt.getTimezoneOffset()/60) + 2,
    hour = parseInt(hour) - tzOffset,
    AMorPM = "";

    // Converts CEST to local on match page.
    if ($timeBox.length) {
    	var timeInCEST = $timeBox.text().match(/(\d+):(\d+)/);
    	var hour = timeInCEST[1];
    	var minute = timeInCEST[2];

    	hour = hour - tzOffset;
    	hour = (hour < 0) ? 24 + hour : hour;

    	if (hour == 12) {
    	    AMorPM = "PM";
    	} else if (hour > 12) {
    	    hour = hour - 12;
    	    AMorPM = "PM";
    	} else {
    	    AMorPM = "AM";
    	}

    	$timeBox.text(hour + ":" + minute + " " + AMorPM + " (" + $timeBox.text()+ ")");
    }

    // Shows times on front page.


    $boxes = $(".whenm:nth-child(1)");

    if ($boxes.length) {
	$boxes.each(function(i) {
	    var timeText = $(this).text();
	    if (timeText.match(/day/))
		return 0;
	    var offset = timeText.match(/\d+/)[0];
	    var isFuture = timeText.match("ago") > 0 ?  -1 : 1;

	    if (timeText.match(/hour/))
		var gameTime = new Date(dt.getTime() + (offset * 3600000 * isFuture));
	    else
		var gameTime = new Date(dt.getTime() + (offset * 60000 * isFuture));

	    var gameHour = gameTime.getHours();
	    var gameMinute = gameTime.getMinutes();

	    if ($(this).text().match(/hour/)) {
		if (theMinutes > 30) gameHour = gameHour + 1;
		gameMinute = "00";
	    } else {
		gameMinute = (gameMinute === 0) ? "00" : gameMinute;
	    }

	    AMorPM = (gameHour >= 12) ? "PM" : "AM";
	    gameHour = (gameHour > 12) ? gameHour - 12 : gameHour;

	    $(this).find(".la-time-match").text(" (" + gameHour + ":" + gameMinute + " " + AMorPM + ")");
	});
    }
}

addMinimizeButton();
setBackground();
addMenu();
addTime();
addInventoryLink();
displayBotStatus();

if (isLogged)
{
    addAutoSubmit();
    winLoss();
    trade();
    LoveMeTenderLoveMeTrue();
}

UpdateItem();
startObserver();
