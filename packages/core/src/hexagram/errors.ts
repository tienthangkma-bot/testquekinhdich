/**
 * Các lớp lỗi chuyên biệt trong Hexagram Engine
 */

export class HexagramEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HexagramEngineError';
  }
}

export class InvalidHexagramInputError extends HexagramEngineError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidHexagramInputError';
  }
}

export class InvalidMovingLineError extends HexagramEngineError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMovingLineError';
  }
}

export class HexagramNotFoundError extends HexagramEngineError {
  constructor(message: string) {
    super(message);
    this.name = 'HexagramNotFoundError';
  }
}
