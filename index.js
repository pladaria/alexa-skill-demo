// @ts-check
const Alexa = require('ask-sdk-core');
const fetch = require('node-fetch').default;

const dev = 'wbteNCLH4mncE2ffKH35wvWlAEHIuWUTT8EfQu5K';
const iid = 'testinginstallationid';

/**
 * @typedef {import('ask-sdk-core').HandlerInput} HandlerInput
 */

const LaunchRequestHandler = {
    /**
     * @param {HandlerInput} handlerInput
     */
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    /**
     * @param {HandlerInput} handlerInput
     */
    handle(handlerInput) {
        const speechText =
            'Welcome to the Alexa Skills Kit, you can say hello!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const HelloWorldIntentHandler = {
    /**
     * @param {HandlerInput} handlerInput
     */
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name ===
                'ConsultaSaldoIntent'
        );
    },
    /**
     * @param {HandlerInput} handlerInput
     */
    handle: async handlerInput => {
        const user = process.env.USER;
        const pass = process.env.PASS;
        const res = await fetch('http://api-msngr.tuenti.com/index.msngr.php', {
            method: 'POST',
            headers: {
                'X-Tuenti-Authentication': `user=${user},password=${pass},installation-id=${iid},device-family=${dev}`,
                'Content-Type': 'Application/json'
            },
            body: JSON.stringify({
                version: 'msngr-3',
                requests: [['Account_getAccountDashboard', {}]],
                screen: 'xxxhdpi'
            })
        });
        const json = await res.json();
        console.log(json);

        const speechText =
            'Tu saldo actual es de 30 Gigas y 10 minutos de Voz Digital';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Consulta de saldo', speechText)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name ===
                'AMAZON.HelpIntent'
        );
    },
    handle(handlerInput) {
        const speechText = 'You can say hello to me!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name ===
                'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name ===
                    'AMAZON.StopIntent')
        );
    },
    handle(handlerInput) {
        const speechText = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Hello World', speechText)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
        );
    },
    handle(handlerInput) {
        console.log(
            `Session ended with reason: ${
                handlerInput.requestEnvelope.request.reason
            }`
        );

        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    /**
     * @param {HandlerInput} handlerInput
     */
    canHandle() {
        return true;
    },
    /**
     * @param {HandlerInput} handlerInput
     */
    handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
            .speak("Sorry, I can't understand the command. Please say again.")
            .reprompt(
                "Sorry, I can't understand the command. Please say again."
            )
            .getResponse();
    }
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
