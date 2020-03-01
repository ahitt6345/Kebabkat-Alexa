/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const mongodb = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const uri = `mongodb+srv://admin:ORKeaIb0LJtxSDmT@kabobcat-dhmqz.gcp.mongodb.net/test?retryWrites=true&w=majority`;


const GetRemoteDataHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
      || (handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GetRemoteDataIntent');
  },
  async handle(handlerInput) {
      var outputSpeech = "";
    await getRemoteData("http://167.172.221.156:8080/").then((response) => {
        const data = JSON.parse(response);
        outputSpeech = `There are currently ${data.length} food opportunities.`;
        for (let i = 0; i < data.length; i++) {
            var item = data[i];
            if (i === 0) {
                //first record
                outputSpeech = outputSpeech + item.provider + " is serving " + item.foodType + " at " + item.location + ', '
            } else if (i === data.length - 1) {
                //last record
                outputSpeech = outputSpeech + 'and '  + item.provider + " is serving " + item.foodType + " at " + item.location + '.'
            } else {
                //middle record(s)
                outputSpeech = outputSpeech  + item.provider + " is serving " + item.foodType + " at " + item.location +  ', '
            }
        }
    })
    /*let outputSpeech = 'This is the default message.';
    mongodb.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, (err, client) => {
        if (err) {
            throw err;
        }
    
        const db = client.db("Kabobcat");
        const collection = db.collection('Submissions');
        var outputSpeech = "";
            collection.find().project({
                imageData: 0
            }).toArray((err, items) => {
                if (err) {
                    //output here
                    throw err;
                }
                outputSpeech = items.length === 1?'there is currently one location offering free food.':`there are currently ${items.length} places at u. c. merced offering free food.`;
                items.forEach(function(item, index){
                    if (index === 0) {
                        outputSpeech += 'They are located at ' + item.location + ", ";
                    } else if (index === items.length-1) {
                        outputSpeech += 'and ' + item.location + '.';
                    } else {
                        outputSpeech += item.location + ", ";
                    }
                });
            });
            
    });*/
    
 /*   await getRemoteData('http://api.open-notify.org/astros.json')
      .then((response) => {
        const data = JSON.parse(response);
        outputSpeech = `There are currently ${data.people.length} astronauts in space. `;
        for (let i = 0; i < data.people.length; i++) {
            if (i === 0) {
                //first record
                outputSpeech = outputSpeech + 'Their names are: ' + data.people[i].name + ', '
            } else if (i === data.people.length - 1) {
                //last record
                outputSpeech = outputSpeech + 'and ' + data.people[i].name + '.'
            } else {
                //middle record(s)
                outputSpeech = outputSpeech + data.people[i].name + ', '
            }
        }
    })
      .catch((err) => {
        //set an optional error message here
        //outputSpeech = err.message;
      });
*/
    return handlerInput.responseBuilder
      .speak(outputSpeech)
      .getResponse();

  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can introduce yourself by telling me your name';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const getRemoteData = function (url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? require('https') : require('http');
    const request = client.get(url, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(new Error('Failed with status code: ' + response.statusCode));
      }
      const body = [];
      response.on('data', (chunk) => body.push(chunk));
      response.on('end', () => resolve(body.join('')));
    });
    request.on('error', (err) => reject(err))
  })
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetRemoteDataHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

