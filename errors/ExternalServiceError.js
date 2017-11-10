import ExtendableError from 'es6-error';

export class ExternalServiceError extends ExtendableError {
    constructor(type, message) {
        super(message);
        this.type = type;
        this.name = 'ExternalServiceError';
        this.constructor = ExternalServiceError;
        this.toJSON = function() {
            return {
                name: this.name,
                type: this.type,
                message: this.message
            }
        }
    }
}