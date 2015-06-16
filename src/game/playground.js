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

  game.createClass('Playground', 'BaseScene', {
    backgroundColor: '#000',
    init: function() {
      new game.Cog(120, 120, this.stage);
    }
  });

});
