// @ts-check
const Alexa = require('ask-sdk-core');

const { apiCall } = require('./src/api.js');

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
        const speechText = 'Gracias por usar Mi Tuenti, pregúntame el saldo';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hola!', speechText)
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
        const res = await apiCall('Account_getAccountDashboard');

        let {
            formattedDATALeft: gbLeft,
            formattedSMSLeft: smsLeft,
            formattedGSMLeft: gsmLeft
        } = res.accountDashboard;

        gbLeft = gbLeft.replace('.', ',');

        const speechText = `Te quedan ${gbLeft} Gigas, ${smsLeft} SMS y ${gsmLeft} minutos de llamadas`;

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
        const speechText = 'Pregúntame cuánto saldo te queda';

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
    /**
     * @param {HandlerInput} handlerInput
     */
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
        );
    },

    /**
     * @param {HandlerInput} handlerInput
     */
    handle(handlerInput) {
        console.log(
            `Sesión terminada con motivo: ${
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
        const errorMessage =
            'Lo siento, no entiendo el comando, por favor, repítelo.';

        return handlerInput.responseBuilder
            .speak(errorMessage)
            .reprompt(errorMessage)
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
