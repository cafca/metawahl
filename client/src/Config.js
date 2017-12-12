// @flow

export const DATA_DIR = "/data";
export const API_ROOT = !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
  ? "http://localhost:8000/api/v1"
  : "http://demo.vincentahrend.com:9000/api/v1/";
