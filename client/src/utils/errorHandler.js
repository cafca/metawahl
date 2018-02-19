// @flow

import { ErrorType } from '../types/';

function errorHandler(error: ErrorType, target?: string) {
  let errorMessage = null;

  // Error error
  if (error.message != null) errorMessage = error.message;

  // API error
  if (error.error != null && error.error.length > 0) errorMessage = error.error;

  if (errorMessage === "Failed to fetch")
    errorMessage = "Keine Verbindung zum Metawahl-Server";

  if (errorMessage != null) {
    console.log(errorMessage);
    this.setState({ [target || "error"]: errorMessage });
    return true
  } else {
    return false;
  }
}

export default errorHandler;