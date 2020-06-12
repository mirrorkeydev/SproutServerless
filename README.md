# SproutServerless

`aws configure` to add new access token and link cli to account (go to user console > IAM > name > etc to create tokens)


`npm i -g serverless` because serverless is an npm package

`serverless create -t aws-nodejs-typescript` to make template project

```
webpack.config.js
 - we add 'aws-sdk' to externals: [nodeExternals(), 'aws-sdk'],
```

```
serverless.yml
 - we add region: us-west-2, memorySize: 128, and timeout: 10 to the provider section
```

`serverless plugin install -n serverless-offline` so that we can debug our api offline

`serverless package` (info) does all the bundling but doesn't actually deploy anything, it's kinda like building

to debug the program with breakpoints, the ./.vscode/launch.json sets configs. then the debug button should just say "lambda" and just work. alternatively, `serverless offline` will also do something similar but without breakpoints.