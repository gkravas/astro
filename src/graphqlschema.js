import {Sequelize} from 'sequelize';
import {resolver, attributeFields, typeMapper} from 'graphql-sequelize';
import {GraphQLType, GraphQLObjectType, GraphQLNonNull, GraphQLList,
    GraphQLSchema, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLInputObjectType} from 'graphql';
import {DailyPredictionService} from './services/dailyPredictionService';
import {NatalDateService} from './services/natalDateService';
import {UserService} from './services/userService';

function init(models, config, logger) {
    const dailyPredictionService = new DailyPredictionService(config, models, logger);
    const natalDateService = new NatalDateService(config, models, logger);
    const userService = new UserService(config, models, logger);

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
            only: ['id', 'name', 'date', 'location', 'primary', 'type']
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
            location: {
                type: GraphQLString,
                description: 'The location that user lives.',
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

    let rateDailyPredectionAccuracyType = new GraphQLInputObjectType({
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

      let natalDateInputType = new GraphQLInputObjectType({
        name: 'NatalDateInput',
        fields: () => ({
            id: {
                type: GraphQLInt
            },
            date: {
                description: 'The date YYYY-MM-DD HH:mm:ss',
                type: new GraphQLNonNull(GraphQLString)
            },
            name: {
                description: 'The name',
                type: new GraphQLNonNull(GraphQLString)
            },
            location: {
                description: 'The location',
                type: new GraphQLNonNull(GraphQLString)
            },
            primary: {
                type: GraphQLBoolean
            },
            type: {
                type: GraphQLString
            },
        })
      });

      let userInputType = new GraphQLInputObjectType({
        name: 'UserInputType',
        fields: () => ({
            email: {
                type: GraphQLString
            },
            password: {
                type: GraphQLString
            },
            location: {
                type: GraphQLString
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
                        return userService.get(context.user.id)
                            .then(user => {
                                return dailyPredictionService
                                    .getDailyPrediction(user, natalDateId, date);
                            });
                    }
                }
            }
        }),
        mutation: new GraphQLObjectType({
            name: 'AstroLucisMutations',
            description: 'Queries that can alter data',
            fields: () => ({
                updateUser: {
                    type: userType,
                    description: 'Updates user\'s info',
                    args: {
                        input: {
                            type: userInputType   
                        }
                    },
                    resolve: function(parent, args, context) {
                        return userService.update(context.user.id, args.input.email, args.input.location);
                    }
                },
                rateDailyPredectionAccuracy: {
                    type: dailyPredictionType,
                    description: 'Rate daily predictions accuracy',
                    args: {
                        input: {
                            type: rateDailyPredectionAccuracyType   
                        }
                    },
                    resolve: function(parent, args, context) {
                        return dailyPredictionService
                            .rateDailyPrediction(context.user.id, args.input.natalDateId, args.input.date, args.input.accuracy)
                    }
                },
                createNatalDate: {
                    type: natalDateType,
                    description: 'Create a natal date',
                    args: {
                        input: {
                            type: natalDateInputType   
                        }
                    },
                    resolve: function(parent, args, context) {
                        
                        return natalDateService.create(context.user, args.input.name, args.input.date,
                                                    args.input.location, args.input.type,
                                                    args.input.primary);
                    }
                },
                updateNatalDate: {
                    type: natalDateType,
                    description: 'Update a natal date',
                    args: {
                        input: {
                            type: natalDateInputType   
                        }
                    },
                    resolve: function(parent, args, context) {
                        
                        return natalDateService.update(args.input.id, context.user.id,
                                                            args.input.name, args.input.date,
                                                            args.input.location, args.input.type,
                                                            args.input.primary);
                    }
                }
            })
        })
    });

    return schema;
}

module.exports = init;