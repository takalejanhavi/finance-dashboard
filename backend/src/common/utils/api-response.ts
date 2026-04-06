export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;

  constructor(data?: T, message = 'Success') {
    this.success = true;
    this.message = message;
    this.data = data;
  }

  static success<T>(data?: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse<T>(data, message);
  }
}
