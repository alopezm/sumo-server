# Sumo Server
Simple server to control for sumo robot

## Instructions
```
    npm i
    node .index.js
```
### API

Base url: http://localhost:8080
Post Params:
* **m1** - Speed motor 1 - Integer [-255, 255]
* **m2** - Speed motor 2 - Integer [-255, 255]

### Socket

Events (Emit and listen):
* **motors** - Update or request the speed of the motors
  * **m1** - Speed motor 1 - Integer [-255, 255]
  * **m2** - Speed motor 2 - Integer [-255, 255]

## Developer
Anderson LM
