game.module(
  'game.global'
)
.body(function() { 'use strict';

  // Global variables
  game.G = {

    /* Keyboard to default input layout mapping */
    KEY_MAP: {
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
    },

    /* Button order of gamepad */
    GAMEPAD_KEY_ORDER: [
      'X', 'A', 'B', 'Y',
      'LB', 'RB', 'LT', 'RT',
      'CANCEL', 'OK',
      'L3', 'R3'
    ],

    GROUPS: {
      BLOCK: 1,

      FRIEND: 10,
      FOE: 100,

      FRIEND_DAMAGER: 2,
      FOE_DAMAGER: 3
    }
  };


  // Define some useful const variables
  game.Vector.ZERO = new game.Vector();

  game.Vector.UP = new game.Vector(0, -1);
  game.Vector.DOWN = new game.Vector(0, 1);
  game.Vector.RIGHT = new game.Vector(1, 0);
  game.Vector.LEFT = new game.Vector(-1, 0);

});
