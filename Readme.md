## Apotek

Simple scaffolding tool using git repository for providing templates.

```js
npm i -g apotek
```

> Requires node > 6.0

### Concepts

**Apotek** does not provide any generator but it synchronizes with git repository to execute code.

Repository must respect the following specific structure :

```
\
+- command1
 +- index.js (code to execute)
 +- manifest.json (optional description file)
+- command2
 +- index.js
 ...
```

You can create many context each with a different repository.
Repositories are synchronized on every execution.

### How to use it

**Apotek** has been initially created to use with [vulcainjs project](http://www.vulcainjs.org/). 
A **default** context is defined referencing the [vulcainjs code template repository](https://github.com/vulcainjs/vulcain-code-generation-templates). 

This repository provides commands for initialize a new project or generate artefacts. This is a good example to see how to create your own commands.

For example, try ```apotek init --template vulcain-service``` to create a new **vulcainjs** micro service.

### How to create its own commands

  1. Create a new github repository
  2. Add a folder named 'MyCommand'
  3. Add it a file named index.js with the following code.

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
  5. Set **Apotek** to use your context with: ```apotek context mycontext --address <git repository address>```
  6. Run **Apotek** with 
  
   ```apotek``` : Display a list of commands to select. In this case, only one : **MyCommand**

   ```apotek MyCommand``` : Run directly your command by requesting your name.

   ```apotek MyCommand --name Boy``` : Execute your command and display **Hello Boy**

#### Manifest.json

You can add an optional **manifest.json** file close to the **index.js** to customize your command. The following properties are allowed:

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
- context object exposing execution context properties. See [source code](Executor) for details.

**exec** can return a command name which will be executed in the current context.

### Prompts

**Prompts** uses [inquirer](https://github.com/SBoudrias/Inquirer.js).

Prompts are made in order thanks to the generator function.

Using a generator function allows you to change question based on the previous answer.

> Prompt are displayed only if there is no value defined.

### Execution context

You can switch between context with ```apotek context <name>```` 
You can update a context with ```apotek context <name> [--address <address>] [--branch <branch>] [--set key=value]*```
**set** is used to set global initial state. Use ```unset key``` to remove a value.

You can force a context in a command scope by adding ```--context <name>``` to the command line.

