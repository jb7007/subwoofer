// api.js
// handles backend communication: signup + log submission

// sends a new user's credentials to the backend
export async function registerUser(username, password) {
  // send a post request to /register with json body
  const response = await fetch("/register", {
    method: "POST", // http method: we're creating a user
    headers: {
      "Content-Type": "application/json" // tells backend we're sending json
    },
    body: JSON.stringify({ username, password }) // turn js object into json string
  });

  // wait for the response and parse it as json (flask returns jsonified dict)
  const data = await response.json();

  // return a bundled object with everything we care about
  return {
    ok: response.ok,       // true if status is 200–299
    status: response.status, // http status code (e.g. 409, 500, etc.)
    data                   // the parsed response body from flask
  };
}

export async function loginUser(username, password) {
  // send a post request to /login with json body
  const response = await fetch("/login", {
    method: "POST", // http method: we're logging in
    headers: {
      "Content-Type": "application/json" // tells backend we're sending json
    },
    body: JSON.stringify({ username, password }) // turn js object into json string
  });

  // wait for the response and parse it as json (flask returns jsonified dict)
  const data = await response.json();


  // return a bundled object with everything we care about
  return {  
    ok: response.ok,       // true if status is 200–299
    status: response.status, // http status code (e.g. 401, 500, etc.)
    data                   // the parsed response body from flask
  };
}

// sends a new practice log to the backend
export async function submitLog(logData) {
  // post log to the /api/logs endpoint as json
  const response = await fetch("/api/logs", {
    method: "POST", // creating a new log
    headers: {
      "Content-Type": "application/json" // again, tell server we're sending json
    },
    body: JSON.stringify(logData) // stringify entire log object
  });

  // wait for response and parse it
  const data = await response.json();

  // return everything bundled for use in logic.js
  return {
    ok: response.ok,   // true if it worked
    data               // json message, maybe a redirect or error msg
  };
}

// gets the current user's logs
export async function fetchLogs() {
  const response = await fetch("/api/logs");

  const data = await response.json();
  return {
    ok: response.ok,
    data
  };
}

