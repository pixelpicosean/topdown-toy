game.module(
  'game.cog'
)
.require(
  'game.global'
)
.body(function() { 'use strict';

  // Assets
  game.addAsset('cog.png', 'cog');


  // Variables
  var ZERO = game.Vector.ZERO;

  var UP = game.Vector.UP;
  var DOWN = game.Vector.DOWN;
  var RIGHT = game.Vector.RIGHT;
  var LEFT = game.Vector.LEFT;

  var KEY_MAP = game.G.KEY_MAP;

  var GROUPS = game.G.GROUPS;


  // Object
  game.createClass('Cog', {
    speed: 50,
    shootBetween: 900,

    sprite: null,
    body: null,

    _dir: null,
    init: function(x, y, container) {
      this._dir = ZERO.clone();

      this.sprite = new game.SpriteSheet('cog', 24, 24).anim().addTo(container);
      this.sprite.anchor.set(0.5, 0.5);
      this.sprite.addAnim('idle', [0], { speed: 4 });
      this.sprite.addAnim('run', [0, 1, 2, 3], { speed: 8 });
      this.sprite.position.set(x, y);

      this.body = new game.Body({
        position: this.sprite.position,
        shape: new game.Rectangle(16, 16),
        collisionGroup: GROUPS.FRIEND,
        collideAgainst: [GROUPS.BLOCK]
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
        return key === KEY_MAP.A;
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
      new game.Bullet(this.body.position, this.sprite.rotation, this.sprite.parent);
    }
  });

  game.createClass('Bullet', {
    speed: 100,
    init: function(pos, angle, container) {
      var g = new game.Graphics().addTo(container);
      g.beginFill(0xffeb3b);
      g.drawRect(-8, -3, 16, 6);
      g.endFill();

      g.position.copy(pos);

      var body = new game.Body({
        position: g.position,
        shape: new game.Rectangle(16, 6)
      }).addTo(game.scene.world);
      body.velocity.set(1, 0)
        .rotate(angle)
        .multiply(this.speed);
    }
  });

});
