/**
  @module loader
**/
game.module(
  'engine.loader'
)
.body(function() { 'use strict';

  /**
    Dynamic loader for assets and audio files.
    @class Loader
    @constructor
    @param {Function|String} callback Callback function or scene name
  **/
  game.createClass('Loader', {
    /**
      Number of files loaded.
      @property {Number} loaded
    **/
    loaded: 0,
    /**
      Percent of files loaded.
      @property {Number} percent
    **/
    percent: 0,
    /**
      List of assets to load.
      @property {Array} assetQueue
    **/
    assetQueue: [],
    /**
      List of audios to load.
      @property {Array} audioQueue
    **/
    audioQueue: [],
    /**
      Is loader started.
      @property {Boolean} started
      @default false
    **/
    started: false,
    dynamic: true,
    callback: null,

    init: function(callback) {
      this.onComplete(callback);
      this.stage = game.system.stage;

      for (var i = 0; i < game.assetQueue.length; i++) {
        if (game.TextureCache[game.assetQueue[i]]) continue;
        this.assetQueue.push(this.getPath(game.assetQueue[i]));
      }
      game.assetQueue.length = 0;

      if (game.Audio.enabled) {
        for (var i = 0; i < game.audioQueue.length; i++) {
          this.audioQueue.push(game.audioQueue[i]);
        }
        game.audioQueue.length = 0;
      }

      if (this.assetQueue.length > 0) {
        this.loader = game.PIXI.loader.add(this.assetQueue);
        this.loader.on('progress', this.progress, this);
        this.loader.on('complete', this.loadAudio, this);
        this.loader.on('error', this.error, this);
      }

      if (this.assetQueue.length + this.audioQueue.length === 0) this.percent = 100;
    },

    /**
      Init loader stage, when not using dynamic mode.
      @method initStage
    **/
    initStage: function() {
      var barWidth = game.Loader.barWidth;
      var barHeight = game.Loader.barHeight;

      this.barBg = new game.Graphics();
      this.barBg.beginFill(game.Loader.barBgColor);
      this.barBg.drawRect(0, 0, barWidth, barHeight);
      this.barBg.position.set(Math.round(game.system.width / 2 - (barWidth / 2)), Math.round(game.system.height / 2 - (barHeight / 2)));
      this.stage.addChild(this.barBg);

      this.barFg = new game.Graphics();
      this.barFg.beginFill(game.Loader.barColor);
      this.barFg.drawRect(0, 0, barWidth, barHeight);
      this.barFg.position.set(Math.round(game.system.width / 2 - (barWidth / 2)), Math.round(game.system.height / 2 - (barHeight / 2)));
      this.barFg.scale.x = this.percent / 100;
      this.stage.addChild(this.barFg);
    },

    /**
      Set callback function or scene name for loader.
      @method onComplete
      @param {Function|String} callback
    **/
    onComplete: function(callback) {
      if (typeof callback === 'string' || game.System.startScene) this.dynamic = false;
      this.callback = callback;
      return this;
    },

    /**
      Start loader.
      @method start
    **/
    start: function() {
      this.started = true;

      if (!this.dynamic) {
        for (var i = this.stage.children.length - 1; i >= 0; i--) {
          this.stage.removeChild(this.stage.children[i]);
        }
        if (game.tweenEngine) game.tweenEngine.removeAll();

        game.system.renderer.backgroundColor = game.Loader.bgColor;

        this.initStage();

        if (!game.scene) this.loopId = game._setGameLoop(this.run.bind(this), game.system.canvas);
        else game.scene = this;
      }

      this.startTime = Date.now();

      if (this.assetQueue.length > 0) this.loader.load();
      else if (this.audioQueue.length > 0) this.loadAudio();
      else if (this.dynamic) this.ready();
    },

    error: function(path) {
      throw 'loading file ' + path;
    },

    progress: function(loader, res) {
      if (res.isJson) game.json[loader.url] = res.data;
      if (!(res.isImage && game.Loader.isSpriteAtlas(res))) {
        this.loaded++;

        this.percent = Math.round(this.loaded / (this.assetQueue.length + this.audioQueue.length) * 100);
        this.onPercentChange();
      }

      if (this.dynamic && this.loaded === this.assetQueue.length + this.audioQueue.length) this.ready();
    },

    /**
      Called when percent is changed.
      @method onPercentChange
    **/
    onPercentChange: function() {
      if (this.barFg) this.barFg.scale.x = this.percent / 100;
    },

    loadAudio: function() {
      for (var i = this.audioQueue.length - 1; i >= 0; i--) {
        game.audio._load(this.audioQueue[i], this.progress.bind(this), this.error.bind(this, this.audioQueue[i]));
      }
    },

    ready: function() {
      if (game.system.hires || game.system.retina) {
        for (var i in game.TextureCache) {
          if (i.indexOf('@' + game.scale + 'x') !== -1) {
            game.TextureCache[i.replace('@' + game.scale + 'x', '')] = game.TextureCache[i];
            delete game.TextureCache[i];
          }
        }
      }

      if (typeof this.callback === 'function') this.callback();
      else this.setScene();
    },

    setScene: function() {
      game.system.timer.last = 0;
      game.Timer.time = Number.MIN_VALUE;
      if (this.loopId) game._clearGameLoop(this.loopId);
      if (game.System.startScene) {
        var startScene = game.System.startScene;
        game.System.startScene = null;
        game.system.setScene(startScene);
      }
      else game.system.setScene(this.callback);
    },

    run: function() {
      if (this.loopId) {
        this.last = game.Timer.time;
        game.Timer.update();
        game.system.delta = (game.Timer.time - this.last) / 1000;
      }

      this.update();
      this.render();
    },

    update: function() {
      if (game.tweenEngine) game.tweenEngine.update();

      if (this._ready) return;
      if (this.timeoutTimer) {
        if (this.timeoutTimer.time() >= 0) {
          this._ready = true;
          this.ready();
        }
      }
      else if (this.loaded === this.assetQueue.length + this.audioQueue.length) {
        var loadTime = Date.now() - this.startTime;
        var waitTime = Math.max(0, game.Loader.time - loadTime);
        this.timeoutTimer = new game.Timer(waitTime);
      }
    },

    render: function() {
      game.system.renderer.render(this.stage);
    },

    getPath: function(path) {
      return game.system.retina || game.system.hires ? path.replace(/\.(?=[^.]*$)/, '@' + game.scale + 'x.') : path;
    }
  });

  var JSON_ATLAS_SURFIX = 'json_image';
  game.Loader.isSpriteAtlas = function isSpriteAtlas(res) {
    return res.name.slice(-JSON_ATLAS_SURFIX.length) == JSON_ATLAS_SURFIX;
  }

  game.addAttributes('Loader', {
    /**
      Minimum time to show loader (ms). Not used in dynamic mode.
      @attribute {Number} time
      @default 200
    **/
    time: 200,
    /**
      Loading bar color.
      @attribute {Number} bgColor
      @default 0x000000
    **/
    bgColor: 0x000000,
    /**
      Loading bar color.
      @attribute {Number} barColor
      @default 0xe6e7e8
    **/
    barColor: 0xe6e7e8,
    /**
      Loading bar background color.
      @attribute {Number} barBgColor
      @default 0x515e73
    **/
    barBgColor: 0x515e73,
    /**
      Width of the loading bar.
      @attribute {Number} barWidth
      @default 200
    **/
    barWidth: 200,
    /**
      Height of the loading bar.
      @attribute {Number} barHeight
      @default 20
    **/
    barHeight: 20,
    /**
      Threat requests as crossorigin.
      @attribute {Boolean} crossorigin
      @default false
    **/
    crossorigin: false,
    /**
      Default loader class name.
      @attribute {String} className
      @default Loader
    **/
    className: 'Loader'
  });

});
