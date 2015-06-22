game.module(
  'game.playground'
)
.require(
  'plugins.gamepad',
  'plugins.eventemitter',
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
        position: sprite.position,
        shape: new game.Rectangle(w, h),
        collisionGroup: GROUPS.BLOCK
      }).addTo(game.scene.world);
    }
  });

  game.createClass('Playground', 'BaseScene', {
    backgroundColor: '#000',
    init: function() {
      var thickness = 20;
      new Wall(game.width * 0.5, thickness * 0.5, game.width, thickness, this.stage);
      new Wall(game.width * 0.5, game.height - thickness * 0.5, game.width, thickness, this.stage);
      new Wall(thickness * 0.5, game.height * 0.5, thickness, game.height, this.stage);
      new Wall(game.width - thickness * 0.5, game.height * 0.5, thickness, game.height, this.stage);

      new game.Cog(100, 100, this.stage);
    }
  });

});
