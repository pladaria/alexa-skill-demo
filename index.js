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
        const speechText =
            'Gracias por usar Mi Tuenti, puedes preguntarme el saldo o mandar mensajes!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Hola!', speechText)
            .getResponse();
    }
};

const ConsultaSaldoIntent = {
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
            .withSimpleCard('Mi Tuenti', speechText)
            .getResponse();
    }
};

const EnviaMensajeIntent = {
    /**
     * @param {HandlerInput} handlerInput
     */
    canHandle(handlerInput) {
        return (
            handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            handlerInput.requestEnvelope.request.intent.name ===
                'EnviaMensajeIntent'
        );
    },
    /**
     * @param {HandlerInput} handlerInput
     */
    handle: async handlerInput => {
        const { intent } = handlerInput.requestEnvelope.request;
        const name = intent.slots.name.value;
        const message = intent.slots.message.value;

        if (!name || !message || intent.confirmationStatus === 'NONE') {
            return handlerInput.responseBuilder
                .addDelegateDirective()
                .getResponse();
        }

        if (intent.confirmationStatus !== 'CONFIRMED') {
            const speechText = 'Cancelado!';
            return handlerInput.responseBuilder
                .speak(speechText)
                .withSimpleCard('Mi Tuenti', speechText)
                .getResponse();
        }

        // Current Amazon Lambda limit is 3s
        // Contacts API is too slow and requires to download contacts page by page
        // So it takes (N * number of pages) seconds

        /*
        const phoneBooks = await apiCall('Contacts_getAllPhoneBooks');
        const phoneBookId = phoneBooks.items[0].id;

        const contacts = [];
        let contactsPending = true;
        let nextPageId = undefined;

        while (contactsPending) {
            console.log({ nextPageId });
            const res = await apiCall('Contacts_getRemoteContactChanges', {
                phoneBookId,
                pageId: nextPageId
            });
            if (res) {
                if (res.items.length) {
                    contacts.push(...res.items);
                }
                if (res.nextPageId) {
                    nextPageId = res.nextPageId;
                } else {
                    contactsPending = false;
                }
            } else {
                contactsPending = false;
            }
        }
        */

        await apiCall('Shortmessage_sendMessage', {
            message,
            destinationNormalizedMsisdn: '+34684079898',
            expectedNumberOfParts: Math.ceil(message.length / 140)
        });

        const speechText = `Enviado!`;

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Mi Tuenti', speechText)
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
        const speechText = 'Pregúntame por tu saldo o envía mensajes';

        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .withSimpleCard('Mi Tuenti', speechText)
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
        const speechText = 'Adiós!';

        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Mi Tuenti', speechText)
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

        return handlerInput.responseBuilder.speak('Vale, adiós').getResponse();
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
        ConsultaSaldoIntent,
        EnviaMensajeIntent,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler
    )
    .addErrorHandlers(ErrorHandler)
    .lambda();
