# API Middleware

Typically, APIs would have middleware to verify requests come from authorized users.

Unfortunately, Next.js doesn't have great support for middleware in v13. Instead, we are writing utilities and running them at the start of every API call.

authenticateApiUser verifies that a request included the appropriate Bearer authentication header. loadUser takes a decoded token from authenticateApiUser and loads the User object from the database.
