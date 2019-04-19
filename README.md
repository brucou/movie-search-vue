# Motivation
This repository showcases the use of state machines to modelize user interfaces. The chosen 
technologies are :
 - [vue 2.x](https://vuejs.org/) for templating and rendering
 - [state-transducer](https://github.com/brucou/state-transducer) as state machine library
 - web components in order to have a reusable and portable implementation
 
Portability was important as the underlying idea is to port this application into many different
front-end frameworks. So far, implementation exists for :
  - [inferno](https://github.com/brucou/movie-search-app-inferno)
  - [nerv](https://github.com/brucou/movie-search-app-nerv)
  - [react](https://codesandbox.io/s/ym8vpqm7m9)
  - [ivi](https://github.com/brucou/movie-search-app-ivi)
  - [svelte](https://github.com/brucou/movie-search-app-svelte)
  - [dojo](https://codesandbox.io/s/jnvylz9jkw)
  
You can review the demo in the [codesandbox](https://codesandbox.io/s/p7xv6r1moq)


# Lesson learnt
Porting the application to Vue proved reasonably manageable (a few hours) :
- the IDE support (codesandbox) helped
- the vue extension tool was very helpful to verify assumptions
- some useful warnings appear in the console
- vue can also be used with a hyperscript syntax but it is far less convenient than the template 
syntax
- the template syntax is pretty well documented and it has ben simple to find answers to the 
common question a beginner has

However download the configuration from the Vue codesandbox has proved yet another exercise in 
frustation due to build problems. Some issues with css files also occurred. The `data` property 
can have constants together with values which can change. However it would have been better to 
have those constants in another dedicated property and reserve data to properties which can 
change and impact the view.

# Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run all tests
npm test
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).

# State machine
The state machine modelizing the search application is as follows :

![](movie%20search%20good%20fsm%20corrected%20flowchart%20no%20emphasis%20switchMap.png)
