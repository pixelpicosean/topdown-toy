game.module(
  'game.main'
)
.require(
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
      var whenKeydown = game.R.fromEvents(game.scene.events, 'keydown');
      var whenKeyup = game.R.fromEvents(game.scene.events, 'keyup');

      function keyToDir(key) {
        switch (key) {
          case KEYS.LEFT:
            return LEFT;
          case KEYS.RIGHT:
            return RIGHT;
          case KEYS.UP:
            return UP;
          case KEYS.DOWN:
            return DOWN;
          default:
            return ZERO;
        }
      }
      function keyToOpDir(key) {
        switch (key) {
          case KEYS.LEFT:
            return RIGHT;
          case KEYS.RIGHT:
            return LEFT;
          case KEYS.UP:
            return DOWN;
          case KEYS.DOWN:
            return UP;
          default:
            return ZERO;
        }
      }

      var whenChangeDir = game.R.merge([
        whenKeydown.map(keyToDir),
        whenKeyup.map(keyToOpDir)
      ])
      .filter(function(dir) {
        return dir !== ZERO;
      })
      .map(function(dir) {
        return this._dir.add(dir);
      }.bind(this));

      var whenToRun = whenChangeDir.filter(function(dir) {
        return (dir.x !== 0) || (dir.y !== 0);
      });

      var whenToStop = whenChangeDir.filter(function(dir) {
        return (dir.x === 0) && (dir.y === 0);
      });

      var whenToShoot = whenKeydown.filter(function(key) {
        return key === KEYS.A;
      })
      .throttle(this.shootBetween);

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
      this.body.velocity.copy(this._dir).normalize().multiply(this.speed);
    },
    run: function() {
      // console.log('run');
      this.sprite.play('run');
      this.sprite.rotation = this.body.velocity.angle();
    },
    stand: function() {
      this.sprite.play('idle');
    },
    shoot: function() {
      // console.log('shoot');
    }
  });

  game.createScene('Main', {
  	backgroundColor: '#000',
    init: function() {
      this.world = new game.World(0, 0);
      this.events = new game.EventEmitter();

      new Cog(120, 120, this.stage);
    },
    keydown: function(key) {
      this.events.emit('keydown', key);
    },
    keyup: function(key) {
      this.events.emit('keyup', key);
    }
  });

});
