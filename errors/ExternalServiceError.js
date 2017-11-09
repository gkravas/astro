export class ExternalServiceError extends Error {
    constructor(type, message) {
      super(message);
      this.type = type;
      this.name = 'ExternalServiceError';
      this.constructor = ExternalServiceError 
    }
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            message: this.message
        }
    }
}
ExternalServiceError.prototype = Error.prototype;