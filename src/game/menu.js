game.module(
  'game.menu'
)
.require(
  'plugins.gamepad',
  'plugins.eventemitter',
  'plugins.reactive',

  'game.global',
  'game.base-scene'
)
.body(function() { 'use strict';

  // Assets
  game.addAsset('font.fnt');


  // Variables
  var ZERO = new game.Vector();

  var UP = new game.Vector(0, -1);
  var DOWN = new game.Vector(0, 1);
  var RIGHT = new game.Vector(1, 0);
  var LEFT = new game.Vector(-1, 0);


  // Object


  game.createClass('Menu', 'BaseScene', {
    backgroundColor: '#000',
    init: function() {
      var continueLabel = new game.Text('Continue', {
        position: { x: 70, y: 60 },
        anchor: { x: 0.5 },
        align: 'center',
        font: 'KenPixel'
      }).addTo(this.stage);

      var startLabel = new game.Text('Start', {
        position: { x: 90, y: 80 },
        anchor: { x: 0.5 },
        align: 'center',
        font: 'KenPixel'
      }).addTo(this.stage);
    }
  });

});
