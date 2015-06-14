game.module(
  'game.main'
)
.require(
  'plugins.gamepad',
  'plugins.eventemitter',
  'plugins.reactive'
)
.body(function() { 'use strict';

  // Assets
  game.addAsset('cog.png', 'cog');


  // Variables
  var ZERO = new game.Vector();

  var UP = new game.Vector(0, -1);
  var DOWN = new game.Vector(0, 1);
  var RIGHT = new game.Vector(1, 0);
  var LEFT = new game.Vector(-1, 0);

  var KEYS = {
    UP: 'W',
    DOWN: 'S',
    LEFT: 'A',
    RIGHT: 'D',

    A: 'K',
    B: 'L',
    X: 'J',
    Y: 'I',

    CANCEL: 'ESC',
    OK: 'ENTER'
  };

  var PAD_MAP = [
    'X', 'A', 'B', 'Y',
    'LB', 'RB', 'LT', 'RT',
    'CANCEL', 'OK',
    'L3', 'R3'
  ];


  // Object
  var Cog = game.Class.extend({
    speed: 50,
    shootBetween: 900,

    sprite: null,
    body: null,

    _dir: null,
    init: function(x, y, container) {
      this._dir = ZERO.clone();

      this.sprite = new game.SpriteSheet('cog', 24, 24).anim().addTo(container);
      this.sprite.anchor.set(12, 12);
      this.sprite.addAnim('idle', [0], { speed: 2 });
      this.sprite.addAnim('run', [0, 1, 2, 3], { speed: 8 });
      this.sprite.position.set(x, y);

      this.body = new game.Body({
        position: this.sprite.position,
        shape: new game.Rectangle(16, 16)
      }).addTo(game.scene.world);

      // Streams
      var whenChangeDir = game.R.fromEvents(game.scene.events, 'axeschange');

      var whenKeydown = game.R.fromEvents(game.scene.events, 'keydown');
      var whenKeyup = game.R.fromEvents(game.scene.events, 'keyup');

      var whenToRun = whenChangeDir.filter(function(dir) {
        return (dir.x !== 0) || (dir.y !== 0);
      });

      var whenToStop = whenChangeDir.filter(function(dir) {
        return (dir.x === 0) && (dir.y === 0);
      });

      var whenToShoot = whenKeydown.filter(function(key) {
        return key === KEYS.A;
      })
      .throttle(this.shootBetween, { trailing: false });

      // Handlers
      var changeDir = this.changeDir.bind(this);
      var run = this.run.bind(this);
      var stand = this.stand.bind(this);
      var shoot = this.shoot.bind(this);

      // Start
      whenChangeDir.onValue(changeDir);
      whenToRun.onValue(run);
      whenToStop.onValue(stand);
      whenToShoot.onValue(shoot);

      this.remove = function() {
        whenChangeDir.offValue(changeDir);
        whenToRun.offValue(run);
        whenToStop.offValue(stand);
        whenToShoot.offValue(shoot);
      };
    },

    changeDir: function(dir) {
      this.body.velocity.copy(dir).normalize().multiply(this.speed);
    },
    run: function() {
      // console.log('run');
      (this.sprite.currentAnim !== 'run') && this.sprite.play('run');
      this.sprite.rotation = this.body.velocity.angle();
    },
    stand: function() {
      this.sprite.play('idle');
    },
    shoot: function() {
      console.log('shoot');
    }
  });

  game.createScene('Main', {
  	backgroundColor: '#000',
    pad: null,
    t3: null, // t3 axis value
    t3Dir: null, // t3 direction vector
    init: function() {
      this.world = new game.World(0, 0);
      this.events = new game.EventEmitter();

      new Cog(120, 120, this.stage);

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

    keydown: function(key) {
      switch (key) {
        case KEYS.UP:
          this.t3Dir.add(UP);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEYS.DOWN:
          this.t3Dir.add(DOWN);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEYS.LEFT:
          this.t3Dir.add(LEFT);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEYS.RIGHT:
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
        case KEYS.UP:
          this.t3Dir.subtract(UP);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEYS.DOWN:
          this.t3Dir.subtract(DOWN);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEYS.LEFT:
          this.t3Dir.subtract(LEFT);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        case KEYS.RIGHT:
          this.t3Dir.subtract(RIGHT);
          this.t3.copy(this.t3Dir).normalize();
          this.events.emit('axeschange', this.t3);
          break;
        default:
          this.events.emit('keyup', key);
      }
    },
    paddown: function(idx) {
      // console.log('paddown: %s', KEYS[PAD_MAP[idx]]);
      this.events.emit('keydown', KEYS[PAD_MAP[idx]]);
    },
    padup: function(idx) {
      // console.log('padup: %s', KEYS[PAD_MAP[idx]]);
      this.events.emit('keyup', KEYS[PAD_MAP[idx]]);
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
