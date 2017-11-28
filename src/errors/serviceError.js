import ExtendableError from 'es6-error';

export class ServiceError extends ExtendableError {
    constructor(type, message, field) {
        super(message);
        this.type = type;
        this.field = field;
        this.name = 'ServiceError';
        this.constructor = ServiceError;
        this.toJSON = function() {
                return {
                    name: this.name,
                    type: this.type,
                    message: this.message,
                    field: this.field
                }
        }   
    }
}