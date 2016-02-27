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
    } else if ("LearnMoreIntent" === intentName) {
        learnMore(intent, session, callback);
    } else if ("checkCorrectIntent" === intentName){
        checkCorrect(intent, session, callback);
    } else if ("AMAZON.HelpIntent" === intentName) {
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
    var speechOutput = "Welcome to the Alexa Skills DevTalk. " +
        "Please tell or ask me about a tool you'd like to learn";
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = "Please tell me a tool you'd like to learn more about";
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
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
		speechOutput = "Oops! You haven't selected a tool yet. Say, Tell me about vim. Goodbye";
		shouldEndSession = true;
        callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }

    console.log("BEFORE makeFinalCommandReq");
	if(generalCommandSlot){
		generalCommand = generalCommandSlot.value;
	}
	else{
		speechOutput = "Oops! You haven't selected a command yet. Say, Tell me about vim. Goodbye";
		shouldEndSession = true;
        callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
	}

    if (specificCommandSlot) {
        specificCommand = specificCommandSlot.value;
        makeFinalCommandReq(selectedTool, generalCommand, specificCommand, function (result) {
            console.log("finished makeFinalCommandReq, response = "+ result);
            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, result, repromptText, shouldEndSession));

        });
        //speechOutput = "Pretending we made an api call to firebase. Here is the info on" + specificCommand + "Learn more?";

    } else {
        speechOutput = "Oops! you didnt select a tool. Try requesting a tool. Say, tell me how to delete";
        repromptText = "";
    }
}

function checkCorrect(intent, session, callback) {

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
        speechOutput = "Oops! You haven't selected a tool yet. Say, Tell me about vim. Goodbye";
        shouldEndSession = true;
        callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
    }
    console.log("BEFORE makeFinalCommandReq");
    if (generalCommandSlot) {
        generalCommand = generalCommandSlot.value;
        makeFinalCommandReq(selectedTool, generalCommand, null, function (result) {
            console.log("finished makeFinalCommandReq, response = "+ result);
            callback(sessionAttributes,
                buildSpeechletResponse(cardTitle, result, repromptText, shouldEndSession));

        });
        //speechOutput = "Pretending we made an api call to firebase. Here is the info on" + generalCommand + "Learn more?";

    } else {
        speechOutput = "Oops! you didnt select a command. Try requesting a tool. Say, tell me how to delete";
        repromptText = "";
    }
}

function learnMore(intent, session, callback) {
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "I didn't hear what you said. Please say yes or no.";
    var learnMoreAction = intent['slots']['Decision']['value'];

    if (learnMoreAction === 'yes') {
        //func to grab more info
        //for now just do the same thing as else
        speechOutput = "Ok I hope I could help. Happy programming.";
        shouldEndSession = true;
    } else {
        speechOutput = "Ok I hope I could help. Happy programming.";
        shouldEndSession = true;
    }

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function makeFinalCommandReq(tool, command, specifier, callback) {
    console.log("TESTING123 are we here?");
    makeCommandReq(tool, command, specifier, function commandReqCallback(err, commandResponse) {
        var speechOutput;
        console.log("supposedly have commandResp and it = " + commandResponse);
        if (err) {
            speechOutput = "Sorry, we couldn't handle your command request. Please try again later.";
        } else {
            speechOutput = "To " + command + " in " + tool + " press " + commandResponse;
        }
        speechOutput = speechOutput.replace(/['"]+/g, '');
        console.log("speechOutput = " + speechOutput);
        callback(speechOutput);
    });

}

function makeCommandReq(tool, command, specifier, commandReqCallback) {
    var endpoint = "https://sweltering-inferno-344.firebaseio.com/" + tool + "/" + command +  (specifier ? "/" + specifier : "") + ".json";
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
            console.log("ourResponseString = "+ourResponseString);
        });

        res.on('end', function () {
            console.log("ourResponseString = " + ourResponseString);
            if (ourResponseString.error) {
                console.log("Response error: "+ ourResponseString.error.message);
            } else {
                var command = ourResponseString;
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
    var selectedToolSlot = intent.slots.Tool;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";
    
    var possiblefailures = ["vin", "bin", "them", "van"]
    
    if (selectedToolSlot) {
        var selectedTool = selectedToolSlot.value;
	for (var i in possiblefailures)
	{
	    if (selectedTool === possiblefailures[i])
	    {
		  selectedTool = "vim";
	    }
	}
        sessionAttributes = createToolAttributes(selectedTool);
        speechOutput = "You would like to learn more about " + selectedTool + ". You can ask me " +
            "for a shorcut or command, by saying, for example, how do I insert?";
        repromptText = "Ask me for a shortcut or command by saying how do I do something?";
    } else {
        speechOutput = "I'm not sure what application you're using. Please try again";
        repromptText = "I'm not sure what your application you're using"  +
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
