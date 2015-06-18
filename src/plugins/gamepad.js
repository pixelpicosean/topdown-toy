game.module(
    'plugins.gamepad'
)
.require(
    'engine.scene'
)
.body(function() {

game.createClass('GamePad', {
    axesChangeThreshold: 0.05,
    init: function(data) {
        this.index = data.index;
        this.buttons = game.copy(data.buttons);
        this.axes = game.copy(data.axes);
    },

    _buttonDown: function(index) {
        if (typeof this.buttonDownCallback === 'function') {
            this.buttonDownCallback(index);
        }
    },

    _buttonUp: function(index) {
        if (typeof this.buttonUpCallback === 'function') {
            this.buttonUpCallback(index);
        }
    },

    _axesChange: function(index, value) {
        if (typeof this.axesChangeCallback === 'function') {
            this.axesChangeCallback(index, value);
        }
    },

    onButtonDown: function(callback) {
        this.buttonDownCallback = callback;
    },

    onButtonUp: function(callback) {
        this.buttonUpCallback = callback;
    },

    onAxesChange: function(callback) {
        this.axesChangeCallback = callback;
    },

    _update: function(data) {
        var optAxesValue;
        for (var i = 0; i < data.axes.length; i++) {
            optAxesValue = applyDeadzoneMaximize(data.axes[i], this.deadzone, this.maximizeThreshold);

            var change = Math.abs(optAxesValue - this.axes[i]);

            if (change > this.axesChangeThreshold) {
                this.axes[i] = optAxesValue;
                this._axesChange(i, optAxesValue);
            }
        }

        for (var i = 0; i < data.buttons.length; i++) {
            if (!this.buttons[i].pressed && data.buttons[i].pressed) {
                this.buttons[i].pressed = true;
                this._buttonDown(i);
            }
            if (this.buttons[i].pressed && !data.buttons[i].pressed) {
                this.buttons[i].pressed = false;
                this._buttonUp(i);
            }
        }
    }
});

function applyDeadzoneMaximize(value, deadzone, maximizeThreshold) {
    var deadzone = typeof(deadzone) === 'number' ? deadzone : 0.05;
    var maximizeThreshold = typeof(maximizeThreshold) === 'number' ? maximizeThreshold : 0.95;

    if (value >= 0) {
        if (value < deadzone) {
            value = 0;
        }
        else if (value > maximizeThreshold) {
            value = 1;
        }
    }
    else {
        if (value > -deadzone) {
            value = 0;
        }
        else if (value < -maximizeThreshold) {
            value = -1;
        }
    }

    return value;
}

if (navigator.getGamepads || navigator.webkitGetGamepads) {
    game.Scene.inject({
        staticInit: function() {
            this.super();

            // Cleanup gamepad instances
            game.gamepads = {};
        },
        _update: function() {
            var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
            for (var i = 0; i < gamepads.length; i++) {
                var gamepad = gamepads[i];
                if (gamepad) {
                    if (!game.gamepads[gamepad.index]) {
                        game.gamepads[gamepad.index] = new game.GamePad(gamepad);
                        game.gamepad._connect(game.gamepads[gamepad.index]);
                    }
                    else {
                        game.gamepads[gamepad.index]._update(gamepad);
                    }
                }
            }
            this.super();
        }
    });
}

game.gamepads = {};

game.gamepad = {
    onConnect: function(callback) {
        this._onConnect = callback;
    },

    _connect: function(gamepad) {
        if (typeof this._onConnect === 'function') this._onConnect(gamepad);
    }
};

});
