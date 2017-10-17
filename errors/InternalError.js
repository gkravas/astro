class InternalError extends Error {
    constructor(type, message) {
      super(message);
      this.type = type;
      this.name = 'InternalError';
    }
    toJSON() {
        return {
            name: this.name,
            type: this.type,
            message: this.message
        }
    }
}
module.exports = InternalError;