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
      var border = new game.Graphics().addTo(this.stage);
      border.beginFill('#555');
      border.drawRect(-60, -12, 120, 24);

      var items = [];
      var baseY = 40;

      items.push(
        new game.Text('Continue', {
          position: { x: 70, y: baseY + items.length * 24 },
          anchor: { x: 0.5 },
          align: 'center',
          font: 'KenPixel'
        }).addTo(this.stage)
      );
      items.push(
        new game.Text('Start', {
          position: { x: 90, y: baseY + items.length * 24 },
          anchor: { x: 0.5 },
          align: 'center',
          font: 'KenPixel'
        }).addTo(this.stage)
      );
      items.push(
        new game.Text('Options', {
          position: { x: 76, y: baseY + items.length * 24 },
          anchor: { x: 0.5 },
          align: 'center',
          font: 'KenPixel'
        }).addTo(this.stage)
      );
      items.push(
        new game.Text('Exit', {
          position: { x: 100, y: baseY + items.length * 24 },
          anchor: { x: 0.5 },
          align: 'center',
          font: 'KenPixel'
        }).addTo(this.stage)
      );

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

      var whenCursorMoved = whenUpOrDown
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

      // Handlers
      function onCursorMoved(idx) {
        border.position.copy(items[idx].position)
          .add(items[idx].width * 0.5, items[idx].height * 0.5 + 4);
      }

      // Plug stream handlers
      whenCursorMoved.onValue(onCursorMoved);

      // Cleanup things when leave the scene
      this.events.once('exit', function() {
        whenCursorMoved.offValue(onCursorMoved);
      });
    }
  });

});
