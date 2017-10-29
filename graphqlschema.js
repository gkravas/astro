import {Sequelize} from 'sequelize';
import {resolver, attributeFields, typeMapper} from 'graphql-sequelize';
import {GraphQLType, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLSchema, GraphQLInt, GraphQLString} from 'graphql';
import {DailyPredictionService} from './services/dailyPredictionService';

function init(models) {
    const dailyPredictionService = new DailyPredictionService(models);

    typeMapper.mapType((type) => {
        if (type instanceof Sequelize.GEOMETRY) {
            return GraphQLString;
        }
        //use default for everything else
        return false;
    });

    let natalDateType = new GraphQLObjectType({
        name: 'NatalDate',
        description: 'A natal date',
        fields: attributeFields(models.NatalDate, {
            only: ['id', 'name', 'primary']
        })
    });

    let dailyPlanetAspectExplanationType = new GraphQLObjectType({
        name: 'DailyPlanetAspectExplanation',
        description: 'A daily aspect explanation',
        fields: attributeFields(models.DailyPlanetAspectExplanation)
    });

    let dailyPredictionType = new GraphQLObjectType({
        name: 'DailyPredection',
        description: 'A daily prediction',
        fields: {
            natalDate: {
                type: natalDateType,
                description: 'Natal date id for the daily prediction',
                resolve: resolver(models.DailyPrediction.NatalDates, {
                    separate: false
                })
            },
            date: {
                type: GraphQLString,
                description: 'Date of the daily prediction',
            },
            views: {
                type: GraphQLInt,
                description: 'How many times this daily prediction has been viewed',
            },
            accuracy: {
                type: GraphQLInt,
                description: 'Accuraty rating for this daily prediction',
            },
            planetExplanations: {
                type: new GraphQLList(dailyPlanetAspectExplanationType),
                description: 'Explanation list for the daily prediction',
                resolve: function(parent, args, context) {
                    return dailyPredictionService
                        .getDailyPrediction(context.user.id, parent.natalDateId, parent.date)
                }
            }
        }
    });

    let userType = new GraphQLObjectType({
        name: 'User',
        description: 'A user',
        fields: {
            id: {
                type: new GraphQLNonNull(GraphQLInt),
                description: 'The id of the user.',
            },
            email: {
                type: GraphQLString,
                description: 'The email of the user.',
            },
            natalDates: {
                type: new GraphQLList(natalDateType),
                description: 'Natal dates of the user.',
                resolve: resolver(models.User.NatalDates, {
                    separate: false
                })
            }
        }
    });

    let schema = new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'RootQueryType',
            fields: {

                me: {
                    type: userType,
                    resolve: resolver(models.User, {
                        before: (findOptions, args, context) => {
                            findOptions.where = {
                              id: context.user.id
                            };
                          }
                    })
                },

                dailyPrediction: {
                    type: dailyPredictionType,
                    args: {
                        natalDateId: {
                            type: new GraphQLNonNull(GraphQLInt)
                        },
                        date: {
                            type: new GraphQLNonNull(GraphQLString)
                        },
                    },
                    resolve: resolver(models.DailyPrediction, {
                        before: (findOptions, args, context) => {
                            findOptions.where = {
                              userId: context.user.id,
                              natalDateId: args.natalDateId,
                              date: args.date
                            };
                          }
                    })
                }
            }
        })
    });

    return schema;
}

module.exports = init;