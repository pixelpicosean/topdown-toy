game.module(
  'game.base-scene'
)
.require(
  'plugins.gamepad',
  'plugins.reactive',

  'game.global'
)
.body(function() { 'use strict';

  // Variables
  var ZERO = game.Vector.ZERO;

  var UP = game.Vector.UP;
  var DOWN = game.Vector.DOWN;
  var RIGHT = game.Vector.RIGHT;
  var LEFT = game.Vector.LEFT;

  var KEY_MAP = game.G.KEY_MAP;
  var GAMEPAD_KEY_ORDER = game.G.GAMEPAD_KEY_ORDER;


  // Base class of scenes
  game.createScene('BaseScene', {
    pad: null,
    t3: null, // t3 axis value
    t3Dir: null, // t3 direction vector
    staticInit: function() {
      this.super();

      this.world = new game.World(0, 0);
      this.events = new game.EventEmitter();

      this.t3 = new game.Vector();
      this.t3Dir = new game.Vector();
      game.gamepad.onConnect(function(pad) {
        this.pad = pad;

        console.log('gamepad connected');

        pad.onButtonDown(this.paddown.bind(this));
        pad.onButtonUp(this.padup.bind(this));
        pad.onAxesChange(this.axeschange.bind(this));
      }.bind(this));
    },
    exit: function() {
      this.events.emit('exit');
    },
    keydown: function(key) {
      switch (key) {
        case KEY_MAP.UP:
          this.t3Dir.add(UP);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEY_MAP.DOWN:
          this.t3Dir.add(DOWN);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEY_MAP.LEFT:
          this.t3Dir.add(LEFT);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEY_MAP.RIGHT:
          this.t3Dir.add(RIGHT);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        default:
          this.events.emit('keydown', key);
      }
    },
    keyup: function(key) {
      switch (key) {
        case KEY_MAP.UP:
          this.t3Dir.subtract(UP);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEY_MAP.DOWN:
          this.t3Dir.subtract(DOWN);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEY_MAP.LEFT:
          this.t3Dir.subtract(LEFT);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEY_MAP.RIGHT:
          this.t3Dir.subtract(RIGHT);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        default:
          this.events.emit('keyup', key);
      }
    },
    paddown: function(idx) {
      // console.log('paddown: %s', KEY_MAP[GAMEPAD_KEY_ORDER[idx]]);
      this.events.emit('keydown', KEY_MAP[GAMEPAD_KEY_ORDER[idx]]);
    },
    padup: function(idx) {
      // console.log('padup: %s', KEY_MAP[GAMEPAD_KEY_ORDER[idx]]);
      this.events.emit('keyup', KEY_MAP[GAMEPAD_KEY_ORDER[idx]]);
    },
    axeschange: function(idx, value) {
      // console.log('axis[%d]: %s', idx, value.toFixed(2));
      switch(idx) {
        case 0:
          this.t3.x = value;
          break;
        case 1:
          this.t3.y = value;
          break;
      }

      this.events.emit('axeschange', this.t3);
    }
  });

});
