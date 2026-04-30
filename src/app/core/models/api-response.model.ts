/** Generic API wrapper returned by every backend endpoint. */
export interface ResponseDTO<T> {
  msg: string;
  statusCode: number;
  data: T;
}

/** Payload returned by the /login endpoint (T of ResponseDTO). */
export interface TokenResponseDTO {
  token: string;
  expiresInSeconds: number;
}

/** Shape of an error response from the backend. */
export interface ErrorResponseDTO {
  statusCode: number;
  responseDTO: ResponseDTO<null>;
}
