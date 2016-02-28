/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills Kit.
 * The Intent Schema, Custom Slots, and Sample Utterances for this skill, as well as
 * testing instructions are located at http://amzn.to/1LzFrj6
 *
 * For additional samples, visit the Alexa Skills Kit Getting Started guide at
 * http://amzn.to/1LGWsLG
 */


var https = require('https')

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */
        /*
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
             context.fail("Invalid Application ID");
        }
        */

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to your skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
    console.log("onIntent requestId=" + intentRequest.requestId +
        ", sessionId=" + session.sessionId);

    var intent = intentRequest.intent,
        intentName = intentRequest.intent.name;

    // Dispatch to your skill's intent handlers
    if ("GiveToolIntent" === intentName) {
        setToolInSession(intent, session, callback);
    } else if ("WhatsMyToolIntent" === intentName) {
        getToolFromSession(intent, session, callback);
    } else if ("RequestCmdGenIntent" === intentName) {
        getGeneralCommand(intent, session, callback); 
    } else if ("RequestCmdSpeIntent" === intentName) {
        getSpecificCommand(intent, session, callback);
    } else if ("QuickAskIntent" === intentName) {
        getQuickAction(intent, session, callback);
    }else if ("AMAZON.HelpIntent" === intentName) {
        getWelcomeResponse(callback);
    } else {
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = "Welcome to DevTalk. " +
        "Please tell me a Dev tool that you'd like to learn more about.";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me a tool you'd like to learn more about.";
    var shouldEndSession = false;
    
    callback(sessionAttributes,
             buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getQuickAction(intent, session, callback) {
    console.log("selected quickActionIntent");
    var cardTitle = intent.name;
    var selectedTool = intent.slots.Tool.value;
    var generalCommand = intent.slots.CmdGen.value;
    var specificCommand; 
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;

    var possibleVimFailures = ["vin", "bin", "them", "van"];
    var possibleGitFailures = ["get up", "gethub"];

    console.log("about to check specifier");
    var specCmdSlot = intent.slots.CmdSpe;
    // slots can be missing, or slots can be provided but with empty value.
    // must test for both.
    if (!specCmdSlot || !specCmdSlot.value) {
        specificCommand = null;
    } else {
        specificCommand = specCmdSlot.value;
    }
    console.log("specifier = " + specificCommand);

    for (var i in possibleVimFailures)
    {
        if (selectedTool === possibleVimFailures[i]) {
          selectedTool = "vim";
          break;
        } else if (selectedTool === "google chrome") {
            selectedTool = "chrome";
            break;
        } else if (selectedTool === "mux") {
            selectedTool = "tmux";
            break;
        } else if (selectedTool === possibleGitFailures[i]) {
            selectedTool = "git hub";
            break;
        }
    }

    console.log("tool = "+ selectedTool);


    makeFinalCommandReq(selectedTool, generalCommand, specificCommand, function (result) {
        callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, result, repromptText, shouldEndSession));
    
    });

}

function getSpecificCommand(intent, session, callback) {
    console.log("INSIDE getSpecificCommND");
    var cardTitle = intent.name;
    var selectedTool;
    var generalCommand;
    var specificCommand;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    var generalCommandSlot = intent.slots.CmdGen;
    var specificCommandSlot = intent.slots.CmdSpe;
    
    if (session.attributes) {
	   selectedTool = session.attributes.selectedTool;
    } else {
	speechOutput = "Oops! You haven't selected a tool yet. Say, Tell me about vim.";
    repromptText = "Please select a tool.";
	shouldEndSession = false;
        callback(sessionAttributes,
		 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    
    console.log("BEFORE makeFinalCommandReq");
    if(generalCommandSlot){
	   generalCommand = generalCommandSlot.value;
    }
    else{//YO
	    speechOutput = "Oops! You haven't selected a command yet. Say, Tell me about vim."; 
        repromptText = "Please select a tool.";
	    shouldEndSession = false;
        callback(sessionAttributes,
		 buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    
    if (specificCommandSlot) {
        specificCommand = specificCommandSlot.value;
        makeFinalCommandReq(selectedTool, generalCommand, specificCommand, function (result) {
            console.log("finished makeFinalCommandReq, response = "+ result);
            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, result, result, true));

        });

    } else {
        speechOutput = "Oops! you didnt select a supported command. Say, tell me how to delete.";
        repromptText = "Say tell me how to delete.";
        callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}

function getGeneralCommand(intent, session, callback) {
    console.log("INSIDE getGeneralCommand");
    var cardTitle = intent.name;
    var selectedTool;
    var generalCommand;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    var generalCommandSlot = intent.slots.CmdGen;

    if (session.attributes) {
        selectedTool = session.attributes.selectedTool;
    } else {
        speechOutput = "Oops! You haven't selected a tool yet. Say, Tell me about vim.";
        shouldEndSession = false;
        callback(sessionAttributes,
		 buildSpeechletResponse(cardTitle, speechOutput, repromptText, true));
    }
    console.log("BEFORE makeFinalCommandReq");
    if (generalCommandSlot) {
        generalCommand = generalCommandSlot.value;
        
	makeFinalCommandReq(selectedTool, generalCommand, null, function (result) {
            console.log("finished makeFinalCommandReq, response = "+ result);
            callback(sessionAttributes,
                     buildSpeechletResponse(cardTitle, result, result, shouldEndSession));
	    
        });
        //speechOutput = "Pretending we made an api call to firebase. Here is the info on" + generalCommand + "Learn more?";

    } else {
        speechOutput = "Oops! you didnt select a command. Try requesting a tool. Say, tell me how to delete.";
        repromptText = "";
        callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
}

function makeFinalCommandReq(tool, command, specifier, callback) {
    console.log("TESTING123 are we here?");
    makeCommandReq(tool, command, specifier, function commandReqCallback(err, commandResponse) {
        var speechOutput;
        console.log("supposedly have commandResp and it = " + commandResponse);
        if (err) {
            speechOutput = "Sorry, we couldn't handle your command request. Please try again later.";
        } else {
            speechOutput = "To " + command + " in " + tool + " press " + commandResponse + ".";
        }//////////////////////////////////////////////////////////////////////
        speechOutput = speechOutput.replace(/['"]+/g, ''); //what does this doo
        console.log("speechOutput = " + speechOutput + ".");/////////////////////////
        callback(speechOutput);
    });

}

function makeCommandReq(tool, command, specifier, commandReqCallback) {
    console.log("command = " + command);
    console.log("tool = "+ tool);
    console.log("specifier = "+ specifier);
    var lowCaseCommand = command.toLowerCase();
    createCommandAttributes(lowCaseCommand);
    var lowCaseSpecifier = (specifier !== undefined && specifier !== null) ? specifier.toLowerCase() : "";
    createSpecCommandAttributes(lowCaseSpecifier);
    var query_tool = tool;
    if (tool === "git hub") {
        query_tool = "github";
    }
    var endpoint = "https://sweltering-inferno-344.firebaseio.com/" + encodeURIComponent(query_tool) + "/" 
        + encodeURIComponent(lowCaseCommand) +  (specifier ? "/" + encodeURIComponent(lowCaseSpecifier) : "") + ".json";
    console.log("inside makeCommandReq endpoint =" + endpoint);

    https.get(endpoint, function (res){
        var ourResponseString = '';
        console.log('Status Code: ' + res.statusCode);

        if (res.statusCode != 200) {
            console.log("NON 200 status code");
            commandReqCallback(new Error("Non 200 Response"));
        }

        res.on('data', function (data) {
            ourResponseString += data;
            console.log("CHECK RESPONSE: " + ourResponseString);
        });

        res.on('end', function () {
            var ourResponseObject = JSON.parse(ourResponseString);
            console.log("ourResponseObject = " + ourResponseObject);
            console.log("ourResponseString.n = "+ourResponseObject["n"]);
            if (ourResponseObject.error) {
                console.log("Response error: "+ ourResponseString.error.message);
            } else {
                var command = "";
                if (ourResponseObject["n"] !== undefined) {
                    console.log("found n objects in JSON");
                    var i = 0;
                    for (var key in ourResponseObject) {
                        if (i > 2 || i > ourResponseObject["n"]) break;
                        if (key === "n") continue;
                        command +=  " " + key + " " + ourResponseObject[key];
                        if (i === 1 || i === 0) command += " or for ";
                        ++i;
                    }
                }
                else {
                    console.log("unfortunetly I could not find the number of commands");
                    command = ourResponseObject;
                }
                console.log("command string =" +command);
                commandReqCallback(null, command);
            }
        });
    }).on('error', function (e) {
        console.log("Communication error: " + e.message);
        commandReqCallback(new Error(e.message));
    });
}

function findCommand(object) {
    return {
        command_data: object.data //should be object.JSON_name
    };
}

/**
 * Sets the tool (application) in the session and prepares the speech to reply to the user.
 */
function setToolInSession(intent, session, callback) {
    console.log("Inside set tool in sess");
    var selectedToolSlot = intent.slots.Tool;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    
    var possibleVimFailures = ["vin", "bin", "them", "van"];
    var possibleGitFailures = ["get up", "gethub"];

    
    if (selectedToolSlot) {
        var selectedTool = selectedToolSlot.value;
	for (var i in possibleVimFailures)
	{
	    if (selectedTool === possibleVimFailures[i]) {
		  selectedTool = "vim";
          break;
	    } else if (selectedTool === "google chrome") {
            selectedTool = "chrome";
            break;
        } else if (selectedTool === "mux") {
            selectedTool = "tmux";
            break;
        } else if (selectedTool === possibleGitFailures[i]) {
            selectedTool = "git hub";
            break;
        }
	}
        sessionAttributes = createToolAttributes(selectedTool);

        speechOutput = "You would like to learn more about " + selectedTool + ". You can ask me " +
            "for a shorcut or command.";
        repromptText = "Ask me for a shortcut or command.";
    } else {
        speechOutput = "I'm not sure what application you're using. Please try again ";
        repromptText = "I'm not sure what your application you're using."  +
            "Ask me for a shortcut by saying how do I do something?";
    }

    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}


function createToolAttributes(selectedTool) {
    return {
        selectedTool: selectedTool
    };
}

function createCommandAttributes(selectedCommand) {
    return {
        selectedCommand: selectedCommand
    };
}

function createSpecCommandAttributes(specCommand) {
    return {
        specCommand: specCommand
    };
}

function getToolFromSession(intent, session, callback) {
    var selectedTool;
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    if (session.attributes) {
        selectedTool = session.attributes.selectedTool;
    }

    if (selectedTool) {
        speechOutput = "Your selected tool is " + selectedTool + ". Goodbye.";
        shouldEndSession = true;
    } else {
        speechOutput = "I'm not sure what your selected tool is. Say Tell me about vim.";
    }

    // Setting repromptText to null signifies that we do not want to reprompt the user.
    // If the user does not respond or says something that is not understood, the session
    // will end.
    callback(sessionAttributes,
         buildSpeechletResponse(intent.name, speechOutput, repromptText, shouldEndSession));
}


// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Simple",
            title: "SessionSpeechlet - " + title,
            content: "SessionSpeechlet - " + output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}
