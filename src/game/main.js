game.module(
  'game.main'
)
.require(
  'game.menu',
  'game.playground'
)
.body(function() { 'use strict';

  // Scene
  game.createScene('Main', {
    backgroundColor: '#000',

    init: function() {
      this.addTimer(10, function() {
        game.system.setScene('Menu');
      });
    }
  });

});
