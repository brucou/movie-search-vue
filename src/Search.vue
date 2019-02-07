<template>
  <div class="App uk-light uk-background-secondary" v-bind:data-activePage="activePage">
    <div class="App__view-container" v-on:click="MOVIE_DETAILS_DESELECTED">
      <div class="App__view uk-margin-top-small uk-margin-left uk-margin-right" data-page="home">
        <div class="HomePage">
          <h1>TMDb UI – Home</h1>
          <legend class="uk-legend" v-bind:data-testid="PROMPT_TESTID">{{ PROMPT }}</legend>
          <div class="SearchBar uk-inline uk-margin-bottom">
            <a
                    class="uk-form-icon uk-form-icon-flip js-clear"
                    v-bind:uk-icon="!isDiscoveryMode ? 'icon:close' : 'icon:search'"
                    v-on:click="QUERY_RESETTED"
            >
            </a>
            <input
                    class="SearchBar__input uk-input js-input"
                    type="text"
                    v-on:input="QUERY_CHANGED"
                    v-bind:value="query || ''"
                    v-bind:data-testid="QUERY_FIELD_TESTID"
            />
          </div>
          <h3
                  class="uk-heading-bullet uk-margin-remove-top"
                  v-bind:data-testid="RESULTS_HEADER_TESTID"
          >
            {{ isDiscoveryMode ? POPULAR_NOW : SEARCH_RESULTS_FOR(query) }}
          </h3>
          <div class="ResultsContainer" v-bind:data-testid="RESULTS_CONTAINER_TESTID">
            <div v-if="isLoadingResults">{{ LOADING }}</div>
            <div v-if="isErrorResults" v-bind:data-testid="NETWORK_ERROR_TESTID">
              {{ NETWORK_ERROR }}
            </div>
            <ul v-if="hasResults" class="uk-thumbnav">
              <li v-for="result in filteredResults" class="uk-margin-bottom">
                <a
                        class="ResultsContainer__result-item js-result-click"
                        v-on:click="MOVIE_SELECTED(result, $event);"
                        v-bind:data-id="result.id"
                >
                  <div class="ResultsContainer__thumbnail-holder">
                    <img v-bind:src="imageTmdbUrl(result)" alt="" />
                  </div>
                  <div class="ResultsContainer__caption uk-text-small uk-text-muted">
                    {{ result.title }}
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div class="App__view uk-margin-top-small uk-margin-left uk-margin-right" data-page="item">
        <div v-if="hasMoviePage">
          <h1>{{ title || (details && details.title) }}</h1>
          <div v-if="isLoadingMovieDetails">{LOADING}</div>
          <div v-if="isErrorMovieDetails">{NETWORK_ERROR}</div>
          <div v-if="hasDetailsResults" class="MovieDetailsPage">
            <div class="MovieDetailsPage__img-container uk-margin-right" style="float: left">
              <img v-bind:src="imageTmdbDetailsUrl(details)" alt="" />
            </div>
            <dl class="uk-description-list">
              <dt>Popularity</dt>
              <dd>{{ details.vote_average }}</dd>
              <dt>Overview</dt>
              <dd>{{ details.overview }}</dd>
              <dt>Genres</dt>
              <dd>{{ details.genres.map(g => g.name).join(", ") }}</dd>
              <dt>Starring</dt>
              <dd>
                {{
                cast.cast
                .slice(0, 3)
                .map(cast => cast.name)
                .join(", ")
                }}
              </dd>
              <dt>Languages</dt>
              <dd>{{ details.spoken_languages.map(g => g.name).join(", ") }}</dd>
              <dt>Original Title</dt>
              <dd>{{ details.original_title }}</dd>
              <dt>Release Date</dt>
              <dd>{{ details.release_date }}</dd>
              <dt v-if="hasImdbId">IMDb URL</dt>
              <dd v-if="hasImdbId">
                <a v-bind:href="imageImdbUrl(details)">
                  {{ "https://www.imdb.com/title/" + details.imdb_id + "/" }}
                </a>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import {
    events,
    LOADING,
    NETWORK_ERROR,
    POPULAR_NOW,
    PROMPT,
    screens,
    SEARCH_RESULTS_FOR,
    testIds,
    COMMAND_RENDER
  } from "./properties";
  import { createStateMachine, NO_OUTPUT } from "state-transducer";
  import emitonoff from "emitonoff";
  import { commandHandlers, effectHandlers, movieSearchFsmDef } from "./fsm";
  import { applyJSONpatch } from "./helpers";

  const options = { initialEvent: { [events.USER_NAVIGATED_TO_APP]: void 0 } };
  const {
    RESULTS_CONTAINER_TESTID,
    QUERY_FIELD_TESTID,
    RESULTS_HEADER_TESTID,
    PROMPT_TESTID,
    NETWORK_ERROR_TESTID
  } = testIds;
  const {
    LOADING_SCREEN,
    SEARCH_RESULTS_SCREEN,
    SEARCH_ERROR_SCREEN,
    SEARCH_RESULTS_AND_LOADING_SCREEN,
    SEARCH_RESULTS_WITH_MOVIE_DETAILS_AND_LOADING_SCREEN,
    SEARCH_RESULTS_WITH_MOVIE_DETAILS,
    SEARCH_RESULTS_WITH_MOVIE_DETAILS_ERROR
  } = screens;
  const { QUERY_CHANGED, MOVIE_SELECTED, MOVIE_DETAILS_DESELECTED } = events;

  const fsm = createStateMachine(movieSearchFsmDef, {
    updateState: applyJSONpatch,
    debug: { console }
  });

  function subjectFromEventEmitterFactory() {
    const eventEmitter = emitonoff();
    const DUMMY_NAME_SPACE = "_";
    const _ = DUMMY_NAME_SPACE;
    const subscribers = [];

    return {
      next: x => eventEmitter.emit(_, x),
      complete: () => subscribers.forEach(f => eventEmitter.off(_, f)),
      subscribe: f => (subscribers.push(f), eventEmitter.on(_, f))
    };
  }

  const vueRenderCommandHandler = {
    [COMMAND_RENDER]: (next, params, effectHandlers, app) => {
      const { screen, query, results, title, details, cast } = params;
      const props = Object.assign({}, params, { next });

      app.set(props);
    }
  };
  const commandHandlersWithRender = Object.assign({}, commandHandlers, vueRenderCommandHandler);

  export default {
    name: "app",
    data: function() {
      return {
        screen: void 0,
        query: "",
        results: [],
        title: "",
        details: [],
        cast: [],
        next: void 0,
        RESULTS_CONTAINER_TESTID,
        QUERY_FIELD_TESTID,
        RESULTS_HEADER_TESTID,
        PROMPT_TESTID,
        NETWORK_ERROR_TESTID,
        POPULAR_NOW,
        PROMPT,
        NETWORK_ERROR,
        LOADING,
        SEARCH_RESULTS_FOR
      };
    },
    mounted: function() {
      const app = this;
      this.eventSubject = subjectFromEventEmitterFactory();
      this.outputSubject = subjectFromEventEmitterFactory();
      this.options = Object.assign({}, options);
      const NO_ACTION = this.options.NO_ACTION || NO_OUTPUT;

      // Set up execution of commands
      this.eventSubject.subscribe(eventStruct => {
        const actions = fsm(eventStruct);

        if (actions === NO_ACTION) return;
        actions.forEach(action => {
          if (action === NO_ACTION) return;
          const { command, params } = action;
          commandHandlersWithRender[command](
            this.eventSubject.next,
            params,
            effectHandlers,
            app,
            this.outputSubject
          );
        });
      });

      this.options.initialEvent && this.eventSubject.next(this.options.initialEvent);
    },
    destroyed: function() {
      this.eventSubject.complete();
      this.outputSubject.complete();
    },
    computed: {
      isDiscoveryMode: function() {
        return !this.query || this.query.length === 0;
      },
      filteredResults: function() {
        return this.results && this.results.filter(result => result.backdrop_path);
      },
      activePage: function() {
        return !this.screen ||
        [
          LOADING_SCREEN,
          SEARCH_RESULTS_AND_LOADING_SCREEN,
          SEARCH_ERROR_SCREEN,
          SEARCH_RESULTS_SCREEN
        ].indexOf(this.screen) > -1
          ? "home"
          : "item";
      },
      hasImdbId: function() {
        return this.details && this.details.imdb_id;
      },
      isLoadingResults: function() {
        return [LOADING_SCREEN, SEARCH_RESULTS_AND_LOADING_SCREEN].indexOf(this.screen) > -1;
      },
      isErrorResults: function() {
        return [SEARCH_ERROR_SCREEN].indexOf(this.screen) > -1;
      },
      hasResults: function() {
        return (
          [
            LOADING_SCREEN,
            SEARCH_RESULTS_SCREEN,
            SEARCH_RESULTS_WITH_MOVIE_DETAILS_AND_LOADING_SCREEN,
            SEARCH_RESULTS_WITH_MOVIE_DETAILS,
            SEARCH_RESULTS_WITH_MOVIE_DETAILS_ERROR
          ].indexOf(this.screen) > -1
        );
      },
      hasMoviePage: function() {
        return (
          [
            SEARCH_RESULTS_WITH_MOVIE_DETAILS_AND_LOADING_SCREEN,
            SEARCH_RESULTS_WITH_MOVIE_DETAILS,
            SEARCH_RESULTS_WITH_MOVIE_DETAILS_ERROR
          ].indexOf(this.screen) > -1
        );
      },
      isLoadingMovieDetails: function() {
        return [SEARCH_RESULTS_WITH_MOVIE_DETAILS_AND_LOADING_SCREEN].indexOf(this.screen) > -1;
      },
      isErrorMovieDetails: function() {
        return [SEARCH_RESULTS_WITH_MOVIE_DETAILS_ERROR].indexOf(this.screen) > -1;
      },
      hasDetailsResults: function() {
        return [SEARCH_RESULTS_WITH_MOVIE_DETAILS].indexOf(this.screen) > -1;
      }
    },
    methods: {
      imageTmdbUrl: function(result) {
        return "http://image.tmdb.org/t/p/w300" + result.backdrop_path;
      },
      imageTmdbDetailsUrl: function(details) {
        return "http://image.tmdb.org/t/p/w342" + details.poster_path;
      },
      imageImdbUrl: function(details) {
        return "https://www.imdb.com/title/" + details.imdb_id + "/";
      },
      // reminder : do not use fat arrow functions!
      // set allows to update the internal data for the component which triggers a redraw
      set: function(stateObj) {
        Object.keys(stateObj).forEach(key => (this[key] = stateObj[key]));
      },
      QUERY_CHANGED: function(ev) {
        return this.next({ [QUERY_CHANGED]: ev.target.value });
      },
      QUERY_RESETTED: function(ev) {
        return this.next({ [QUERY_CHANGED]: "" });
      },
      MOVIE_SELECTED: function(result, ev) {
        return this.next({ [MOVIE_SELECTED]: { movie: result } });
      },
      MOVIE_DETAILS_DESELECTED: function(ev) {
        return this.next({ [MOVIE_DETAILS_DESELECTED]: void 0 });
      },
      greet: function(event) {
        // `this` inside methods points to the Vue instance
        alert("Hello " + this.name + "!");
        // `event` is the native DOM event
        if (event) {
          alert(event.target.tagName);
        }
      }
    }
  };

</script>

<style src="./uikit.css"></style>

