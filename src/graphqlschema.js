import {Sequelize} from 'sequelize';
import {resolver, attributeFields, typeMapper} from 'graphql-sequelize';
import {GraphQLType, GraphQLObjectType, GraphQLNonNull, GraphQLList,
    GraphQLSchema, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLInputObjectType} from 'graphql';
import {DailyPredictionService} from './services/dailyPredictionService';

function init(models, logger) {
    const dailyPredictionService = new DailyPredictionService(models, logger);

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
                resolve: (dailyPrediction, args, context) => {
                    return dailyPredictionService
                        .getDailyPredictionExplanations(dailyPrediction)
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
            accountComplete: {
                type: GraphQLBoolean,
                description: 'Represents if user\'s account is complete.',
            },
            natalDates: {
                type: new GraphQLList(natalDateType),
                description: 'Natal dates of the user.',
                args: {
                    id: {
                        type: GraphQLInt
                    },
                },
                resolve: (user, { id }, context) => {
                    if (id) {
                        return models.NatalDate.findOne({
                            where: {
                                id: id,
                                userId: user.id
                            }
                        }).then(natalDate => {
                            return [natalDate];
                        })
                    } else {
                        return models.NatalDate.findAll({
                            where: {
                                userId: user.id
                            }
                        })
                    }
                }
            }
        }
    });

    let RateDailyPredectionAccuracyType = new GraphQLInputObjectType({
        name: 'RateDailyPredectionAccuracyInput',
        fields: () => ({
            natalDateId: {
                type: new GraphQLNonNull(GraphQLInt)
            },
            date: {
                type: new GraphQLNonNull(GraphQLString)
            },
            accuracy: {
                description: 'Accuracy of daily prediction valid value 0 to 100',
                type: new GraphQLNonNull(GraphQLInt)
            }
        })
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
                            description: 'Format must be YYYY-MM-DD',
                            type: new GraphQLNonNull(GraphQLString)
                        }
                    },
                    resolve: (root, {natalDateId, date}, context) => {
                        return dailyPredictionService
                            .getDailyPrediction(context.user.id, natalDateId, date)
                    }
                }
            }
        }),
        mutation: new GraphQLObjectType({
            name: 'AstroLucisMutations',
            description: 'Queries that can alter data',
            fields: () => ({
                rateDailyPredectionAccuracy: {
                    type: dailyPredictionType,
                    description: 'Rate daily predictions accuracy',
                    args: {
                        input: {
                            type: RateDailyPredectionAccuracyType   
                        }
                    },
                    resolve: function(parent, args, context) {
                        return dailyPredictionService
                            .rateDailyPrediction(context.user.id, args.input.natalDateId, args.input.date, args.input.accuracy)
                    }
                }
            })
        })
    });

    return schema;
}

module.exports = init;