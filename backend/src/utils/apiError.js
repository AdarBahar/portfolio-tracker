function getDefaultMessage(status) {
  switch (status) {
    case 400:
      return 'Bad request';
    case 401:
      return 'Unauthorized';
    case 403:
      return 'Forbidden';
    case 404:
      return 'Not found';
    default:
      return 'Internal server error';
  }
}

function sendError(res, status, message) {
  const msg = message || getDefaultMessage(status);
  return res.status(status).json({ error: msg });
}

function badRequest(res, message) {
  return sendError(res, 400, message);
}

function unauthorized(res, message) {
  return sendError(res, 401, message);
}

function forbidden(res, message) {
  return sendError(res, 403, message);
}

function notFound(res, message) {
  return sendError(res, 404, message);
}

function internalError(res, message) {
  return sendError(res, 500, message);
}

module.exports = {
  sendError,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  internalError
};

