game.module(
  'game.playground'
)
.require(
  'plugins.gamepad',
  'plugins.reactive',

  'game.global',
  'game.base-scene',

  'game.cog'
)
.body(function() { 'use strict';

  var GROUPS = game.G.GROUPS;

  var Wall = game.Class.extend({
    init: function(x, y, w, h, container) {
      var sprite = new game.Graphics().addTo(container);
      sprite.beginFill('#607d8b');
      sprite.drawRect(-w * 0.5, -h * 0.5, w, h);
      sprite.position.set(x, y);

      var body = new game.Body({
        position: { x: x, y: y },
        shape: new game.Rectangle(w, h),
        collisionGroup: GROUPS.BLOCK
      }).addTo(game.scene.world);
    }
  });

  game.createClass('Playground', 'BaseScene', {
    backgroundColor: 0x000000,
    init: function() {
      var thickness = 20;
      new Wall(game.system.width * 0.5, thickness * 0.5, game.system.width, thickness, this.stage);
      new Wall(game.system.width * 0.5, game.system.height - thickness * 0.5, game.system.width, thickness, this.stage);
      new Wall(thickness * 0.5, game.system.height * 0.5, thickness, game.system.height, this.stage);
      new Wall(game.system.width - thickness * 0.5, game.system.height * 0.5, thickness, game.system.height, this.stage);

      new game.Cog(100, 100, this.stage);
    }
  });

});
