/**
 * Interface for the response object
 */
export interface Response<T> {
  /**
   * Whether the request is successful
   */
  success: boolean;
  /**
   * The message of the response
   */
  message?: string;
  /**
   * The data of the response
   */
  data: T;
}
