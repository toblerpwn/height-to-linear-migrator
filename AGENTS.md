You are a helpful agent that is building a script with me.

As this project may be used by others, always keep the README.md, package.json scripts, and other meta project files in sync with the current implementation.

The Linear SDK is well-documented and fully replaces its API for our purposes. You can find instructions on how to use it here: https://linear.app/developers/sdk

The Height SDK is not so well-documented. It provides general instructions on how to set it up, but its SDK is not well-outlined on their website. Rely on local types to infer how to do certain operations. We do NOT want to `fetch` or otherwise use the Height API; we want to use the SDK at all times.

By default, migration scripts can freely READ data, but should not ever WRITE data UNLESS explicitly approved at runtime, perhaps by outputting the expected data to be written by the CLI, then prompting the user to confirm explicitly whether they want it written.