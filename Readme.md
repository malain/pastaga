## Pastaga

Simple scaffolding tool using git repositories to provide templates.

```js
npm i -g pastaga
```

> Requires node > 6.0

### Concepts

**Pastaga** does not provide any generator but it synchronizes with a git repository to execute code.

Repository must respect the following structure :

```
\
+- command1
 +- index.js (code to execute)
 +- manifest.json (optional description file)
+- command2
 +- index.js
 ...
```

You can create as many contexts as required, each context having its own dedicated repository.
Beware that repositories are synchronized on every execution.

### How to use it

**Pastaga** has been initially created to use with [vulcainjs project](http://www.vulcainjs.org/).

A **default** context is defined referencing the [vulcainjs code template repository](https://github.com/vulcainjs/vulcain-code-generation-templates).

This repository provides commands to initialize a new project or generate artefacts. This is a good example to see how to create your own commands.

For example, you can invoke ```pastaga init --template vulcain-service``` to create a new **vulcainjs** micro service.

### How to create your own commands

  1. Create a new github repository
  2. Create a new folder named 'MyCommand'
  3. In this folder, add a file named index.js with the following code :

  ```js
  class Context {
      *prompts() {
        yield { name: 'name', type: 'input', message: "What's your name"};
      }

      exec() {
          console.log("Hello " + this.state.name);
      }
  }

  exports default = Context;
  ```

  4. Commit and publish your changes
  5. Set **Pastaga** to use your context with: ```pastaga context mycontext --address <git repository address>```
  6. Run **Pastaga** with

   ```pastaga``` : Display a list of commands to select. In this case, only one : **MyCommand**

   ```pastaga MyCommand``` : Run your command, ask for your name and display result.

   ```pastaga MyCommand --name Boy``` : Run your command with parameters and display **Hello Boy**

#### Manifest.json

You can add an optional **manifest.json** file in the same folder as **index.js** to customize your command. The following properties are allowed:

| Name | Description | Default value |
|-----|-----|------|
| name | Command name | Folder name |
| entryPoint | Context file name | index.js |
| state | Initial state | {} |
| description | Command description | |
| order | Display order | 100 |


### Command context class

Context class inherit two properties:

- state which contains every command options (from initial state and prompts)
- context object exposing execution context properties. See [source code](Executor.ts) for details.

**exec** can return a command name which will be executed in the current context.

### Prompts

**Prompts** uses [inquirer](https://github.com/SBoudrias/Inquirer.js).

Prompts are executed in order thanks to the generator function.

Using a generator function allows you to change question based on the previous answer.

> Prompts are displayed only if no value is provided when invoked.

### Execution context

You can switch between contexts with ```pastaga context <name>```

You can update a context with ```pastaga context <name> [--address <address>] [--branch <branch>] [--set key=value]*```

**set** is used to set global initial state. Use ```unset key``` to remove a value.

You can force a context in a command scope by adding ```--context <name>``` to the command line.
