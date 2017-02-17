var Alexa = require('alexa-sdk');

var meattimes = {
    beef: {
        temperatures: [
            {
                "temperature": 220.0,
                "time": 20.0
            },
            {
                "temperature": 170.0,
                "times": {
                    "rare": {
                        minutes_per_kg: 30.0,
                        expected_internal_temp: 52.0
                    },
                    "medium": {
                        minutes_per_kg: 40.0,
                        expected_internal_temp: 60.0
                    },
                    "welldone": {
                        minutes_per_kg: 50.0,
                        expected_internal_temp: 70.0
                    }
                }
            }
        ]
    },
    pork:{
        temperatures: [
            {
                "temperature": 220.0,
                "time": 20.0
            },
            {
                "temperature": 190.0,
                "times":{
                    "welldone": {
                        minutes_per_kg: 50.0,
                        expected_internal_temp: 70.0
                    }
                }
            }
        ]
    },
    lamb:{
        temperatures: [
            {
                "temperature": 180.0,
                "times":{
                    "rare": {
                        minutes_per_kg: 44.0,
                        expected_internal_temp: 52.0
                    },
                    "medium": {
                        minutes_per_kg: 55.0,
                        expected_internal_temp: 60.0
                    },
                    "welldone": {
                        minutes_per_kg: 66.0,
                        expected_internal_temp: 75.0
                    }
                }
            }
        ]
    },
    chicken: {
        temperatures: [
            {
                "temperature": 200.0,
                "time": 20.0
            },
            {
                "temperature": 180.0,
                "times":{
                    "done": {
                        minutes_per_kg: 40.0,
                        expected_internal_temp: 75.0
                    }
                }
            }
        ]
    }
}

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = 'amzn1.ask.skill.09b5cdd8-3675-4022-9609-e9d148ce6d66';

    alexa.registerHandlers(handlers);
    alexa.execute();
};

var convertWeight = function(weight, units) {
    if (units === "kilogram" || units === "kilograms") {
        return weight
    } else if (units === "pound" || units === "pounds") {
        return Math.ceil(Number(weight) * 0.453592);
    } else {
        return weight; // ?? What other weight units here?
    }
};

var handlers = {
    'MeatyIntent': function() {
        this.emit(':tell', "Hello, I'm Meaty! You can ask me how to cook beef or lamb or other meats. Please use kilograms for the weight. For example: You can say: how long should I cook a 1.5 kilogram piece of pork.");
    },

    'HowToCook': function () {
        var say = "I'm sorry I didn't understand.";
        if (this.event.request.intent.slots.meat.value) {
            say = "I'm sorry I don't know how long to cook "+this.event.request.intent.slots.meat.value+"!";
            switch (this.event.request.intent.slots.meat.value){
                case "beef":
                    say = "For great roast rare beef, start by cooking at " + meattimes.beef.temperatures[0].temperature
                       + " degrees for " + meattimes.beef.temperatures[0].time + " minutes, then at "
                       + meattimes.beef.temperatures[1].temperature + " for "
                       + meattimes.beef.temperatures[1].times.rare.minutes_per_kg + " minutes per kilogram, or until the internal temperature is "
                       + meattimes.beef.temperatures[1].times.rare.expected_internal_temp + " degrees.";
                    break;

                case "lamb":
                    say = "Lamb is easy: cook at " + meattimes.lamb.temperatures[0].temperature
                       + " degrees for " + meattimes.lamb.temperatures[0].times.medium.minutes_per_kg + " minutes per kilogram, or until the internal temperature is "
                       + meattimes.lamb.temperatures[0].times.medium.expected_internal_temp + " degrees.";
                    break;

                case "pork":
                    say = "For great roast pork, start by cooking at " + meattimes.pork.temperatures[0].temperature
                        + " degrees for " + meattimes.pork.temperatures[0].time + " minutes, then at "
                        + meattimes.pork.temperatures[1].temperature + " for "
                        + meattimes.pork.temperatures[1].times.welldone.minutes_per_kg + "minutes per kilogram, or until the internal temperature is "
                        + meattimes.pork.temperatures[1].times.welldone.expected_internal_temp + " degrees. Don't forget to salt the skin for great crackling!";
                    break;

                case "chicken":
                    say = "For great roast chicken, start by cooking at " + meattimes.chicken.temperatures[0].temperature
                        + " degrees for " + meattimes.chicken.temperatures[0].time + " minutes, then at "
                        + meattimes.chicken.temperatures[1].temperature + " for "
                        + meattimes.chicken.temperatures[1].times.done.minutes_per_kg + "minutes per kilogram, or until the internal temperature is "
                        + meattimes.chicken.temperatures[1].times.done.expected_internal_temp + " degrees. Don't forget: stuff with rosemary for a great flavour!";
                    break;
            }

            this.emit(':tell', say);
        } else {
            this.emit(':tell', "Please be specific about the meat.");
        }
    },

    'CookByWeight': function () {
        var meat = this.event.request.intent.slots.meat.value;
        var weight = this.event.request.intent.slots.weight.value;
        var weightunit = this.event.request.intent.slots.weightunit.value;

        weight = parseFloat(convertWeight(weight, weightunit));

        var say = "I didn't understand the question.";
        if (this.event.request.intent.slots.meat.value) {
            switch (meat) {
                case "chicken":
                    say = "After cooking the chicken at " + meattimes.chicken.temperatures[0].temperature
                       + "degrees centigrade for "+ meattimes.chicken.temperatures[0].time +" minutes, cook it for a further " + (meattimes.chicken.temperatures[1].times.done.minutes_per_kg * weight)
                       + "minutes at " + meattimes.chicken.temperatures[1].temperature + "degrees centigrade, or until the internal temperature is "
                       + meattimes.chicken.temperatures[1].times.done.expected_internal_temp + " degrees centigrade.";
                    this.emit(':tell', say);
                    break;

                case "beef":
                    this.attributes['meat'] = meat;
                    this.attributes['weight'] = weight;

                    this.emit(":ask", "How do you like your roast beef? Rare, medium or well done? Say: 'I like my meat', followed by your choice.");
                    break;

                case "pork":
                    say = "Start by cooking your pork at " + meattimes.pork.temperatures[0].temperature
                        + " degrees for " + meattimes.pork.temperatures[0].time + " minutes, then at "
                        + meattimes.pork.temperatures[1].temperature + " for "
                        + (meattimes.pork.temperatures[1].times.welldone.minutes_per_kg*weight) + " further minutes, or until the internal temperature is "
                        + meattimes.pork.temperatures[1].times.welldone.expected_internal_temp + " degrees. Don't forget to salt the skin for great crackling!";
                    this.emit(':tell', say);
                    break;

                case "lamb":
                    say = "Cook your lamb at " + meattimes.lamb.temperatures[0].temperature
                       + " degrees for " + (meattimes.lamb.temperatures[0].times.medium.minutes_per_kg*weight) + " minutes, or until the internal temperature is "
                       + meattimes.lamb.temperatures[0].times.medium.expected_internal_temp + " degrees.";
                    this.emit(':tell', say);
                    break;

                case "chicken":
                    say = "Cook your chicken at " + meattimes.chicken.temperatures[0].temperature
                        + " degrees for " + meattimes.chicken.temperatures[0].time + " minutes, then at "
                        + meattimes.chicken.temperatures[1].temperature + " for "
                        + (meattimes.chicken.temperatures[1].times.done.minutes_per_kg * weight) + " further minutes, or until the internal temperature is "
                        + meattimes.chicken.temperatures[1].times.done.expected_internal_temp + " degrees. Don't forget: stuff with rosemary for a great flavour!";
                    break;

                default:
                    say = "I don't know how to cook " + meat;
                    this.emit(':tell', say);
                    break;
            }
        } else {
            this.emit(':tell', say);
        }
    },

    'BeefType': function() {
        if (
            this.attributes['meat'] &&
            this.attributes['weight'] &&
            this.event.request.intent.slots.cooked.value) {

            var say = "";
            var cooked = this.event.request.intent.slots.cooked.value;
            switch(cooked)
            {
                case "rare":
                    say = "Start by cooking your "+this.attributes['meat']+" at " + meattimes.beef.temperatures[0].temperature
                       + " degrees for " + meattimes.beef.temperatures[0].time + " minutes, then at "
                       + meattimes.beef.temperatures[1].temperature + " for "
                       + (meattimes.beef.temperatures[1].times.rare.minutes_per_kg * this.attributes['weight']) + " minutes, or until the internal temperature is "
                       + meattimes.beef.temperatures[1].times.rare.expected_internal_temp + " degrees.";
                   break;

                case "medium":
                    say = "Start by cooking your "+this.attributes['meat']+" at " + meattimes.beef.temperatures[0].temperature
                       + " degrees for " + meattimes.beef.temperatures[0].time + " minutes, then at "
                       + meattimes.beef.temperatures[1].temperature + " for "
                       + (meattimes.beef.temperatures[1].times.medium.minutes_per_kg * this.attributes['weight']) + " minutes, or until the internal temperature is "
                       + meattimes.beef.temperatures[1].times.medium.expected_internal_temp + " degrees.";
                   break;

                case "well done":
                    say = "Start by cooking your "+this.attributes['meat']+" at " + meattimes.beef.temperatures[0].temperature
                       + " degrees for " + meattimes.beef.temperatures[0].time + " minutes, then at "
                       + meattimes.beef.temperatures[1].temperature + " for "
                       + (meattimes.beef.temperatures[1].times.welldone.minutes_per_kg * parseFloat(this.attributes['weight'])) + " minutes, or until the internal temperature is "
                       + meattimes.beef.temperatures[1].times.welldone.expected_internal_temp + " degrees.";
                   break;
            }

            this.emit(':tell', say);

        } else if (this.attributes['meat'] &&
            this.attributes['weight']) {
            this.emit(':ask', "Say again?", "You can say 'i like my meat rare', 'medium' or 'well done'.");
        } else {
            this.emit('AMAZON.HelpIntent');
        }
    },

    'AMAZON.HelpIntent': function() {
        this.emit(':tell', "This is Meaty! I can help you roast beef, chicken, pork or lamb. You can say: how do I cook beef? Or: how long should I cook 3 kilograms of chicken.");
    },

    'AMAZON.StopIntent' : function() {
        this.emit(':tell', "OK.");
    },

    'AMAZON.CancelIntent' : function() {
        this.emit(':tell', "OK.");
    }

};
