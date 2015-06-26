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

  var KEY_MAP = game.G.KEY_MAP;


  // Data
  var menuData = {
    selects: [
      { label: 'Continue', msg: 'continue' },
      { label: 'Start', msg: 'start' },
      { label: 'Options', msg: 'options' },
      { label: 'Exit', msg: 'exitGame' }
    ]
  };


  // Object


  game.createClass('Menu', 'BaseScene', {
    backgroundColor: 0x000000,
    init: function() {
      var self = this;

      var border = new game.Graphics().addTo(this.stage);
      border.beginFill(0x555555);
      border.drawRect(-60, 5, 120, 24);
      border.endFill();
      border.x = game.system.width * 0.5;

      var baseY = 30;
      var items = menuData.selects.map(function(item, idx) {
        var text = new game.BitmapText(item.label, {
          font: 'KenPixel'
        }).addTo(self.stage);

        // Align to the center
        text.position.set(
          game.system.width * 0.5 - text.width * 0.5,
          baseY + idx * 24
        );

        return text;
      });

      // Streams
      var whenUpOrDown = game.R.fromEvents(this.events, 'axeschange')
        .map(function(dir) {
          if (dir.y < 0) {
            return -1;
          }
          else if (dir.y > 0) {
            return 1;
          }
          else {
            return 0;
          }
        })
        .skipDuplicates()
        .filter(function(dir) {
          return dir !== 0;
        });

      var cursorPointIndex = whenUpOrDown
        .scan(function(prev, next) {
          // Move between valid items
          if ((prev + next >= 0) && (prev + next < items.length)) {
            return prev + next;
          }
          else {
            return prev;
          }
        }, 0)
        .skipDuplicates();

      var whenPressedA = game.R.fromEvents(this.events, 'keydown')
        .filter(function(key) {
          return key === KEY_MAP.A;
        });

      var whenItemActivated = cursorPointIndex.sampledBy(whenPressedA);

      // Handlers
      function changeBorderPosition(idx) {
        border.position.y = items[idx].position.y;
      }

      function fireItemActiveEvent(idx) {
        self.events.emit(menuData.selects[idx].msg);
      }

      function continueGame() {
        console.log('continue from last time');
        game.system.setScene('Playground');
      }

      function startNewGame() {
        console.log('start new game');
        game.system.setScene('Playground');
      }

      function openOptions() {
        console.log('open options');
      }

      function exitGame() {
        console.log('exit from last time');
      }

      // Plug stream handlers
      cursorPointIndex.onValue(changeBorderPosition);
      whenItemActivated.onValue(fireItemActiveEvent);
      this.events.once('continue', continueGame);
      this.events.once('start', startNewGame);
      this.events.once('options', openOptions);
      this.events.once('exitGame', exitGame);

      // Cleanup things when leave the scene
      this.events.once('exit', function() {
        cursorPointIndex.offValue(changeBorderPosition);
        whenItemActivated.offValue(fireItemActiveEvent);

        self.events.off('continue', continueGame);
        self.events.off('start', startNewGame);
        self.events.off('options', openOptions);
        self.events.off('exitGame', exitGame);
      });
    }
  });

});
