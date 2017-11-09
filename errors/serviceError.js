export class ServiceError extends Error {
    constructor(type, message, field) {
      super(message);
      this.type = type;
      this.field = field;
      this.name = 'ServiceError';
      this.constructor = ServiceError;
    }
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            message: this.message,
            field: this.field
        }
    }
}
ServiceError.prototype = Error.prototype;