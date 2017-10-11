class ExternalServiceError extends Error {
    constructor(type, message) {
      super(message);
      this.type = type;
      this.name = 'ExternalServiceError';
    }
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            message: this.message
        }
    }
}
module.exports = ExternalServiceError;