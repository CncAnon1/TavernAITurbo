const VERSION = '1.2.8';
var converter = new showdown.Converter();
var bg_menu_toggle = false;
var default_user_name = "You";
var name1 = default_user_name;
var name2 = "Chloe";
var chat = [{
    name: 'Chloe',
    is_user: false,
    is_name: true,
    create_date: 0,
    mes: '\n*You went inside. The air smelled of fried meat, tobacco and a hint of wine. A dim light was cast by candles, and a fire crackled in the fireplace. It seems to be a very pleasant place. Behind the wooden bar is an elf waitress, she is smiling. Her ears are very pointy, and there is a twinkle in her eye. She wears glasses and a white apron. As soon as she noticed you, she immediately came right up close to you.*\n\n' +
        ' Hello there! How is your evening going?\n' +
        '<img src="img/star_dust_city.png" width=80% style="opacity:0.3; display:block;border-radius:5px;margin-top:25px;margin-bottom:23px; margin-left: 45px;margin-right: auto;">\n<a id="verson" style="color:rgb(229, 224, 216,0.8);" href="https://github.com/TavernAI/TavernAI" target="_blank">@@@TavernAI v' + VERSION + '@@@</a><div id="characloud_url" style="margin-right:10px;margin-top:0px;float:right; height:25px;cursor: pointer;opacity: 0.99;display:inline-block;"><img src="img/cloud_logo.png" style="width: 25px;height: auto;display:inline-block; opacity:0.7;"><div style="vertical-align: top;display:inline-block;">Cloud</div></div><br><br><br><br>'
}];

var chat_create_date = 0;
var default_ch_mes = "Hello";
var count_view_mes = 0;
var mesStr = '';
var generatedPromtCache = '';
var characters = [];
var this_chid;
var backgrounds = [];
var default_avatar = 'img/fluffy.png';
var is_colab = false;
var is_checked_colab = false;
var is_mes_reload_avatar = false;

var is_advanced_char_open = false;

var menu_type = '';//what is selected in the menu
var selected_button = '';//which button pressed
//create pole save
var create_save_name = '';
var create_save_description = '';
var create_save_personality = '';
var create_save_first_message = '';
var create_save_avatar = '';
var create_save_scenario = '';
var create_save_mes_example = '';

var timerSaveEdit;
var durationSaveEdit = 200;
//animation right menu
var animation_rm_duration = 200;
var animation_rm_easing = "";

var popup_type = "";
var bg_file_for_del = '';
var online_status = 'no_connection';

var api_server = "";
//var interval_timer = setInterval(getStatus, 2000);
var interval_timer_novel = setInterval(getStatusNovel, 3000);
//var interval_timer_openai = setInterval(getStatusOpen, 3000);
var is_get_status = false;
var is_get_status_novel = false;
var is_get_status_openai = false;
var is_api_button_press = false;
var is_api_button_press_novel = false;
var is_api_button_press_openai = false;

var is_send_press = false;//Send generation
var add_mes_without_animation = false;

var this_del_mes = 0;

var this_edit_mes_text = '';
var this_edit_mes_chname = '';
var this_edit_mes_id;

const delay = ms => new Promise(res => setTimeout(res, ms));
//settings
var settings;
var koboldai_settings;
var koboldai_setting_names;
var preset_settings = 'gui';
var user_avatar = 'you.png';
var temp = 0.5;
var amount_gen = 80;
var max_context = 2048;//2048;
var openai_max_context = 4095;
var rep_pen = 1;
var rep_pen_size = 100;

var is_pygmalion = false;
var tokens_already_generated = 0;
var message_already_generated = '';
var if_typing_text = false;
const tokens_cycle_count = 30;
var cycle_count_generation = 0;

var anchor_order = 0;
var style_anchor = true;
var character_anchor = true;

var main_api = 'kobold';
//novel settings
var temp_novel = 0.5;
var rep_pen_novel = 1;
var rep_pen_size_novel = 100;

var api_key_novel = "";
var novel_tier;
var model_novel = "euterpe-v2";
var novelai_settings;
var novelai_setting_names;
var preset_settings_novel = 'Classic-Krake';

//openai settings
var temp_openai = 1.0;
var pres_pen_openai = 0;
var freq_pen_openai = 0;
var stream_openai = true;

var api_key_openai = "";
var openai_settings;
var openai_setting_names;
var preset_settings_openai = 'Default';

var openai_max_tokens = 300;

var openai_msgs = [];
var openai_msgs_example = [];

// extra tweaks
var keep_example_dialogue = true;
var nsfw_toggle = true;
var keep_example_dialogue = false;
var enhance_definitions = false;
var wrap_in_quotes = false;
var nsfw_first = false;

var main_prompt = "Write {{char}}'s next reply in a fictional chat between {{char}} and {{user}}. Write 1 reply only in internet RP style, italicize actions, and avoid quotation marks. Use markdown. Be proactive, creative, and drive the plot and conversation forward. Write at least 1 paragraph, up to 4. Always stay in character and avoid repetition.";
var nsfw_prompt = "NSFW/Smut is allowed. Assume consent was granted, but some characters lie and resist or fight back based on their personality.";

//css
var bg1_toggle = true;
var css_mes_bg = $('<div class="mes"></div>').css('background');
var css_send_form_display = $('<div id=send_form></div>').css('display');

var colab_ini_step = 1;
setInterval(function () {
    switch (colab_ini_step) {
        case 0:
            $('#colab_popup_text').html('<h3>Initialization</h3>');
            colab_ini_step = 1;
            break
        case 1:
            $('#colab_popup_text').html('<h3>Initialization.</h3>');
            colab_ini_step = 2;
            break
        case 2:
            $('#colab_popup_text').html('<h3>Initialization..</h3>');
            colab_ini_step = 3;
            break
        case 3:
            $('#colab_popup_text').html('<h3>Initialization...</h3>');
            colab_ini_step = 0;
            break
    }
}, 500);

// feels good replacing 5+ places with a single function
function replacePlaceholders(text) {
    return text.replace(/{{user}}/gi, name1)
        .replace(/{{char}}/gi, name2)
        .replace(/<USER>/gi, name1)
        .replace(/<BOT>/gi, name2);
}

function parseExampleIntoIndividual(messageExampleString) {
    let result = []; // array of msgs
    let tmp = messageExampleString.split("\n");
    var cur_msg_lines = [];
    let in_user = false;
    let in_bot = false;
    // DRY my cock and balls
    function add_msg(name, role) {
        // join different newlines (we split them by \n and join by \n)
        // remove char name
        // strip to remove extra spaces
        let parsed_msg = cur_msg_lines.join("\n").replace(name + ":", "").trim();
        result.push({ "role": role, "content": parsed_msg });
        cur_msg_lines = [];
    }
    // skip first line as it'll always be "This is how {bot name} should talk"
    for (let i = 1; i < tmp.length; i++) {
        let cur_str = tmp[i];
        // if it's the user message, switch into user mode and out of bot mode
        // yes, repeated code, but I don't care
        if (cur_str.indexOf(name1 + ":") === 0) {
            in_user = true;
            // we were in the bot mode previously, add the message
            if (in_bot) {
                add_msg(name2, "assistant");
            }
            in_bot = false;
        } else if (cur_str.indexOf(name2 + ":") === 0) {
            in_bot = true;
            // we were in the user mode previously, add the message
            if (in_user) {
                add_msg(name1, "user");
            }
            in_user = false;
        }
        // push the current line into the current message array only after checking for presence of user/bot
        cur_msg_lines.push(cur_str);
    }
    // Special case for last message in a block because we don't have a new message to trigger the switch
    if (in_user) {
        add_msg(name1, "user");
    } else if (in_bot) {
        add_msg(name2, "assistant");
    }
    return result;
}


var token;
$.ajaxPrefilter((options, originalOptions, xhr) => {
    xhr.setRequestHeader("X-CSRF-Token", token);
});

$.get("/csrf-token")
    .then(data => {
        token = data.token;
        getSettings("def");
        getLastVersion();
        getCharacters();

        printMessages();
        getBackgrounds();
        getUserAvatars();
    });

$('#characloud_url').click(function () {
    window.open('https://boosty.to/tavernai', '_blank');
});
function checkOnlineStatus() {
    //console.log(online_status);
    if (online_status == 'no_connection') {
        $("#online_status_indicator").css("background-color", "red");
        $("#online_status").css("opacity", 0.3);
        $("#online_status_text").html("No connection...");
        $("#online_status_indicator2").css("background-color", "red");
        $("#online_status_text2").html("No connection...");
        $("#online_status_indicator3").css("background-color", "red");
        $("#online_status_text3").html("No connection...");
        $("#online_status_indicator4").css("background-color", "red");
        $("#online_status_text4").html("No connection...");
        is_get_status = false;
        is_get_status_novel = false;
        is_get_status_openai = false;
    } else {
        $("#online_status_indicator").css("background-color", "black");
        $("#online_status").css("opacity", 0.0);
        $("#online_status_text").html("");
        $("#online_status_indicator2").css("background-color", "green");
        $("#online_status_text2").html(online_status);
        $("#online_status_indicator3").css("background-color", "green");
        $("#online_status_text3").html(online_status);
        $("#online_status_indicator4").css("background-color", "green");
        $("#online_status_text4").html(online_status);
    }

}
async function getLastVersion() {

    jQuery.ajax({
        type: 'POST', // 
        url: '/getlastversion', // 
        data: JSON.stringify({
            '': ''
        }),
        beforeSend: function () {


        },
        cache: false,
        dataType: "json",
        contentType: "application/json",
        //processData: false, 
        success: function (data) {
            var getVersion = data.version;
            if (getVersion !== 'error' && getVersion != undefined) {
                if (compareVersions(getVersion, VERSION) === 1) {
                    $('#verson').append(' <span style="color: #326d78; font-size: 15px;">(New update @' + getVersion + ')</span>');
                }
            }

        },
        error: function (jqXHR, exception) {
            console.log(exception);
            console.log(jqXHR);

        }
    });

}
async function getStatus() {
    if (is_get_status) {
        jQuery.ajax({
            type: 'POST', // 
            url: '/getstatus', // 
            data: JSON.stringify({
                api_server: api_server
            }),
            beforeSend: function () {
                if (is_api_button_press) {
                    //$("#api_loading").css("display", 'inline-block');
                    //$("#api_button").css("display", 'none');
                }
                //$('#create_button').attr('value','Creating...'); // 

            },
            cache: false,
            dataType: "json",
            crossDomain: true,
            contentType: "application/json",
            //processData: false, 
            success: function (data) {
                online_status = data.result;
                if (online_status == undefined) {
                    online_status = 'no_connection';
                }
                if (online_status.toLowerCase().indexOf('pygmalion') != -1) {
                    is_pygmalion = true;
                    online_status += " (Pyg. formatting on)";
                } else {
                    is_pygmalion = false;
                }

                //console.log(online_status);
                resultCheckStatus();
                if (online_status !== 'no_connection') {
                    var checkStatusNow = setTimeout(getStatus, 3000);//getStatus();
                }
            },
            error: function (jqXHR, exception) {
                console.log(exception);
                console.log(jqXHR);
                online_status = 'no_connection';

                resultCheckStatus();
            }
        });
    } else {
        if (is_get_status_novel != true && is_get_status_openai != true) {
            online_status = 'no_connection';
        }
    }
}

function countTokens(messages, full = false) {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    var token_count = -1;
    jQuery.ajax({
        async: false,
        type: 'POST', // 
        url: '/tokenize_openai', // 
        data: JSON.stringify(messages),
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            token_count = data.token_count;
        }
    });
    if (!full) token_count -= 2;
    return token_count;
}

function resultCheckStatus() {
    is_api_button_press = false;
    checkOnlineStatus();
    $("#api_loading").css("display", 'none');
    $("#api_button").css("display", 'inline-block');
}

function printCharaters() {
    //console.log(1);
    $("#rm_print_charaters_block").empty();
    characters.forEach(function (item, i, arr) {
        var this_avatar = default_avatar;
        if (item.avatar != 'none') {
            this_avatar = "characters/" + item.avatar + "#" + Date.now();

        }
        $("#rm_print_charaters_block").prepend('<div class=character_select chid=' + i + '><div class=avatar><img src="' + this_avatar + '"></div><div class=ch_name>' + item.name + '</div></div>');
        //console.log(item.name);
    });


}
async function getCharacters() {

    const response = await fetch("/getcharacters", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token
        },
        body: JSON.stringify({
            "": ""
        })

    });
    if (response.ok === true) {
        const getData = await response.json();
        //console.log(getData);
        //var aa = JSON.parse(getData[0]);
        const load_ch_count = Object.getOwnPropertyNames(getData);

        for (var i = 0; i < load_ch_count.length; i++) {

            characters[i] = [];
            characters[i] = getData[i];

            //console.log(characters[i]);
        }
        characters.sort((a, b) => a.create_date - b.create_date);
        //characters.reverse();
        if (this_chid != undefined) $("#avatar_url_pole").val(characters[this_chid].avatar);
        printCharaters();
        //console.log(propOwn.length);
        //return JSON.parse(getData[0]);
        //const getData = await response.json();
        //var getMessage = getData.results[0].text;
    }
}
async function getBackgrounds() {

    const response = await fetch("/getbackgrounds", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token
        },
        body: JSON.stringify({
            "": ""
        })

    });
    if (response.ok === true) {
        const getData = await response.json();
        //background = getData;
        //console.log(getData.length);
        for (var i = 0; i < getData.length; i++) {
            //console.log(1);
            $("#bg_menu_content").append("<div class=bg_example><img bgfile='" + getData[i] + "' class=bg_example_img src='backgrounds/" + getData[i] + "'><img bgfile='" + getData[i] + "' class=bg_example_cross src=img/cross.png></div>");
        }
        //var aa = JSON.parse(getData[0]);
        //const load_ch_coint = Object.getOwnPropertyNames(getData);


    }
}
async function isColab() {
    is_checked_colab = true;
    const response = await fetch("/iscolab", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token
        },
        body: JSON.stringify({
            "": ""
        })

    });
    if (response.ok === true) {
        const getData = await response.json();
        if (getData.colaburl != false) {
            $('#colab_shadow_popup').css('display', 'none');
            is_colab = true;
            let url = String(getData.colaburl).split("flare.com")[0] + "flare.com";
            url = String(url).split("loca.lt")[0] + "loca.lt";
            $('#api_url_text').val(url);
            setTimeout(function () {
                $('#api_button').click();
            }, 2000);
        }


    }
}
async function setBackground(bg) {
    /*
    const response = await fetch("/setbackground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
                        "bg": bg
                    })

    });
    if (response.ok === true) {
        //const getData = await response.json();
        //background = getData;

        //var aa = JSON.parse(getData[0]);
        //const load_ch_coint = Object.getOwnPropertyNames(getData);
    }*/
    //console.log(bg);
    jQuery.ajax({
        type: 'POST', // 
        url: '/setbackground', // 
        data: JSON.stringify({
            bg: bg
        }),
        beforeSend: function () {
            //$('#create_button').attr('value','Creating...'); // 
        },
        cache: false,
        dataType: "json",
        contentType: "application/json",
        //processData: false, 
        success: function (html) {
            //setBackground(html);
            //$('body').css('background-image', 'linear-gradient(rgba(19,21,44,0.75), rgba(19,21,44,0.75)), url('+e.target.result+')');
            //$("#form_bg_download").after("<div class=bg_example><img bgfile='"+html+"' class=bg_example_img src='backgrounds/"+html+"'><img bgfile='"+html+"' class=bg_example_cross src=img/cross.png></div>");
        },
        error: function (jqXHR, exception) {
            console.log(exception);
            console.log(jqXHR);
        }
    });
}
async function delBackground(bg) {
    const response = await fetch("/delbackground", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token
        },
        body: JSON.stringify({
            "bg": bg
        })

    });
    if (response.ok === true) {
        //const getData = await response.json();
        //background = getData;

        //var aa = JSON.parse(getData[0]);
        //const load_ch_coint = Object.getOwnPropertyNames(getData);


    }
}
function printMessages() {
    chat.forEach(function (item, i, arr) {
        addOneMessage(item);
    });
}
function clearChat() {
    count_view_mes = 0;
    $('#chat').html('');
}
function messageFormating(mes, ch_name) {
    if (this_chid != undefined) mes = mes.replaceAll("<", "&lt;").replaceAll(">", "&gt;");//for Chloe
    if (this_chid === undefined) {
        mes = mes.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br/>');

    } else {
        mes = converter.makeHtml(mes);
        mes = mes.replace(/\n/g, '<br/>');
    }


    if (ch_name !== name1) {
        mes = mes.replaceAll(name2 + ":", "");
    }
    return mes;
}
function addOneMessage(mes) {
    //var message = mes['mes'];
    //message = mes['mes'].replace(/^\s+/g, '');
    //console.log(message.indexOf(name1+":"));
    var messageText = mes['mes'];
    var characterName = name1;
    var avatarImg = "User Avatars/" + user_avatar;
    generatedPromtCache = '';
    //thisText = thisText.split("\n").join("<br>");
    var avatarImg = "User Avatars/" + user_avatar;
    if (!mes['is_user']) {
        if (this_chid == undefined) {
            avatarImg = "img/chloe.png";
        } else {
            if (characters[this_chid].avatar != 'none') {
                avatarImg = "characters/" + characters[this_chid].avatar;
                if (is_mes_reload_avatar !== false) {
                    avatarImg += "#" + is_mes_reload_avatar;
                    //console.log(avatarImg);
                }
            } else {
                avatarImg = "img/fluffy.png";
            }
        }
        characterName = name2;
    }

    //Formating
    //messageText = messageText.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>').replace(/\n/g, '<br/>');
    //if(characterName != name1){
    //messageText = messageText.replaceAll(name2+":", "");
    //}
    //console.log(messageText);
    if (count_view_mes == 0) {
        messageText = replacePlaceholders(messageText);
    }
    messageText = messageFormating(messageText, characterName);

    $("#chat").append("<div class='mes' mesid=" + count_view_mes + " ch_name=" + characterName + "><div class='for_checkbox'></div><input type='checkbox' class='del_checkbox'><div class=avatar><img src='" + avatarImg + "'></div><div class=mes_block><div class=ch_name>" + characterName + "<div title=Edit class=mes_edit><img src=img/scroll.png style='width:20px;height:20px;'></div><div class=mes_edit_cancel><img src=img/cancel.png></div><div class=mes_edit_done><img src=img/done.png></div></div><div class=mes_text>" + "</div></div></div>");

    if (!if_typing_text) {
        //console.log(messageText);
        $("#chat").children().filter('[mesid="' + count_view_mes + '"]').children('.mes_block').children('.mes_text').append(messageText);
    } else {
        typeWriter($("#chat").children().filter('[mesid="' + count_view_mes + '"]').children('.mes_block').children('.mes_text'), messageText, 50, 0);
    }
    count_view_mes++;
    if (!add_mes_without_animation) {
        $('#chat').children().last().css("opacity", 1.0);
        $('#chat').children().last().transition({
            opacity: 1.0,
            duration: 700,
            easing: "",
            complete: function () { }
        });
    } else {
        add_mes_without_animation = false;
    }
    var $textchat = $('#chat');
    $textchat.scrollTop($textchat[0].scrollHeight);
}
function typeWriter(target, text, speed, i) {
    if (i < text.length) {
        //target.append(text.charAt(i));
        target.html(target.html() + text.charAt(i));
        i++;
        setTimeout(() => typeWriter(target, text, speed, i), speed);
    }
}
function newMesPattern(name) { //Patern which denotes a new message
    name = name + ':';
    return name;
}

$("#send_but").click(function () {
    //$( "#send_but" ).css({"background": "url('img/load.gif')","background-size": "100%, 100%", "background-position": "center center"});
    if (is_send_press == false) {
        is_send_press = true;
        Generate();
    }
});
async function Generate(type) {
    tokens_already_generated = 0;
    message_already_generated = name2 + ': ';
    if (online_status != 'no_connection' && this_chid != undefined) {
        if (type != 'regenerate') {
            var textareaText = $("#send_textarea").val();
            $("#send_textarea").val('');

        } else {
            var textareaText = "";
            if (chat[chat.length - 1]['is_user']) {//If last message from You

            } else {
                chat.length = chat.length - 1;
                count_view_mes -= 1;
                $('#chat').children().last().remove();
                // We MUST remove the last message from the bot here as it's being regenerated.
                openai_msgs.pop();
            }
        }
        //$("#send_textarea").attr("disabled","disabled");

        //$("#send_textarea").blur();
        $("#send_but").css("display", "none");
        $("#loading_mes").css("display", "block");


        var storyString = "";
        var userSendString = "";
        var finalPromt = "";

        var postAnchorChar = "Elaborate speaker";//'Talk a lot with description what is going on around';// in asterisks
        var postAnchorStyle = "Writing style: very long messages";//"[Genre: roleplay chat][Tone: very long messages with descriptions]";


        var anchorTop = '';
        var anchorBottom = '';
        var topAnchorDepth = 8;

        if (character_anchor && !is_pygmalion) {
            if (anchor_order === 0) {
                anchorTop = `${name2}: ${postAnchorChar}`;
            } else {
                anchorBottom = `[${name2} ${postAnchorChar}]`
            }
        }
        if (style_anchor && !is_pygmalion) {
            if (anchor_order === 1) {
                anchorTop = postAnchorStyle;
            } else {
                anchorBottom = `[${postAnchorStyle}]`;
            }
        }


        //*********************************
        //PRE FORMATING STRING
        //*********************************
        if (textareaText != "") {

            chat[chat.length] = {};
            chat[chat.length - 1]['name'] = name1;
            chat[chat.length - 1]['is_user'] = true;
            chat[chat.length - 1]['is_name'] = true;
            chat[chat.length - 1]['send_date'] = Date.now();
            chat[chat.length - 1]['mes'] = textareaText;
            addOneMessage(chat[chat.length - 1]);
        }
        var chatString = '';
        var arrMes = [];
        var mesSend = [];
        var charDescription = $.trim(characters[this_chid].description);
        var charPersonality = $.trim(characters[this_chid].personality);
        var Scenario = $.trim(characters[this_chid].scenario);
        var mesExamples = $.trim(characters[this_chid].mes_example);
        var checkMesExample = $.trim(mesExamples.replace(/<START>/gi, ''));//for check length without tag
        if (checkMesExample.length == 0) mesExamples = '';
        var mesExamplesArray = [];
        //***Base replace***
        if (mesExamples !== undefined) {
            if (mesExamples.length > 0) {
                mesExamples = replacePlaceholders(mesExamples);
                //mesExamples = mesExamples.replaceAll('<START>', '[An example of how '+name2+' responds]');
                let blocks = mesExamples.split(/<START>/gi);
                mesExamplesArray = blocks.slice(1).map(block => `<START>\n${block.trim()}\n`);
            }
        }
        if (charDescription !== undefined) {
            if (charDescription.length > 0) {
                charDescription = replacePlaceholders(charDescription);
            }
        }
        if (charPersonality !== undefined) {
            if (charPersonality.length > 0) {
                charPersonality = replacePlaceholders(charPersonality);
            }
        }
        if (Scenario !== undefined) {
            if (Scenario.length > 0) {
                Scenario = replacePlaceholders(Scenario);
            }
        }

        if (charDescription.length > 0) {
            storyString = 'Description:\n' + charDescription.replace('\r\n', '\n') + '\n';
        }
        if (charPersonality.length > 0) {
            storyString += 'Personality:\n' + charPersonality.replace('\r\n', '\n') + '\n';
        }
        if (Scenario.length > 0) {
            storyString += 'Scenario:\n' + Scenario.replace('\r\n', '\n') + '\n';
        }


        var j = 0;
        // clean openai msgs
        openai_msgs = [];
        for (var i = chat.length - 1; i >= 0; i--) {
            // first greeting message
            if (j == 0) {
                chat[j]['mes'] = replacePlaceholders(chat[j]['mes']);
            }
            let role = chat[j]['is_user'] ? 'user' : 'assistant';
            let content = chat[j]['mes'];
            // Apply the "wrap in quotes" option
            if (role == 'user' && wrap_in_quotes) content = `"${content}"`;
            openai_msgs[i] = { "role": role, "content": content };
            j++;
        }

        let this_max_context = openai_max_context;

        var i = 0;

        // get a nice array of all blocks of all example messages = array of arrays (important!)
        openai_msgs_example = [];
        for (let k = 0; k < mesExamplesArray.length; k++) {
            let item = mesExamplesArray[k];
            // remove <START> {Example Dialogue:} and replace \r\n with just \n
            item = item.replace(/<START>/i, "{Example Dialogue:}").replace('\r\n', '\n');
            let parsed = parseExampleIntoIndividual(item);
            // add to the example message blocks array
            openai_msgs_example.push(parsed);
        }

        runGenerate();

        function runGenerate(cycleGenerationPromt = '') {
            generatedPromtCache += cycleGenerationPromt;
            if (generatedPromtCache.length == 0) {
                openai_msgs = openai_msgs.reverse();
                var is_add_personality = false;
                openai_msgs.forEach(function (msg, i, arr) {//For added anchors and others
                    let item = msg["content"];
                    if (i >= openai_msgs.length - 1 && $.trim(item).substr(0, (name1 + ":").length) != name1 + ":") {
                        if (textareaText == "") {
                            // TODO: Why is this needed? it removes the last letter
                            //item = item.substr(0, item.length - 1);
                        }
                    }
                    if (i === openai_msgs.length - topAnchorDepth && count_view_mes >= topAnchorDepth && !is_add_personality) {

                        is_add_personality = true;
                        //chatString = chatString.substr(0,chatString.length-1);
                        //anchorAndPersonality = "[Genre: roleplay chat][Tone: very long messages with descriptions]";
                        if ((anchorTop != "" || charPersonality != "")) {
                            if (anchorTop != "") charPersonality += ' ';
                            // todo: change to something else?
                            item = `[${name2} is ${charPersonality}${anchorTop}]\n${item}`;
                        }
                    }
                    if (i >= openai_msgs.length - 1 && count_view_mes > 8 && $.trim(item).substr(0, (name1 + ":").length) == name1 + ":") {//For add anchor in end
                        //not sure what these are for
                        //item = item.substr(0, item.length - 1);
                        //chatString+=postAnchor+"\n";//"[Writing style: very long messages]\n";
                        item = anchorBottom + "\n" + item;
                    }
                    msg["content"] = item;
                    openai_msgs[i] = msg;
                });
            }

            if (type == 'force_name2') {
                finalPromt += name2 + ':';
            }

            let nsfw_toggle_prompt = "";
            let enhance_definitions_prompt = "";

            if (nsfw_toggle) {
                nsfw_toggle_prompt = nsfw_prompt;
            } else {
                nsfw_toggle_prompt = "Avoid writing a NSFW/Smut reply. Creatively write around it NSFW/Smut scenarios in character.";
            }
            // Experimental but kinda works
            if (enhance_definitions) {
                enhance_definitions_prompt = "If you have more knowledge of " + name2 + ", add to the character's lore and personality to enhance them but keep the Character Sheet's definitions absolute.";
            }

            let whole_prompt = [];
            // If it's toggled, NSFW prompt goes first.
            if (nsfw_first) {
                whole_prompt = [nsfw_toggle_prompt, main_prompt, enhance_definitions_prompt, "\n\n", storyString]
            }
            else {
                whole_prompt = [main_prompt, nsfw_toggle_prompt, enhance_definitions_prompt, "\n\n", storyString]
            }
            
            // Join by a space and replace placeholders with real user/char names
            storyString = replacePlaceholders(whole_prompt.join(" "))

            let prompt_msg = { "role": "system", "content": storyString }
            let examples_tosend = [];
            let openai_msgs_tosend = [];

            // todo: static value, maybe include in the initial context calculation
            let new_chat_msg = { "role": "system", "content": "[Start a new chat]" };
            let start_chat_count = countTokens([new_chat_msg]);
            let total_count = countTokens([prompt_msg], true) + start_chat_count;


            // The user wants to always have all example messages in the context
            if (keep_example_dialogue) {
                // first we send *all* example messages
                // we don't check their token size since if it's bigger than the context, the user is fucked anyway
                // and should've have selected that option (maybe have some warning idk, too hard to add)
                for (let j = 0; j < openai_msgs_example.length; j++) {
                    // get the current example block with multiple user/bot messages
                    let example_block = openai_msgs_example[j];
                    // add the first message from the user to tell the model that it's a new dialogue
                    // TODO: instead of role user content use role system name example_user
                    // message from the user so the model doesn't confuse the context (maybe, I just think that this should be done)
                    if (example_block.length != 0) {
                        examples_tosend.push(new_chat_msg);
                    }
                    for (let k = 0; k < example_block.length; k++) {
                        // add all the messages from the example
                        examples_tosend.push(example_block[k]);
                    }
                }
                total_count += countTokens(examples_tosend);
                // go from newest message to oldest, because we want to delete the older ones from the context
                for (let j = openai_msgs.length - 1; j >= 0; j--) {
                    let item = openai_msgs[j];
                    let item_count = countTokens(item);
                    // If we have enough space for this message, also account for the max assistant reply size
                    if ((total_count + item_count) < (this_max_context - openai_max_tokens)) {
                        openai_msgs_tosend.push(item);
                        total_count += item_count;
                    }
                    else {
                        // early break since if we still have more messages, they just won't fit anyway
                        break;
                    }
                }
            } else {
                for (let j = openai_msgs.length - 1; j >= 0; j--) {
                    let item = openai_msgs[j];
                    let item_count = countTokens(item);
                    // If we have enough space for this message, also account for the max assistant reply size
                    if ((total_count + item_count) < (this_max_context - openai_max_tokens)) {
                        openai_msgs_tosend.push(item);
                        total_count += item_count;
                    }
                    else {
                        // early break since if we still have more messages, they just won't fit anyway
                        break;
                    }
                }
                console.log(total_count);
                // add example messages to the context by the block
                /*for (let j = 0; j < openai_msgs_example.length; j++) {
                    // get the current example block with multiple user/bot messages
                    let example_block = openai_msgs_example[j];
                    // add the first message from the user to tell the model that it's a new dialogue
                    // TODO: instead of role user content use role system name example_user
                    // message from the user so the model doesn't confuse the context (maybe, I just think that this should be done)
                    let example_count = countTokens(example_block) - 2; // -2 since start_chat_count accounted for the first message
                    if ((total_count + start_chat_count + example_count) < (this_max_context - openai_max_tokens)) {
                        openai_msgs_tosend.push({"role": "user", "content": "Start a new chat"});
                        for (let k = 0; k < example_block.length; k++) {
                            // add all the messages from the example
                            openai_msgs_tosend.push(example_block[k]);
                        }
                        total_count += start_chat_count + example_count;
                    }
                    else {break;}
                }*/
                for (let j = 0; j < openai_msgs_example.length; j++) {
                    // get the current example block with multiple user/bot messages
                    let example_block = openai_msgs_example[j];

                    for (let k = 0; k < example_block.length; k++) {
                        if (example_block.length == 0) { continue; }
                        let example_count = countTokens(example_block[k]);
                        // add all the messages from the example
                        if ((total_count + example_count + start_chat_count) < (this_max_context - openai_max_tokens)) {
                            if (k == 0) {
                                examples_tosend.push(new_chat_msg);
                                total_count += start_chat_count;
                            }
                            examples_tosend.push(example_block[k]);
                            total_count += example_count;
                        }
                        else { break; }
                    }
                }
            }
            // reverse the messages array because we had the newest at the top to remove the oldest,
            // now we want proper order
            openai_msgs_tosend.reverse();
            openai_msgs_tosend = [prompt_msg, ...examples_tosend, new_chat_msg, ...openai_msgs_tosend]

            console.log("We're sending this:")
            console.log(openai_msgs_tosend);
            console.log(`Calculated the total context to be ${total_count} tokens`);

            var this_settings = openai_settings[openai_setting_names[preset_settings_openai]];
            var generate_data = {
                "messages": openai_msgs_tosend,
                // todo: add setting for le custom model
                "model": "gpt-3.5-turbo-0301",
                "temperature": parseFloat(temp_openai),
                "frequency_penalty": parseFloat(freq_pen_openai),
                "presence_penalty": parseFloat(pres_pen_openai),
                "max_tokens": openai_max_tokens,
                "stream": stream_openai
            };

            var generate_url = '/generate_openai';
            var streaming = stream_openai;

            var last_view_mes = count_view_mes;
            jQuery.ajax({
                type: 'POST', // 
                url: generate_url, // 
                data: JSON.stringify(generate_data),
                beforeSend: function () {
                    //$('#create_button').attr('value','Creating...'); 
                },
                cache: false,
                dataType: streaming ? "text" : "json",
                contentType: "application/json",
                xhrFields: {
                    onprogress: function (e) {
                        if (!streaming)
                            return;
                        var response = e.currentTarget.response;
                        if (response == "{\"error\":true}") {
                            is_send_press = false;
                            $("#send_but").css("display", "block");
                            $("#loading_mes").css("display", "none");
                            return;
                        }

                        var eventList = response.split("\n");
                        var getMessage = "";
                        for (var event of eventList) {
                            if (!event.startsWith("data"))
                                continue;
                            if (event == "data: [DONE]") {
                                is_send_press = false;
                                chat[chat.length - 1]['mes'] = getMessage;
                                $("#send_but").css("display", "block");
                                $("#loading_mes").css("display", "none");
                                saveChat();
                                break;
                            }
                            var data = JSON.parse(event.substring(6));
                            // the first and last messages are undefined, protect against that
                            getMessage += data.choices[0]["delta"]["content"] || "";
                        }

                        if ($("#chat").children().filter('[mesid="' + last_view_mes + '"]').length == 0) {
                            chat[chat.length] = {};
                            chat[chat.length - 1]['name'] = name2;
                            chat[chat.length - 1]['is_user'] = false;
                            chat[chat.length - 1]['is_name'] = false;
                            chat[chat.length - 1]['send_date'] = Date.now();
                            chat[chat.length - 1]['mes'] = "";
                            addOneMessage(chat[chat.length - 1]);
                        }

                        getMessage = $.trim(getMessage);
                        var messageText = messageFormating(getMessage, name1);
                        $("#chat").children().filter('[mesid="' + last_view_mes + '"]').children('.mes_block').children('.mes_text').html(messageText);

                        var $textchat = $('#chat');
                        $textchat.scrollTop($textchat[0].scrollHeight);
                    }
                },
                success: function (data) {
                    if (streaming)
                        return;
                    is_send_press = false;
                    //$("#send_textarea").focus();
                    //$("#send_textarea").removeAttr('disabled');
                    if (data.error != true) {
                        //const getData = await response.json();
                        if (main_api == 'kobold') {
                            var getMessage = data.results[0].text;
                        }
                        if (main_api == 'novel') {
                            var getMessage = data.output;
                        }
                        if (main_api == 'openai') {
                            var getMessage = data.choices[0]["message"]["content"];
                        }


                        //Formating
                        getMessage = $.trim(getMessage);
                        if (is_pygmalion) {
                            getMessage = getMessage.replace(new RegExp('<USER>', "g"), name1);
                            getMessage = getMessage.replace(new RegExp('<BOT>', "g"), name2);
                            getMessage = getMessage.replace(new RegExp('You:', "g"), name1 + ':');
                        }
                        if (getMessage.indexOf(name1 + ":") != -1) {
                            getMessage = getMessage.substr(0, getMessage.indexOf(name1 + ":"));

                        }
                        if (getMessage.indexOf('<|endoftext|>') != -1) {
                            getMessage = getMessage.substr(0, getMessage.indexOf('<|endoftext|>'));

                        }
                        let this_mes_is_name = true;
                        if (getMessage.indexOf(name2 + ":") === 0) {
                            getMessage = getMessage.replace(name2 + ':', '');
                            getMessage = getMessage.trimStart();
                        } else {
                            this_mes_is_name = false;
                        }
                        if (type === 'force_name2') this_mes_is_name = true;
                        //getMessage = getMessage.replace(/^\s+/g, '');
                        if (getMessage.length > 0) {
                            chat[chat.length] = {};
                            chat[chat.length - 1]['name'] = name2;
                            chat[chat.length - 1]['is_user'] = false;
                            chat[chat.length - 1]['is_name'] = this_mes_is_name;
                            chat[chat.length - 1]['send_date'] = Date.now();
                            getMessage = $.trim(getMessage);
                            chat[chat.length - 1]['mes'] = getMessage;
                            addOneMessage(chat[chat.length - 1]);
                            $("#send_but").css("display", "block");
                            $("#loading_mes").css("display", "none");
                            saveChat();
                        } else {
                            //console.log('run force_name2 protocol');
                            Generate('force_name2');
                        }
                    } else {
                        $("#send_but").css("display", "block");
                        $("#loading_mes").css("display", "none");
                    }
                },
                error: function (jqXHR, exception) {
                    if (streaming) {
                        chat.length = chat.length - 1;
                        count_view_mes -= 1;
                        $('#chat').children().last().remove();
                    }
                    $("#send_textarea").removeAttr('disabled');
                    is_send_press = false;
                    $("#send_but").css("display", "block");
                    $("#loading_mes").css("display", "none");
                    console.log(exception);
                    console.log(jqXHR);
                }
            });
        }
    } else {
        if (this_chid == undefined) {
            //send ch sel
            popup_type = 'char_not_selected';
            callPopup('<h3>Сharacter is not selected</h3>');
        }
        is_send_press = false;
    }
}

async function saveChat() {
    chat.forEach(function (item, i) {
        if (item['is_user']) {
            var str = item['mes'].replace(name1 + ':', default_user_name + ':');
            chat[i]['mes'] = str;
            chat[i]['name'] = default_user_name;
        }
    });
    var save_chat = [{ user_name: default_user_name, character_name: name2, create_date: chat_create_date }, ...chat];

    jQuery.ajax({
        type: 'POST',
        url: '/savechat',
        data: JSON.stringify({ ch_name: characters[this_chid].name, file_name: characters[this_chid].chat, chat: save_chat, avatar_url: characters[this_chid].avatar }),
        beforeSend: function () {
            //$('#create_button').attr('value','Creating...'); 
        },
        cache: false,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {

        },
        error: function (jqXHR, exception) {

            console.log(exception);
            console.log(jqXHR);
        }
    });
}
async function getChat() {
    //console.log(characters[this_chid].chat);
    jQuery.ajax({
        type: 'POST',
        url: '/getchat',
        data: JSON.stringify({ ch_name: characters[this_chid].name, file_name: characters[this_chid].chat, avatar_url: characters[this_chid].avatar }),
        beforeSend: function () {
            //$('#create_button').attr('value','Creating...'); 
        },
        cache: false,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            //console.log(data);
            //chat.length = 0;
            if (data[0] !== undefined) {
                for (let key in data) {
                    chat.push(data[key]);
                }
                //chat =  data;
                chat_create_date = chat[0]['create_date'];
                chat.shift();

            } else {
                chat_create_date = Date.now();
            }
            //console.log(chat);
            getChatResult();
            saveChat();
        },
        error: function (jqXHR, exception) {
            getChatResult();
            console.log(exception);
            console.log(jqXHR);
        }
    });
}

function getChatResult() {
    name2 = characters[this_chid].name;
    if (chat.length > 1) {

        chat.forEach(function (item, i) {
            if (item['is_user']) {
                var str = item['mes'].replace(default_user_name + ':', name1 + ':');
                chat[i]['mes'] = str;
                chat[i]['name'] = name1;
            }
        });


    } else {
        //console.log(characters[this_chid].first_mes);
        chat[0] = {};
        chat[0]['name'] = name2;
        chat[0]['is_user'] = false;
        chat[0]['is_name'] = true;
        chat[0]['send_date'] = Date.now();
        if (characters[this_chid].first_mes != "") {
            chat[0]['mes'] = characters[this_chid].first_mes;
        } else {
            chat[0]['mes'] = default_ch_mes;
        }
    }
    printMessages();
    select_selected_character(this_chid);
}
$("#send_textarea").keypress(function (e) {
    if (e.which === 13 && !e.shiftKey && is_send_press == false) {
        is_send_press = true;
        e.preventDefault();
        Generate();
        //$(this).closest("form").submit();
    }
});

//menu buttons
var seleced_button_style = { color: "#bcc1c8" };
var deselected_button_style = { color: "#565d66" };
$("#rm_button_create").children("h2").css(seleced_button_style);
$("#rm_button_characters").children("h2").css(seleced_button_style);
$("#rm_button_settings").click(function () {
    selected_button = 'settings';
    menu_type = 'settings';
    $("#rm_charaters_block").css("display", "none");
    $("#rm_api_block").css("display", "block");

    $('#rm_api_block').css('opacity', 0.0);
    $('#rm_api_block').transition({
        opacity: 1.0,
        duration: animation_rm_duration,
        easing: animation_rm_easing,
        complete: function () { }
    });

    $("#rm_ch_create_block").css("display", "none");
    $("#rm_info_block").css("display", "none");

    $("#rm_button_characters").children("h2").css(deselected_button_style);
    $("#rm_button_settings").children("h2").css(seleced_button_style);
    $("#rm_button_selected_ch").children("h2").css(deselected_button_style);
});
$("#rm_button_characters").click(function () {
    selected_button = 'characters';
    select_rm_characters();
});
$("#rm_button_back").click(function () {
    selected_button = 'characters';
    select_rm_characters();
});
$("#rm_button_create").click(function () {
    selected_button = 'create';
    select_rm_create();
});
$("#rm_button_selected_ch").click(function () {
    selected_button = 'character_edit';
    select_selected_character(this_chid);
});
function select_rm_create() {
    menu_type = 'create';
    if (selected_button == 'create') {
        if (create_save_avatar != '') {
            $("#add_avatar_button").get(0).files = create_save_avatar;
            read_avatar_load($("#add_avatar_button").get(0));
        }

    }
    $("#rm_charaters_block").css("display", "none");
    $("#rm_api_block").css("display", "none");
    $("#rm_ch_create_block").css("display", "block");

    $('#rm_ch_create_block').css('opacity', 0.0);
    $('#rm_ch_create_block').transition({
        opacity: 1.0,
        duration: animation_rm_duration,
        easing: animation_rm_easing,
        complete: function () { }
    });
    $("#rm_info_block").css("display", "none");

    $("#delete_button_div").css("display", "none");
    $("#create_button").css("display", "block");
    $("#create_button").attr("value", "Create");
    $('#result_info').html('&nbsp;');
    $("#rm_button_characters").children("h2").css(deselected_button_style);
    $("#rm_button_settings").children("h2").css(deselected_button_style);
    $("#rm_button_selected_ch").children("h2").css(deselected_button_style);

    //create text poles
    $("#rm_button_back").css("display", "inline-block");
    $("#character_import_button").css("display", "inline-block");
    $("#character_popup_text_h3").text('Create character');
    $("#character_name_pole").val(create_save_name);
    $("#description_textarea").val(create_save_description);
    $("#personality_textarea").val(create_save_personality);
    $("#firstmessage_textarea").val(create_save_first_message);
    $("#scenario_pole").val(create_save_scenario);
    if ($.trim(create_save_mes_example).length == 0) {
        $("#mes_example_textarea").val('<START>');
    } else {
        $("#mes_example_textarea").val(create_save_mes_example);
    }
    $("#avatar_div").css("display", "block");
    $("#avatar_load_preview").attr('src', default_avatar);
    $("#name_div").css("display", "block");

    $("#form_create").attr("actiontype", "createcharacter");
}
function select_rm_characters() {

    menu_type = 'characters';
    $("#rm_charaters_block").css("display", "block");
    $('#rm_charaters_block').css('opacity', 0.0);
    $('#rm_charaters_block').transition({
        opacity: 1.0,
        duration: animation_rm_duration,
        easing: animation_rm_easing,
        complete: function () { }
    });

    $("#rm_api_block").css("display", "none");
    $("#rm_ch_create_block").css("display", "none");
    $("#rm_info_block").css("display", "none");

    $("#rm_button_characters").children("h2").css(seleced_button_style);
    $("#rm_button_settings").children("h2").css(deselected_button_style);
    $("#rm_button_selected_ch").children("h2").css(deselected_button_style);
}
function select_rm_info(text) {
    $("#rm_charaters_block").css("display", "none");
    $("#rm_api_block").css("display", "none");
    $("#rm_ch_create_block").css("display", "none");
    $("#rm_info_block").css("display", "flex");

    $("#rm_info_text").html('<h3>' + text + '</h3>');

    $("#rm_button_characters").children("h2").css(deselected_button_style);
    $("#rm_button_settings").children("h2").css(deselected_button_style);
    $("#rm_button_selected_ch").children("h2").css(deselected_button_style);
}

function select_selected_character(chid) { //character select

    select_rm_create();
    menu_type = 'character_edit';
    $("#delete_button_div").css("display", "block");
    $("#rm_button_selected_ch").children("h2").css(seleced_button_style);
    var display_name = characters[chid].name;

    $("#rm_button_selected_ch").children("h2").text(display_name);

    //create text poles
    $("#rm_button_back").css("display", "none");
    //$("#character_import_button").css("display", "none");
    $("#create_button").attr("value", "Save");
    $("#create_button").css("display", "none");
    var i = 0;
    while ($("#rm_button_selected_ch").width() > 170 && i < 100) {
        display_name = display_name.slice(0, display_name.length - 2);
        //console.log(display_name);
        $("#rm_button_selected_ch").children("h2").text($.trim(display_name) + '...');
        i++;
    }
    $("#add_avatar_button").val('');

    $('#character_popup_text_h3').text(characters[chid].name);
    $("#character_name_pole").val(characters[chid].name);
    $("#description_textarea").val(characters[chid].description);
    $("#personality_textarea").val(characters[chid].personality);
    $("#firstmessage_textarea").val(characters[chid].first_mes);
    $("#scenario_pole").val(characters[chid].scenario);
    $("#mes_example_textarea").val(characters[chid].mes_example);
    $("#selected_chat_pole").val(characters[chid].chat);
    $("#create_date_pole").val(characters[chid].create_date);
    $("#avatar_url_pole").val(characters[chid].avatar);
    $("#chat_import_avatar_url").val(characters[chid].avatar);
    $("#chat_import_character_name").val(characters[chid].name);
    //$("#avatar_div").css("display", "none");
    var this_avatar = default_avatar;
    if (characters[chid].avatar != 'none') {
        this_avatar = "characters/" + characters[chid].avatar;
    }
    $("#avatar_load_preview").attr('src', this_avatar + "#" + Date.now());
    $("#name_div").css("display", "none");

    $("#form_create").attr("actiontype", "editcharacter");
}
$(document).on('click', '.character_select', function () {
    if (this_chid !== $(this).attr("chid")) {
        if (!is_send_press) {
            this_edit_mes_id = undefined;
            selected_button = 'character_edit';
            this_chid = $(this).attr("chid");
            clearChat();
            chat.length = 0;
            getChat();

        }
    } else {
        selected_button = 'character_edit';
        select_selected_character(this_chid);
    }

});
var scroll_holder = 0;
var is_use_scroll_holder = false;
$(document).on('input', '.edit_textarea', function () {
    scroll_holder = $("#chat").scrollTop();
    $(this).height(0).height(this.scrollHeight);
    is_use_scroll_holder = true;
});
$("#chat").on("scroll", function () {
    if (is_use_scroll_holder) {
        $("#chat").scrollTop(scroll_holder);
        is_use_scroll_holder = false;
    }

});
$(document).on('click', '.del_checkbox', function () {
    $('.del_checkbox').each(function () {
        $(this).prop("checked", false);
        $(this).parent().css('background', css_mes_bg);
    });
    $(this).parent().css('background', "#791b31");
    var i = $(this).parent().attr('mesid');
    this_del_mes = i;
    while (i < chat.length) {
        $(".mes[mesid='" + i + "']").css('background', "#791b31");
        $(".mes[mesid='" + i + "']").children('.del_checkbox').prop("checked", true);
        i++;
        //console.log(i);
    }

});
$(document).on('click', '#user_avatar_block .avatar', function () {
    user_avatar = $(this).attr("imgfile");
    $('.mes').each(function () {
        if ($(this).attr('ch_name') == name1) {
            $(this).children('.avatar').children('img').attr('src', 'User Avatars/' + user_avatar);
        }
    });
    saveSettings();

});
$('#logo_block').click(function (event) {
    if (!bg_menu_toggle) {
        $('#bg_menu_button').transition({ perspective: '100px', rotate3d: '1,1,0,180deg' });
        //$('#bg_menu_content1').css('display', 'block');
        //$('#bg_menu_content1').css('opticary', 0);marginTop: '10px'
        $('#bg_menu_content').transition({
            opacity: 1.0, height: '90vh',
            duration: 340,
            easing: 'in',
            complete: function () { bg_menu_toggle = true; $('#bg_menu_content').css("overflow-y", "auto"); }
        });
    } else {
        $('#bg_menu_button').transition({ perspective: '100px', rotate3d: '1,1,0,360deg' });
        $('#bg_menu_content').css("overflow-y", "hidden");
        $('#bg_menu_content').transition({

            opacity: 0.0, height: '0px',
            duration: 340,
            easing: 'in',
            complete: function () { bg_menu_toggle = false; }
        });
    }
});
$(document).on('click', '.bg_example_img', function () {
    var this_bgfile = $(this).attr("bgfile");

    if (bg1_toggle == true) {
        bg1_toggle = false;
        var number_bg = 2;
        var target_opacity = 1.0;
    } else {
        bg1_toggle = true;
        var number_bg = 1;
        var target_opacity = 0.0;
    }
    $('#bg2').stop();
    $('#bg2').transition({
        opacity: target_opacity,
        duration: 1300,//animation_rm_duration,
        easing: "linear",
        complete: function () {
            $("#options").css('display', 'none');
        }
    });
    $('#bg' + number_bg).css('background-image', 'linear-gradient(rgba(19,21,44,0.75), rgba(19,21,44,0.75)), url("backgrounds/' + this_bgfile + '")');
    setBackground(this_bgfile);

});
$(document).on('click', '.bg_example_cross', function () {
    bg_file_for_del = $(this);
    //$(this).parent().remove();
    //delBackground(this_bgfile);
    popup_type = 'del_bg';
    callPopup('<h3>Delete the background?</h3>');

});
$("#advedit_btn").click(function () {
    if (!is_advanced_char_open) {
        is_advanced_char_open = true;
        $('#character_popup').css('display', 'grid');
        $('#character_popup').css('opacity', 0.0);
        $('#character_popup').transition({ opacity: 1.0, duration: animation_rm_duration, easing: animation_rm_easing });
    } else {
        is_advanced_char_open = false;
        $('#character_popup').css('display', 'none');
    }
});
$("#character_cross").click(function () {
    is_advanced_char_open = false;
    $('#character_popup').css('display', 'none');
});
$("#character_popup_ok").click(function () {
    is_advanced_char_open = false;
    $('#character_popup').css('display', 'none');
});

$("#dialogue_popup_ok").click(function () {
    $("#shadow_popup").css('display', 'none');
    $("#shadow_popup").css('opacity:', 0.0);
    if (popup_type == 'del_bg') {
        delBackground(bg_file_for_del.attr("bgfile"));
        bg_file_for_del.parent().remove();
    }
    if (popup_type == 'del_ch') {
        var msg = jQuery('#form_create').serialize(); // ID form
        jQuery.ajax({
            method: 'POST',
            url: '/deletecharacter',
            beforeSend: function () {
                select_rm_info("Character deleted");

                //$('#create_button').attr('value','Deleting...'); 
            },
            data: msg,
            cache: false,
            success: function (html) {
                location.reload();
                //getCharacters();
                //$('#create_button_div').html(html);  
            }
        });
    }
    if (popup_type == 'new_chat' && this_chid != undefined && menu_type != "create") {//Fix it; New chat doesn't create while open create character menu
        clearChat();
        chat.length = 0;
        characters[this_chid].chat = Date.now();
        $("#selected_chat_pole").val(characters[this_chid].chat);
        timerSaveEdit = setTimeout(() => { $("#create_button").click(); }, durationSaveEdit);
        getChat();

    }
});
$("#dialogue_popup_cancel").click(function () {
    $("#shadow_popup").css('display', 'none');
    $("#shadow_popup").css('opacity:', 0.0);
    popup_type = '';
});
function callPopup(text) {
    $("#dialogue_popup_cancel").css("display", "inline-block");
    switch (popup_type) {

        case 'char_not_selected':
            $("#dialogue_popup_ok").css("background-color", "#191b31CC");
            $("#dialogue_popup_ok").text("Ok");
            $("#dialogue_popup_cancel").css("display", "none");
            break;

        case 'new_chat':

            $("#dialogue_popup_ok").css("background-color", "#191b31CC");
            $("#dialogue_popup_ok").text("Yes");
            break;
        default:
            $("#dialogue_popup_ok").css("background-color", "#791b31");
            $("#dialogue_popup_ok").text("Delete");

    }
    $("#dialogue_popup_text").html(text);
    $("#shadow_popup").css('display', 'block');
    $('#shadow_popup').transition({ opacity: 1.0, duration: animation_rm_duration, easing: animation_rm_easing });
}

function read_bg_load(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#bg_load_preview')
                .attr('src', e.target.result)
                .width(103)
                .height(83);

            var formData = new FormData($("#form_bg_download").get(0));

            //console.log(formData);
            jQuery.ajax({
                type: 'POST',
                url: '/downloadbackground',
                data: formData,
                beforeSend: function () {
                    //$('#create_button').attr('value','Creating...'); 
                },
                cache: false,
                contentType: false,
                processData: false,
                success: function (html) {
                    setBackground(html);
                    if (bg1_toggle == true) {
                        bg1_toggle = false;
                        var number_bg = 2;
                        var target_opacity = 1.0;
                    } else {
                        bg1_toggle = true;
                        var number_bg = 1;
                        var target_opacity = 0.0;
                    }
                    $('#bg2').transition({
                        opacity: target_opacity,
                        duration: 1300,//animation_rm_duration,
                        easing: "linear",
                        complete: function () {
                            $("#options").css('display', 'none');
                        }
                    });
                    $('#bg' + number_bg).css('background-image', 'linear-gradient(rgba(19,21,44,0.75), rgba(19,21,44,0.75)), url(' + e.target.result + ')');
                    $("#form_bg_download").after("<div class=bg_example><img bgfile='" + html + "' class=bg_example_img src='backgrounds/" + html + "'><img bgfile='" + html + "' class=bg_example_cross src=img/cross.png></div>");
                },
                error: function (jqXHR, exception) {
                    console.log(exception);
                    console.log(jqXHR);
                }
            });

        };

        reader.readAsDataURL(input.files[0]);
    }
}
$("#add_bg_button").change(function () {
    read_bg_load(this);

});
function read_avatar_load(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        if (selected_button == 'create') {
            create_save_avatar = input.files;
        }
        reader.onload = function (e) {

            if (selected_button == 'character_edit') {

                timerSaveEdit = setTimeout(() => { $("#create_button").click(); }, durationSaveEdit);
            }
            $('#avatar_load_preview')
                .attr('src', e.target.result);
            //.width(103)
            //.height(83);
            //console.log(e.target.result.name);   

        };

        reader.readAsDataURL(input.files[0]);
    }
}
$("#add_avatar_button").change(function () {
    is_mes_reload_avatar = Date.now();
    read_avatar_load(this);
});
$("#form_create").submit(function (e) {
    $('#rm_info_avatar').html('');
    var formData = new FormData($("#form_create").get(0));
    if ($("#form_create").attr("actiontype") == "createcharacter") {

        if ($("#character_name_pole").val().length > 0) {
            jQuery.ajax({
                type: 'POST',
                url: '/createcharacter',
                data: formData,
                beforeSend: function () {
                    $('#create_button').attr('disabled', true);
                    $('#create_button').attr('value', 'Creating...');
                },
                cache: false,
                contentType: false,
                processData: false,
                success: function (html) {
                    $('#character_cross').click();
                    $("#character_name_pole").val('');
                    create_save_name = '';
                    $("#description_textarea").val('');
                    create_save_description = '';
                    $("#personality_textarea").val('');
                    create_save_personality = '';
                    $("#firstmessage_textarea").val('');
                    create_save_first_message = '';

                    $("#character_popup_text_h3").text('Create character');

                    $("#scenario_pole").val('');
                    create_save_scenario = '';
                    $("#mes_example_textarea").val('');
                    create_save_mes_example = '';

                    create_save_avatar = '';

                    $('#create_button').removeAttr("disabled");
                    $("#add_avatar_button").replaceWith($("#add_avatar_button").val('').clone(true));
                    $('#create_button').attr('value', 'Create');
                    if (true) {
                        $('#rm_info_block').transition({ opacity: 0, duration: 0 });
                        var $prev_img = $('#avatar_div_div').clone();
                        $('#rm_info_avatar').append($prev_img);
                        select_rm_info("Character created");

                        $('#rm_info_block').transition({ opacity: 1.0, duration: 2000 });
                        getCharacters();
                    } else {
                        $('#result_info').html(html);
                    }
                },
                error: function (jqXHR, exception) {
                    $('#create_button').removeAttr("disabled");
                }
            });
        } else {
            $('#result_info').html("Name not entered");
        }
    } else {
        //console.log($("#add_avatar_button").val());
        jQuery.ajax({
            type: 'POST',
            url: '/editcharacter',
            data: formData,
            beforeSend: function () {
                $('#create_button').attr('disabled', true);
                $('#create_button').attr('value', 'Save');
            },
            cache: false,
            contentType: false,
            processData: false,
            success: function (html) {

                $('.mes').each(function () {
                    if ($(this).attr('ch_name') != name1) {
                        $(this).children('.avatar').children('img').attr('src', $('#avatar_load_preview').attr('src'));
                    }
                });
                if (chat.length === 1) {

                    var this_ch_mes = default_ch_mes;
                    if ($('#firstmessage_textarea').val() != "") {
                        this_ch_mes = $('#firstmessage_textarea').val();
                    }
                    if (this_ch_mes != $.trim($("#chat").children('.mes').children('.mes_block').children('.mes_text').text())) {
                        clearChat();
                        chat.length = 0;
                        chat[0] = {};
                        chat[0]['name'] = name2;
                        chat[0]['is_user'] = false;
                        chat[0]['is_name'] = true;
                        chat[0]['mes'] = this_ch_mes;
                        add_mes_without_animation = true;
                        addOneMessage(chat[0]);
                    }
                }
                $('#create_button').removeAttr("disabled");
                getCharacters();


                $("#add_avatar_button").replaceWith($("#add_avatar_button").val('').clone(true));
                $('#create_button').attr('value', 'Save');
            },
            error: function (jqXHR, exception) {
                $('#create_button').removeAttr("disabled");
                $('#result_info').html("<font color=red>Error: no connection</font>");
            }
        });
    }

});

$("#tcount_btn").click(function() {
    function getTokensForPart(text) {
        let msg = {"role": "system", content: text.replace("\r\n", "\n")};
        let result = countTokens(msg) - 4 - 1;
        return result;
    }
    let desc_tokens = getTokensForPart(characters[this_chid].description);
    let pers_tokens = getTokensForPart(characters[this_chid].personality);
    let scen_tokens = getTokensForPart(characters[this_chid].scenario);
    let first_msg_tokens = getTokensForPart(replacePlaceholders(characters[this_chid].first_mes));
    
    // ugly but that's what we have, have to replicate the normal example message parsing code
    let blocks = replacePlaceholders(characters[this_chid].mes_example).split(/<START>/gi);
    let example_msgs_array = blocks.slice(1).map(block => `<START>\n${block.trim()}\n`);
    let exmp_tokens = 0;
    let block_count = 0;
    let msg_count = 0;
    for (var block of example_msgs_array) {
        block_count++;

        let example_blocks = parseExampleIntoIndividual(block);
    
        for (var block of example_blocks) {
            exmp_tokens += countTokens(block);
            msg_count++;
        }
    }
    let count_tokens = desc_tokens + pers_tokens + scen_tokens + exmp_tokens;

    let message_text = `Found ${block_count} example message blocks with ${msg_count} messages in total (${exmp_tokens} tokens)`;
    let res_str = `Total: ${count_tokens} tokens. Description: ${desc_tokens}.\nPersonality: ${pers_tokens}. Scenario: ${scen_tokens}.\n${message_text}\nFirst message tokens (not included in the total): ${first_msg_tokens}`;


    if (count_tokens < 1024) {
        $('#result_info').html(res_str);
    } else {
        $('#result_info').html("<font color=red>" + res_str + " Tokens (Too many tokens, consider reducing character definition)</font>");
    }

});

$("#delete_button").click(function () {
    popup_type = 'del_ch';
    callPopup('<h3>Delete the character?</h3>');
});
$("#rm_info_button").click(function () {
    $('#rm_info_avatar').html('');
    select_rm_characters();
});
//@@@@@@@@@@@@@@@@@@@@@@@@
//character text poles creating and editing save
$('#character_name_pole').on('change keyup paste', function () {
    if (menu_type == 'create') {
        create_save_name = $('#character_name_pole').val();
    }

});
$('#description_textarea').on('keyup paste cut', function () {//change keyup paste cut
    if (menu_type == 'create') {
        create_save_description = $('#description_textarea').val();
    } else {
        timerSaveEdit = setTimeout(() => { $("#create_button").click(); }, durationSaveEdit);
    }

});
$('#personality_textarea').on('keyup paste cut', function () {
    if (menu_type == 'create') {

        create_save_personality = $('#personality_textarea').val();
    } else {
        timerSaveEdit = setTimeout(() => { $("#create_button").click(); }, durationSaveEdit);
    }
});
$('#scenario_pole').on('keyup paste cut', function () {
    if (menu_type == 'create') {

        create_save_scenario = $('#scenario_pole').val();
    } else {
        timerSaveEdit = setTimeout(() => { $("#create_button").click(); }, durationSaveEdit);
    }
});
$('#mes_example_textarea').on('keyup paste cut', function () {
    if (menu_type == 'create') {

        create_save_mes_example = $('#mes_example_textarea').val();
    } else {
        timerSaveEdit = setTimeout(() => { $("#create_button").click(); }, durationSaveEdit);
    }
});
$('#firstmessage_textarea').on('keyup paste cut', function () {

    if (menu_type == 'create') {
        create_save_first_message = $('#firstmessage_textarea').val();
    } else {
        timerSaveEdit = setTimeout(() => { $("#create_button").click(); }, durationSaveEdit);
    }
});
$("#api_button").click(function () {
    if ($('#api_url_text').val() != '') {
        $("#api_loading").css("display", 'inline-block');
        $("#api_button").css("display", 'none');
        api_server = $('#api_url_text').val();
        api_server = $.trim(api_server);
        //console.log("1: "+api_server);
        if (api_server.substr(api_server.length - 1, 1) == "/") {
            api_server = api_server.substr(0, api_server.length - 1);
        }
        if (!(api_server.substr(api_server.length - 3, 3) == "api" || api_server.substr(api_server.length - 4, 4) == "api/")) {
            api_server = api_server + "/api";
        }
        //console.log("2: "+api_server);
        saveSettings();
        is_get_status = true;
        is_api_button_press = true;
        getStatus();
    }
});

$("body").click(function () {
    if ($("#options").css('opacity') == 1.0) {
        $('#options').transition({
            opacity: 0.0,
            duration: 100,//animation_rm_duration,
            easing: animation_rm_easing,
            complete: function () {
                $("#options").css('display', 'none');
            }
        });
    }
});
$("#options_button").click(function () {
    if ($("#options").css('display') === 'none' && $("#options").css('opacity') == 0.0) {
        $("#options").css('display', 'block');
        $('#options').transition({
            opacity: 1.0,
            duration: 100,
            easing: animation_rm_easing,
            complete: function () {

            }
        });
    }
});
$("#option_select_chat").click(function () {
    if (this_chid != undefined && !is_send_press) {
        getAllCharaChats();
        $('#shadow_select_chat_popup').css('display', 'block');
        $('#shadow_select_chat_popup').css('opacity', 0.0);
        $('#shadow_select_chat_popup').transition({ opacity: 1.0, duration: animation_rm_duration, easing: animation_rm_easing });
    }
});
$("#option_start_new_chat").click(function () {
    if (this_chid != undefined && !is_send_press) {
        popup_type = 'new_chat';
        callPopup('<h3>Start new chat?</h3>');
    }
});
$("#option_regenerate").click(function () {
    if (is_send_press == false) {
        is_send_press = true;
        Generate('regenerate');
    }
});
$("#option_delete_mes").click(function () {
    if (this_chid != undefined && !is_send_press) {
        $('#dialogue_del_mes').css('display', 'block');
        $('#send_form').css('display', 'none');
        $('.del_checkbox').each(function () {
            if ($(this).parent().attr('mesid') != 0) {
                $(this).css("display", "block");
                $(this).parent().children('.for_checkbox').css('display', 'none');
            }
        });
    }
});
$("#dialogue_del_mes_cancel").click(function () {
    $('#dialogue_del_mes').css('display', 'none');
    $('#send_form').css('display', css_send_form_display);
    $('.del_checkbox').each(function () {
        $(this).css("display", "none");
        $(this).parent().children('.for_checkbox').css('display', 'block');
        $(this).parent().css('background', css_mes_bg);
        $(this).prop("checked", false);

    });
    this_del_mes = 0;

});
$("#dialogue_del_mes_ok").click(function () {
    $('#dialogue_del_mes').css('display', 'none');
    $('#send_form').css('display', css_send_form_display);
    $('.del_checkbox').each(function () {
        $(this).css("display", "none");
        $(this).parent().children('.for_checkbox').css('display', 'block');
        $(this).parent().css('background', css_mes_bg);
        $(this).prop("checked", false);


    });
    if (this_del_mes != 0) {
        $(".mes[mesid='" + this_del_mes + "']").nextAll('div').remove();
        $(".mes[mesid='" + this_del_mes + "']").remove();
        chat.length = this_del_mes;
        count_view_mes = this_del_mes;
        saveChat();
        var $textchat = $('#chat');
        $textchat.scrollTop($textchat[0].scrollHeight);
    }
    this_del_mes = 0;


});


var no_placeholders_warning = false;
$("#save_prompts").click(function () {
    // Apparently is_send_press is used when the user is waiting for generation to complete.
    if (is_send_press) return;

    let new_main_prompt = $('#main_prompt_textarea').val();
    let new_nsfw_prompt = $('#nsfw_prompt_textarea').val();

    // Warn the user once if they don't have the {{char}} and {{user}} placeholders in the prompt.
    if (!(new_main_prompt.includes("{{char}}") && new_main_prompt.includes("{{user}}"))) {
        if (!no_placeholders_warning) {
            no_placeholders_warning = true;
            alert("Make sure you have the {{char}} and {{user}} placeholders in your main prompt. If you don't want to include them, simply ignore this warning, it won't appear again.");
            return;
        }
    }
    main_prompt = new_main_prompt;
    nsfw_prompt = new_nsfw_prompt;
    saveSettings();
});

$("#settings_perset").change(function () {

    if ($('#settings_perset').find(":selected").val() != 'gui') {
        preset_settings = $('#settings_perset').find(":selected").text();
        temp = koboldai_settings[koboldai_setting_names[preset_settings]].temp;
        amount_gen = koboldai_settings[koboldai_setting_names[preset_settings]].genamt;
        rep_pen = koboldai_settings[koboldai_setting_names[preset_settings]].rep_pen;
        rep_pen_size = koboldai_settings[koboldai_setting_names[preset_settings]].rep_pen_range;
        max_context = koboldai_settings[koboldai_setting_names[preset_settings]].max_length;
        openai_max_context = koboldai_settings[koboldai_setting_names[preset_settings]].max_length;
        $('#temp').val(temp);
        $('#temp_counter').html(temp);

        $('#amount_gen').val(amount_gen);
        $('#amount_gen_counter').html(amount_gen);

        $('#max_context').val(max_context);
        $('#max_context_counter').html(max_context + " Tokens");

        $('#openai_max_context').val(openai_max_context);
        $('#openai_max_context_counter').html(openai_max_context + " Tokens");

        $('#rep_pen').val(rep_pen);
        $('#rep_pen_counter').html(rep_pen);

        $('#rep_pen_size').val(rep_pen_size);
        $('#rep_pen_size_counter').html(rep_pen_size + " Tokens");

        $("#range_block").children().prop("disabled", false);
        $("#range_block").css('opacity', 1.0);
        $("#amount_gen_block").children().prop("disabled", false);
        $("#amount_gen_block").css('opacity', 1.0);

    } else {
        //$('.button').disableSelection();
        preset_settings = 'gui';
        $("#range_block").children().prop("disabled", true);
        $("#range_block").css('opacity', 0.5);
        $("#amount_gen_block").children().prop("disabled", true);
        $("#amount_gen_block").css('opacity', 0.45);
    }
    saveSettings();
});
$("#settings_perset_novel").change(function () {

    preset_settings_novel = $('#settings_perset_novel').find(":selected").text();
    temp_novel = novelai_settings[novelai_setting_names[preset_settings_novel]].temperature;
    //amount_gen = koboldai_settings[koboldai_setting_names[preset_settings]].genamt;
    rep_pen_novel = novelai_settings[novelai_setting_names[preset_settings_novel]].repetition_penalty;
    rep_pen_size_novel = novelai_settings[novelai_setting_names[preset_settings_novel]].repetition_penalty_range;
    $('#temp_novel').val(temp_novel);
    $('#temp_counter_novel').html(temp_novel);

    //$('#amount_gen').val(amount_gen);
    //$('#amount_gen_counter').html(amount_gen);

    $('#rep_pen_novel').val(rep_pen_novel);
    $('#rep_pen_counter_novel').html(rep_pen_novel);

    $('#rep_pen_size_novel').val(rep_pen_size_novel);
    $('#rep_pen_size_counter_novel').html(rep_pen_size_novel + " Tokens");

    //$("#range_block").children().prop("disabled", false);
    //$("#range_block").css('opacity',1.0);
    saveSettings();
});
$("#settings_perset_openai").change(function () {
    preset_settings_openai = $('#settings_perset_openai').find(":selected").text();

    temp_openai = openai_settings[openai_setting_names[preset_settings_openai]].temperature;
    freq_pen_openai = openai_settings[openai_setting_names[preset_settings_openai]].frequency_penalty;
    pres_pen_openai = openai_settings[openai_setting_names[preset_settings_openai]].presence_penalty;

    $('#temp_openai').val(temp_openai);
    $('#temp_counter_openai').html(temp_openai);
    $('#freq_pen_openai').val(freq_pen_openai);
    $('#freq_pen_counter_openai').html(freq_pen_openai);
    $('#pres_pen_openai').val(pres_pen_openai);
    $('#pres_pen_counter_openai').html(pres_pen_openai);

    saveSettings();
});
$("#main_api").change(function () {
    is_pygmalion = false;
    is_get_status = false;
    is_get_status_novel = false;
    is_get_status_openai = false;
    online_status = 'no_connection';
    checkOnlineStatus();
    changeMainAPI();
    saveSettings();
});
function changeMainAPI() {
    if ($('#main_api').find(":selected").val() == 'kobold') {
        $('#kobold_api').css("display", "block");
        $('#novel_api').css("display", "none");
        $('#openai_api').css("display", "none");
        $('#openai_max_context_block').css("display", "none");
        $('#tweak_hr').css("display", "none");
        $('#tweak_container').css("display", "none");
        main_api = 'kobold';
        $('#max_context_block').css('display', 'block');
        $('#amount_gen_block').css('display', 'block');
    }
    if ($('#main_api').find(":selected").val() == 'novel') {
        $('#kobold_api').css("display", "none");
        $('#novel_api').css("display", "block");
        $('#openai_api').css("display", "none");
        $('#openai_max_context_block').css("display", "none");
        $('#tweak_hr').css("display", "none");
        $('#tweak_container').css("display", "none");
        main_api = 'novel';
        $('#max_context_block').css('display', 'none');
        $('#amount_gen_block').css('display', 'none');
    }
    if ($('#main_api').find(":selected").val() == 'openai') {
        $('#kobold_api').css("display", "none");
        $('#novel_api').css("display", "none");
        $('#openai_api').css("display", "block");
        $('#openai_max_context_block').css("display", "block");
        $('#tweak_hr').css("display", "block");
        $('#tweak_container').css("display", "block");
        main_api = 'openai';
        $('#max_context_block').css('display', 'none');
        $('#amount_gen_block').css('display', 'none');
    }
}
async function getUserAvatars() {
    const response = await fetch("/getuseravatars", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": token
        },
        body: JSON.stringify({
            "": ""
        })

    });
    if (response.ok === true) {
        const getData = await response.json();
        //background = getData;
        //console.log(getData.length);
        for (var i = 0; i < getData.length; i++) {
            //console.log(1);
            $("#user_avatar_block").append('<div imgfile="' + getData[i] + '" class=avatar><img src="User Avatars/' + getData[i] + '" width=60px height=120px></div>');
        }
        //var aa = JSON.parse(getData[0]);
        //const load_ch_coint = Object.getOwnPropertyNames(getData);


    }
}


$(document).on('input', '#temp', function () {
    temp = $(this).val();
    if (isInt(temp)) {
        $('#temp_counter').html($(this).val() + ".00");
    } else {
        $('#temp_counter').html($(this).val());
    }
    var tempTimer = setTimeout(saveSettings, 500);
});
$(document).on('input', '#amount_gen', function () {
    amount_gen = $(this).val();
    $('#amount_gen_counter').html($(this).val());
    var amountTimer = setTimeout(saveSettings, 500);
});
$(document).on('input', '#max_context', function () {
    max_context = parseInt($(this).val());
    $('#max_context_counter').html($(this).val() + ' Tokens');
    var max_contextTimer = setTimeout(saveSettings, 500);
});
$('#style_anchor').change(function () {
    style_anchor = !!$('#style_anchor').prop('checked');
    saveSettings();
});
$('#character_anchor').change(function () {
    character_anchor = !!$('#character_anchor').prop('checked');
    saveSettings();
});
$(document).on('input', '#rep_pen', function () {
    rep_pen = $(this).val();
    if (isInt(rep_pen)) {
        $('#rep_pen_counter').html($(this).val() + ".00");
    } else {
        $('#rep_pen_counter').html($(this).val());
    }
    var repPenTimer = setTimeout(saveSettings, 500);
});
$(document).on('input', '#rep_pen_size', function () {
    rep_pen_size = $(this).val();
    $('#rep_pen_size_counter').html($(this).val() + " Tokens");
    var repPenSizeTimer = setTimeout(saveSettings, 500);
});

//Novel
$(document).on('input', '#temp_novel', function () {
    temp_novel = $(this).val();

    if (isInt(temp_novel)) {
        $('#temp_counter_novel').html($(this).val() + ".00");
    } else {
        $('#temp_counter_novel').html($(this).val());
    }
    var tempTimer_novel = setTimeout(saveSettings, 500);
});
$(document).on('input', '#rep_pen_novel', function () {
    rep_pen_novel = $(this).val();
    if (isInt(rep_pen_novel)) {
        $('#rep_pen_counter_novel').html($(this).val() + ".00");
    } else {
        $('#rep_pen_counter_novel').html($(this).val());
    }
    var repPenTimer_novel = setTimeout(saveSettings, 500);
});
$(document).on('input', '#rep_pen_size_novel', function () {
    rep_pen_size_novel = $(this).val();
    $('#rep_pen_size_counter_novel').html($(this).val() + " Tokens");
    var repPenSizeTimer_novel = setTimeout(saveSettings, 500);
});

//OpenAi
$(document).on('input', '#temp_openai', function () {
    temp_openai = $(this).val();

    if (isInt(temp_openai)) {
        $('#temp_counter_openai').html($(this).val() + ".00");
    } else {
        $('#temp_counter_openai').html($(this).val());
    }
    var tempTimer_openai = setTimeout(saveSettings, 500);
});
$(document).on('input', '#freq_pen_openai', function () {
    freq_pen_openai = $(this).val();
    if (isInt(freq_pen_openai)) {
        $('#freq_pen_counter_openai').html($(this).val() + ".00");
    } else {
        $('#freq_pen_counter_openai').html($(this).val());
    }
    var freqPenTimer_openai = setTimeout(saveSettings, 500);
});
$(document).on('input', '#pres_pen_openai', function () {
    pres_pen_openai = $(this).val();
    if (isInt(pres_pen_openai)) {
        $('#pres_pen_counter_openai').html($(this).val() + ".00");
    } else {
        $('#pres_pen_counter_openai').html($(this).val());
    }
    var presPenTimer_openai = setTimeout(saveSettings, 500);
});
$(document).on('input', '#openai_max_context', function () {
    openai_max_context = parseInt($(this).val());
    $('#openai_max_context_counter').html($(this).val() + ' Tokens');
    var max_contextTimer = setTimeout(saveSettings, 500);
});
$(document).on('input', '#openai_max_tokens', function () {
    openai_max_tokens = parseInt($(this).val());
    var max_tokensTimer = setTimeout(saveSettings, 500);
});
$('#stream_toggle').change(function () {
    stream_openai = !!$('#stream_toggle').prop('checked');
    saveSettings();
});
$('#nsfw_toggle').change(function () {
    nsfw_toggle = !!$('#nsfw_toggle').prop('checked');
    saveSettings();
});
$('#keep_example_dialogue').change(function () {
    keep_example_dialogue = !!$('#keep_example_dialogue').prop('checked');
    saveSettings();
});
$('#enhance_definitions').change(function () {
    enhance_definitions = !!$('#enhance_definitions').prop('checked');
    saveSettings();
});
$('#wrap_in_quotes').change(function () {
    wrap_in_quotes = !!$('#wrap_in_quotes').prop('checked');
    saveSettings();
});
$('#nsfw_first').change(function () {
    nsfw_first = !!$('#nsfw_first').prop('checked');
    saveSettings();
});

//***************SETTINGS****************//
///////////////////////////////////////////
async function getSettings(type) {//timer


    jQuery.ajax({
        type: 'POST',
        url: '/getsettings',
        data: JSON.stringify({}),
        beforeSend: function () {


        },
        cache: false,
        dataType: "json",
        contentType: "application/json",
        //processData: false, 
        success: function (data) {
            if (data.result != 'file not find') {
                settings = JSON.parse(data.settings);
                if (settings.username !== undefined) {
                    if (settings.username !== '') {
                        name1 = settings.username;
                        $('#your_name').val(name1);
                    }
                }

                //Novel
                if (settings.main_api != undefined) {
                    main_api = settings.main_api;
                    $("#main_api option[value=" + main_api + "]").attr('selected', 'true');
                    changeMainAPI();
                }
                if (settings.api_key_novel != undefined) {
                    api_key_novel = settings.api_key_novel;
                    $("#api_key_novel").val(api_key_novel);
                }
                model_novel = settings.model_novel;
                $("#model_novel_select option[value=" + model_novel + "]").attr('selected', 'true');

                novelai_setting_names = data.novelai_setting_names;
                novelai_settings = data.novelai_settings;
                novelai_settings.forEach(function (item, i, arr) {

                    novelai_settings[i] = JSON.parse(item);
                });
                var arr_holder = {};
                $("#settings_perset_novel").empty();
                novelai_setting_names.forEach(function (item, i, arr) {
                    arr_holder[item] = i;
                    $('#settings_perset_novel').append('<option value=' + i + '>' + item + '</option>');

                });
                novelai_setting_names = {};
                novelai_setting_names = arr_holder;

                preset_settings_novel = settings.preset_settings_novel;
                $("#settings_perset_novel option[value=" + novelai_setting_names[preset_settings_novel] + "]").attr('selected', 'true');

                //OpenAI
                if (settings.api_key_openai != undefined) {
                    api_key_openai = settings.api_key_openai;
                    $("#api_key_openai").val(api_key_openai);
                }
                openai_setting_names = data.openai_setting_names;
                openai_settings = data.openai_settings;
                openai_settings.forEach(function (item, i, arr) {
                    openai_settings[i] = JSON.parse(item);
                });
                var arr_holder = {};
                $("#settings_perset_openai").empty();
                openai_setting_names.forEach(function (item, i, arr) {
                    arr_holder[item] = i;
                    $('#settings_perset_openai').append('<option value=' + i + '>' + item + '</option>');

                });
                openai_setting_names = {};
                openai_setting_names = arr_holder;

                preset_settings_openai = settings.preset_settings_openai;
                $("#settings_perset_openai option[value=" + openai_setting_names[preset_settings_openai] + "]").attr('selected', 'true');

                //Kobold
                koboldai_setting_names = data.koboldai_setting_names;
                koboldai_settings = data.koboldai_settings;
                koboldai_settings.forEach(function (item, i, arr) {
                    koboldai_settings[i] = JSON.parse(item);
                });
                var arr_holder = {};
                //$("#settings_perset").empty();
                koboldai_setting_names.forEach(function (item, i, arr) {
                    arr_holder[item] = i;
                    $('#settings_perset').append('<option value=' + i + '>' + item + '</option>');

                });
                koboldai_setting_names = {};
                koboldai_setting_names = arr_holder;

                preset_settings = settings.preset_settings;

                temp = settings.temp;
                amount_gen = settings.amount_gen;
                if (settings.max_context !== undefined) max_context = parseInt(settings.max_context);
                if (settings.anchor_order !== undefined) anchor_order = parseInt(settings.anchor_order);
                if (settings.style_anchor !== undefined) style_anchor = !!settings.style_anchor;
                if (settings.character_anchor !== undefined) character_anchor = !!settings.character_anchor;
                rep_pen = settings.rep_pen;
                rep_pen_size = settings.rep_pen_size;


                var addZeros = "";
                if (isInt(temp)) addZeros = ".00";
                $('#temp').val(temp);
                $('#temp_counter').html(temp + addZeros);

                $('#style_anchor').prop('checked', style_anchor);
                $('#character_anchor').prop('checked', character_anchor);
                $("#anchor_order option[value=" + anchor_order + "]").attr('selected', 'true');

                $('#max_context').val(max_context);
                $('#max_context_counter').html(max_context + ' Tokens');

                $('#amount_gen').val(amount_gen);
                $('#amount_gen_counter').html(amount_gen + ' Tokens');

                addZeros = "";
                if (isInt(rep_pen)) addZeros = ".00";
                $('#rep_pen').val(rep_pen);
                $('#rep_pen_counter').html(rep_pen + addZeros);

                $('#rep_pen_size').val(rep_pen_size);
                $('#rep_pen_size_counter').html(rep_pen_size + " Tokens");

                //Novel
                temp_novel = settings.temp_novel;
                rep_pen_novel = settings.rep_pen_novel;
                rep_pen_size_novel = settings.rep_pen_size_novel;

                addZeros = "";
                if (isInt(temp_novel)) addZeros = ".00";
                $('#temp_novel').val(temp_novel);
                $('#temp_counter_novel').html(temp_novel + addZeros);

                addZeros = "";
                if (isInt(rep_pen_novel)) addZeros = ".00";
                $('#rep_pen_novel').val(rep_pen_novel);
                $('#rep_pen_counter_novel').html(rep_pen_novel + addZeros);

                $('#rep_pen_size_novel').val(rep_pen_size_novel);
                $('#rep_pen_size_counter_novel').html(rep_pen_size_novel + " Tokens");

                //OpenAI, with default settings too
                temp_openai = settings.temp_openai ?? 0.9;
                freq_pen_openai = settings.freq_pen_openai ?? 0.7;
                pres_pen_openai = settings.pres_pen_openai ?? 0.7;
                stream_openai = settings.stream_openai ?? true;
                openai_max_context = settings.openai_max_context ?? 4095;
                openai_max_tokens = settings.openai_max_tokens ?? 300;
                if (settings.nsfw_toggle !== undefined) nsfw_toggle = !!settings.nsfw_toggle;
                if (settings.keep_example_dialogue !== undefined) keep_example_dialogue = !!settings.keep_example_dialogue;
                if (settings.enhance_definitions !== undefined) enhance_definitions = !!settings.enhance_definitions;
                if (settings.wrap_in_quotes !== undefined) wrap_in_quotes = !!settings.wrap_in_quotes;
                if (settings.nsfw_first !== undefined) nsfw_first = !!settings.nsfw_first;

                $('#stream_toggle').prop('checked', stream_openai);

                $('#openai_max_context').val(openai_max_context);
                $('#openai_max_context_counter').html(openai_max_context + ' Tokens');

                $('#openai_max_tokens').val(openai_max_tokens);

                $('#nsfw_toggle').prop('checked', nsfw_toggle);
                $('#keep_example_dialogue').prop('checked', keep_example_dialogue);
                $('#enhance_definitions').prop('checked', enhance_definitions);
                $('#wrap_in_quotes').prop('checked', wrap_in_quotes);
                $('#nsfw_first').prop('checked', nsfw_first);

                if (settings.main_prompt !== undefined) main_prompt = settings.main_prompt;
                if (settings.nsfw_prompt !== undefined) nsfw_prompt = settings.nsfw_prompt;
                $('#main_prompt_textarea').val(main_prompt);
                $('#nsfw_prompt_textarea').val(nsfw_prompt);

                addZeros = "";
                if (isInt(temp_openai)) addZeros = ".00";
                $('#temp_openai').val(temp_openai);
                $('#temp_counter_openai').html(temp_openai + addZeros);

                addZeros = "";
                if (isInt(freq_pen_openai)) addZeros = ".00";
                $('#freq_pen_openai').val(freq_pen_openai);
                $('#freq_pen_counter_openai').html(freq_pen_openai + addZeros);

                addZeros = "";
                if (isInt(pres_pen_openai)) addZeros = ".00";
                $('#pres_pen_openai').val(pres_pen_openai);
                $('#pres_pen_counter_openai').html(pres_pen_openai + addZeros);

                //////////////////////
                if (preset_settings == 'gui') {
                    $("#settings_perset option[value=gui]").attr('selected', 'true');
                    $("#range_block").children().prop("disabled", true);
                    $("#range_block").css('opacity', 0.5);

                    $("#amount_gen_block").children().prop("disabled", true);
                    $("#amount_gen_block").css('opacity', 0.45);
                } else {
                    if (typeof koboldai_setting_names[preset_settings] !== 'undefined') {

                        $("#settings_perset option[value=" + koboldai_setting_names[preset_settings] + "]").attr('selected', 'true');
                    } else {
                        $("#range_block").children().prop("disabled", true);
                        $("#range_block").css('opacity', 0.5);
                        $("#amount_gen_block").children().prop("disabled", true);
                        $("#amount_gen_block").css('opacity', 0.45);

                        preset_settings = 'gui';
                        $("#settings_perset option[value=gui]").attr('selected', 'true');
                    }

                }

                //User
                user_avatar = settings.user_avatar;
                $('.mes').each(function () {
                    if ($(this).attr('ch_name') == name1) {
                        $(this).children('.avatar').children('img').attr('src', 'User Avatars/' + user_avatar);
                    }
                });

                api_server = settings.api_server;
                $('#api_url_text').val(api_server);
            }
            if (!is_checked_colab) isColab();

        },
        error: function (jqXHR, exception) {
            console.log(exception);
            console.log(jqXHR);

        }
    });

}

async function saveSettings(type) {

    jQuery.ajax({
        type: 'POST',
        url: '/savesettings',
        data: JSON.stringify({
            username: name1,
            api_server: api_server,
            preset_settings: preset_settings,
            preset_settings_novel: preset_settings_novel,
            preset_settings_openai: preset_settings_openai,
            user_avatar: user_avatar,
            temp: temp,
            amount_gen: amount_gen,
            max_context: max_context,
            anchor_order: anchor_order,
            style_anchor: style_anchor,
            character_anchor: character_anchor,
            main_api: main_api,
            api_key_novel: api_key_novel,
            api_key_openai: api_key_openai,
            rep_pen: rep_pen,
            rep_pen_size: rep_pen_size,
            model_novel: model_novel,
            temp_novel: temp_novel,
            rep_pen_novel: rep_pen_novel,
            rep_pen_size_novel: rep_pen_size_novel,
            temp_openai: temp_openai,
            freq_pen_openai: freq_pen_openai,
            pres_pen_openai: pres_pen_openai,
            stream_openai: stream_openai,
            openai_max_context: openai_max_context,
            openai_max_tokens: openai_max_tokens,
            nsfw_toggle: nsfw_toggle,
            keep_example_dialogue: keep_example_dialogue,
            enhance_definitions: enhance_definitions,
            wrap_in_quotes: wrap_in_quotes,
            nsfw_first: nsfw_first,
            main_prompt: main_prompt,
            nsfw_prompt: nsfw_prompt
        }),
        beforeSend: function () {


        },
        cache: false,
        dataType: "json",
        contentType: "application/json",
        //processData: false, 
        success: function (data) {
            //online_status = data.result;
            if (type === 'change_name') {
                location.reload();
            }

        },
        error: function (jqXHR, exception) {
            console.log(exception);
            console.log(jqXHR);

        }
    });

}
$('#donation').click(function () {
    $('#shadow_tips_popup').css('display', 'block');
    $('#shadow_tips_popup').transition({
        opacity: 1.0,
        duration: 100,
        easing: animation_rm_easing,
        complete: function () {

        }
    });
});
$('#tips_cross').click(function () {

    $('#shadow_tips_popup').transition({
        opacity: 0.0,
        duration: 100,
        easing: animation_rm_easing,
        complete: function () {
            $('#shadow_tips_popup').css('display', 'none');
        }
    });
});
$('#select_chat_cross').click(function () {


    $('#shadow_select_chat_popup').css('display', 'none');
    $('#load_select_chat_div').css('display', 'block');
});

function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) == value &&
        !isNaN(parseInt(value, 10));
}
//********************
//***Message Editor***
$(document).on('click', '.mes_edit', function () {
    if (this_chid !== undefined) {
        let chatScrollPosition = $("#chat").scrollTop();
        if (this_edit_mes_id !== undefined) {
            let mes_edited = $('#chat').children().filter('[mesid="' + this_edit_mes_id + '"]').children('.mes_block').children('.ch_name').children('.mes_edit_done');
            messageEditDone(mes_edited);
        }
        $(this).parent().parent().children('.mes_text').empty();
        $(this).css('display', 'none');
        $(this).parent().children('.mes_edit_done').css('display', 'inline-block');
        $(this).parent().children('.mes_edit_done').css('opacity', 0.0);
        $(this).parent().children('.mes_edit_cancel').css('display', 'inline-block');
        $(this).parent().children('.mes_edit_cancel').css('opacity', 0.0);
        $(this).parent().children('.mes_edit_done').transition({
            opacity: 1.0,
            duration: 600,
            easing: "",
            complete: function () { }
        });
        $(this).parent().children('.mes_edit_cancel').transition({
            opacity: 1.0,
            duration: 600,
            easing: "",
            complete: function () { }
        });
        var edit_mes_id = $(this).parent().parent().parent().attr('mesid');
        this_edit_mes_id = edit_mes_id;

        var text = chat[edit_mes_id]['mes'];
        if (chat[edit_mes_id]['is_user']) {
            this_edit_mes_chname = name1;
        } else {
            this_edit_mes_chname = name2;
        }
        text = text.trim();
        $(this).parent().parent().children('.mes_text').append('<textarea class=edit_textarea style="max-width:auto; ">' + text + '</textarea>');
        let edit_textarea = $(this).parent().parent().children('.mes_text').children('.edit_textarea');
        edit_textarea.css('opacity', 0.0);
        edit_textarea.transition({
            opacity: 1.0,
            duration: 0,
            easing: "",
            complete: function () { }
        });
        edit_textarea.height(0);
        edit_textarea.height(edit_textarea[0].scrollHeight);
        edit_textarea.focus();
        edit_textarea[0].setSelectionRange(edit_textarea.val().length, edit_textarea.val().length);
        if (this_edit_mes_id == count_view_mes - 1) {
            $("#chat").scrollTop(chatScrollPosition);
        }
    }
});
$(document).on('click', '.mes_edit_cancel', function () {
    //var text = $(this).parent().parent().children('.mes_text').children('.edit_textarea').val();
    var text = chat[this_edit_mes_id]['mes'];

    $(this).parent().parent().children('.mes_text').empty();
    $(this).css('display', 'none');
    $(this).parent().children('.mes_edit_done').css('display', 'none');
    $(this).parent().children('.mes_edit').css('display', 'inline-block');
    $(this).parent().parent().children('.mes_text').append(messageFormating(text, this_edit_mes_chname));
    this_edit_mes_id = undefined;
});
$(document).on('click', '.mes_edit_done', function () {
    messageEditDone($(this));
});
function messageEditDone(div) {

    var text = div.parent().parent().children('.mes_text').children('.edit_textarea').val();
    //var text = chat[this_edit_mes_id];
    text = text.trim();
    chat[this_edit_mes_id]['mes'] = text;
    div.parent().parent().children('.mes_text').empty();
    div.css('display', 'none');
    div.parent().children('.mes_edit_cancel').css('display', 'none');
    div.parent().children('.mes_edit').css('display', 'inline-block');
    div.parent().parent().children('.mes_text').append(messageFormating(text, this_edit_mes_chname));
    this_edit_mes_id = undefined;
    saveChat();
}

$("#your_name_button").click(function () {
    if (!is_send_press) {
        name1 = $("#your_name").val();
        if (name1 === undefined || name1 == '') name1 = default_user_name;
        console.log(name1);
        saveSettings('change_name');

    }
});
//Select chat
async function getAllCharaChats() {
    $('#select_chat_div').html('');
    //console.log(characters[this_chid].chat);
    jQuery.ajax({
        type: 'POST',
        url: '/getallchatsofchatacter',
        data: JSON.stringify({ avatar_url: characters[this_chid].avatar }),
        beforeSend: function () {
            //$('#create_button').attr('value','Creating...'); 
        },
        cache: false,
        dataType: "json",
        contentType: "application/json",
        success: function (data) {
            $('#load_select_chat_div').css('display', 'none');
            let dataArr = Object.values(data);
            data = dataArr.sort((a, b) => a['file_name'].localeCompare(b['file_name']));
            data = data.reverse();
            for (const key in data) {
                let strlen = 40;
                let mes = data[key]['mes'];
                if (mes.length > strlen) {
                    mes = '...' + mes.substring(mes.length - strlen);
                }
                $('#select_chat_div').append('<div class="select_chat_block" file_name="' + data[key]['file_name'] + '"><div class=avatar><img src="characters/' + characters[this_chid]['avatar'] + '" style="width: 33px; height: 51px;"></div><div class="select_chat_block_filename">' + data[key]['file_name'] + '</div><div class="select_chat_block_mes">' + mes + '</div></div>');
                if (characters[this_chid]['chat'] == data[key]['file_name'].replace('.jsonl', '')) {
                    //children().last()
                    $('#select_chat_div').children(':nth-last-child(1)').attr('highlight', true);
                }
            }
            //<div id="select_chat_div">

            //<div id="load_select_chat_div">
            //console.log(data);
            //chat.length = 0;

            //chat =  data;
            //getChatResult();
            //saveChat();
        },
        error: function (jqXHR, exception) {
            //getChatResult();
            console.log(exception);
            console.log(jqXHR);
        }
    });
}
//************************************************************
//************************Novel.AI****************************
//************************************************************
async function getStatusNovel() {
    if (is_get_status_novel) {

        var data = { key: api_key_novel };


        jQuery.ajax({
            type: 'POST', // 
            url: '/getstatus_novelai', // 
            data: JSON.stringify(data),
            beforeSend: function () {
                //$('#create_button').attr('value','Creating...'); 
            },
            cache: false,
            dataType: "json",
            contentType: "application/json",
            success: function (data) {


                if (data.error != true) {
                    //var settings2 = JSON.parse(data);
                    //const getData = await response.json();
                    novel_tier = data.tier;
                    if (novel_tier == undefined) {
                        online_status = 'no_connection';
                    }
                    if (novel_tier === 0) {
                        online_status = "Paper";
                    }
                    if (novel_tier === 1) {
                        online_status = "Tablet";
                    }
                    if (novel_tier === 2) {
                        online_status = "Scroll";
                    }
                    if (novel_tier === 3) {
                        online_status = "Opus";
                    }
                }
                resultCheckStatusNovel();
            },
            error: function (jqXHR, exception) {
                online_status = 'no_connection';
                console.log(exception);
                console.log(jqXHR);
                resultCheckStatusNovel();
            }
        });
    } else {
        if (!is_get_status && !is_get_status_openai) {
            online_status = 'no_connection';
        }
    }
}
$("#api_button_novel").click(function () {
    if ($('#api_key_novel').val() != '') {
        $("#api_loading_novel").css("display", 'inline-block');
        $("#api_button_novel").css("display", 'none');
        api_key_novel = $('#api_key_novel').val();
        api_key_novel = $.trim(api_key_novel);
        //console.log("1: "+api_server);
        saveSettings();
        is_get_status_novel = true;
        is_api_button_press_novel = true;
    }
});
function resultCheckStatusNovel() {
    is_api_button_press_novel = false;
    checkOnlineStatus();
    $("#api_loading_novel").css("display", 'none');
    $("#api_button_novel").css("display", 'inline-block');
}
$("#model_novel_select").change(function () {
    model_novel = $('#model_novel_select').find(":selected").val();
    saveSettings();
});
$("#anchor_order").change(function () {
    anchor_order = parseInt($('#anchor_order').find(":selected").val());
    saveSettings();
});


function compareVersions(v1, v2) {
    const v1parts = v1.split('.');
    const v2parts = v2.split('.');

    for (let i = 0; i < v1parts.length; ++i) {
        if (v2parts.length === i) {
            return 1;
        }

        if (v1parts[i] === v2parts[i]) {
            continue;
        }
        if (v1parts[i] > v2parts[i]) {
            return 1;
        }
        else {
            return -1;
        }
    }

    if (v1parts.length != v2parts.length) {
        return -1;
    }

    return 0;
}

//************************************************************
//************************OPENAI****************************
//************************************************************
async function getStatusOpen() {
    if (is_get_status_openai) {
        var data = { key: api_key_openai };

        jQuery.ajax({
            type: 'POST', // 
            url: '/getstatus_openai', // 
            data: JSON.stringify(data),
            beforeSend: function () {
                //$('#create_button').attr('value','Creating...'); 
            },
            cache: false,
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                if (!('error' in data)) online_status = 'Valid';
                resultCheckStatusOpen();
            },
            error: function (jqXHR, exception) {
                online_status = 'no_connection';
                console.log(exception);
                console.log(jqXHR);
                resultCheckStatusOpen();
            }
        });
    } else {
        if (!is_get_status && !is_get_status_novel) {
            online_status = 'no_connection';
        }
    }
}
$("#api_button_openai").click(function () {
    if ($('#api_key_openai').val() != '') {
        $("#api_loading_openai").css("display", 'inline-block');
        $("#api_button_openai").css("display", 'none');
        api_key_openai = $('#api_key_openai').val();
        api_key_openai = $.trim(api_key_openai);
        //console.log("1: "+api_server);
        saveSettings();
        is_get_status_openai = true;
        is_api_button_press_openai = true;
        getStatusOpen();
    }
});
function resultCheckStatusOpen() {
    is_api_button_press_openai = false;
    checkOnlineStatus();
    $("#api_loading_openai").css("display", 'none');
    $("#api_button_openai").css("display", 'inline-block');
}
$("#anchor_order").change(function () {
    anchor_order = parseInt($('#anchor_order').find(":selected").val());
    saveSettings();
});


//**************************CHARACTER IMPORT EXPORT*************************//
$("#character_import_button").click(function () {
    $("#character_import_file").click();
});
$("#character_import_file").on("change", function (e) {
    $('#rm_info_avatar').html('');
    var file = e.target.files[0];
    //console.log(1);
    if (!file) {
        return;
    }
    var ext = file.name.match(/\.(\w+)$/);
    if (!ext || (ext[1].toLowerCase() != "json" && ext[1].toLowerCase() != "png")) {
        return;
    }

    var format = ext[1].toLowerCase();
    $("#character_import_file_type").val(format);
    //console.log(format);
    var formData = new FormData($("#form_import").get(0));

    jQuery.ajax({
        type: 'POST',
        url: '/importcharacter',
        data: formData,
        beforeSend: function () {
            //$('#create_button').attr('disabled',true);
            //$('#create_button').attr('value','Creating...'); 
        },
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            if (data.file_name !== undefined) {

                $('#rm_info_block').transition({ opacity: 0, duration: 0 });
                var $prev_img = $('#avatar_div_div').clone();
                $prev_img.children('img').attr('src', 'characters/' + data.file_name + '.png');
                $('#rm_info_avatar').append($prev_img);
                select_rm_info("Character created");

                $('#rm_info_block').transition({ opacity: 1.0, duration: 2000 });
                getCharacters();

            }
        },
        error: function (jqXHR, exception) {
            $('#create_button').removeAttr("disabled");
        }
    });
});
$('#export_button').click(function () {
    var link = document.createElement('a');
    link.href = 'characters/' + characters[this_chid].avatar;
    link.download = characters[this_chid].avatar;
    document.body.appendChild(link);
    link.click();
});



//**************************CHAT IMPORT EXPORT*************************//
$("#chat_import_button").click(function () {
    $("#chat_import_file").click();
});
$("#chat_import_file").on("change", function (e) {
    var file = e.target.files[0];
    //console.log(1);
    if (!file) {
        return;
    }
    var ext = file.name.match(/\.(\w+)$/);
    if (!ext || (ext[1].toLowerCase() != "json" && ext[1].toLowerCase() != "jsonl")) {
        return;
    }

    var format = ext[1].toLowerCase();
    $("#chat_import_file_type").val(format);
    //console.log(format);
    var formData = new FormData($("#form_import_chat").get(0));

    jQuery.ajax({
        type: 'POST',
        url: '/importchat',
        data: formData,
        beforeSend: function () {
            $('#select_chat_div').html('');
            $('#load_select_chat_div').css('display', 'block');
            //$('#create_button').attr('value','Creating...'); 
        },
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {
            //console.log(data);
            if (data.res) {
                getAllCharaChats();


            }
        },
        error: function (jqXHR, exception) {
            $('#create_button').removeAttr("disabled");
        }
    });
});
$(document).on('click', '.select_chat_block', function () {
    let file_name = $(this).attr("file_name").replace('.jsonl', '');
    //console.log(characters[this_chid]['chat']);
    characters[this_chid]['chat'] = file_name;
    clearChat();
    chat.length = 0;
    getChat();
    $('#selected_chat_pole').val(file_name);
    $("#create_button").click();
    $('#shadow_select_chat_popup').css('display', 'none');
    $('#load_select_chat_div').css('display', 'block');

});