/**
    @module renderer
    @namespace game
**/
game.module(
    'engine.renderer'
)
.require(
    'engine.pixi',
    'engine.geometry'
)
.body(function() {
'use strict';

game.PIXI.dontSayHello = true;
game.PIXI.RETINA_PREFIX = false;

game.autoDetectRenderer = game.PIXI.autoDetectRenderer;

/**
    @class AnimationData
    @constructor
    @param {Array} frames
    @param {Object} [props]
**/
game.createClass('AnimationData', {
    /**
        Is animation looping.
        @property {Boolean} loop
        @default true
    **/
    loop: true,
    /**
        Function that is called, when animation is completed.
        @property {Function} onComplete
    **/
    onComplete: null,
    /**
        Play animation in random order.
        @property {Boolean} random
        @default false
    **/
    random: false,
    /**
        Play animation in reverse.
        @property {Boolean} reverse
        @default false
    **/
    reverse: false,
    /**
        Speed of animation (frames per second).
        @property {Number} speed
        @default 10
    **/
    speed: 10,
    /**
        Animation frame order.
        @property {Array} frames
    **/
    frames: null,

    staticInit: function(frames, props) {
        this.frames = frames;
        game.merge(this, props);
    }
});

/**
    http://www.goodboydigital.com/pixijs/docs/classes/MovieClip.html
    @class Animation
    @extends game.DisplayObject
    @constructor
    @param {Array} textures Textures this animation made up of
**/
game.Animation = function(textures) {
    this.anims = {};
    this.currentAnim = 'default';
    this.currentFrame = 0;
    this.playing = false;
    this._frameTime = 0;

    this.textures = textures;

    if (typeof this.textures === 'string' && this.textures.indexOf('json') !== -1) {
        var json = game.getJSON(this.textures);
        this.textures = [];
        for (var name in json.frames) {
            this.textures.push(name);
        }
    }

    var newTextures = [];
    for (var i = 0; i < this.textures.length; i++) {
        var texture = this.textures[i];
        if (!(texture instanceof game.Texture)) {
            texture = game.Texture.fromAsset(texture);
        }

        newTextures.push(texture);
    }
    this.textures = newTextures;

    this.addAnim('default');

    game.PIXI.Sprite.call(this, this.textures[0]);
};

game.Animation.prototype = Object.create(game.PIXI.Sprite.prototype);
game.Animation.prototype.constructor = game.Animation;

/**
    Add new animation.
    @method addAnim
    @param {String} name
    @param {Array} [frames]
    @param {Object} [props]
    @chainable
**/
game.Animation.prototype.addAnim = function(name, frames, props) {
    if (!name) return;
    if (!frames) {
        frames = [];
        for (var i = 0; i < this.textures.length; i++) {
            frames.push(i);
        }
    }
    var anim = new game.AnimationData(frames, props);
    this.anims[name] = anim;
    return this;
};

/**
    Play animation.
    @method play
    @param {String} name Name of animation
    @param {Number} [frame] Frame index
    @chainable
**/
game.Animation.prototype.play = function(name, frame) {
    name = name || this.currentAnim;
    var anim = this.anims[name];
    if (!anim) return;
    this.playing = true;
    this.currentAnim = name;
    if (typeof frame !== 'number' && anim.reverse) {
        frame = anim.frames.length - 1;
    }
    this.gotoFrame(frame || 0);
    return this;
};

/**
    Stop animation.
    @method stop
    @param {Number} [frame] Frame index
    @chainable
**/
game.Animation.prototype.stop = function(frame) {
    this.playing = false;
    if (typeof frame === 'number') this.gotoFrame(frame);
    return this;
};

/**
    Jump to specific frame.
    @method gotoFrame
    @param {Number} frame
    @chainable
**/
game.Animation.prototype.gotoFrame = function(frame) {
    var anim = this.anims[this.currentAnim];
    if (!anim) return;
    this.currentFrame = frame;
    this._frameTime = 0;
    this.setTexture(this.textures[anim.frames[frame]]);
    return this;
};

/**
    @method updateAnimation
**/
game.Animation.prototype.updateAnimation = function() {
    var anim = this.anims[this.currentAnim];

    if (this.playing) this._frameTime += anim.speed * game.system.delta;

    if (this._frameTime >= 1) {
        this._frameTime = 0;

        if (anim.random && anim.frames.length > 1) {
            var nextFrame = this.currentFrame;
            while (nextFrame === this.currentFrame) {
                var nextFrame = Math.round(Math.random(0, anim.frames.length - 1));
            }

            this.currentFrame = nextFrame;
            this.setTexture(this.textures[anim.frames[nextFrame]]);
            return;
        }

        var nextFrame = this.currentFrame + (anim.reverse ? -1 : 1);

        if (nextFrame >= anim.frames.length) {
            if (anim.loop) {
                this.currentFrame = 0;
                this.setTexture(this.textures[anim.frames[0]]);
            }
            else {
                this.playing = false;
                if (anim.onComplete) anim.onComplete();
            }
        }
        else if (nextFrame < 0) {
            if (anim.loop) {
                this.currentFrame = anim.frames.length - 1;
                this.setTexture(this.textures[anim.frames.last()]);
            }
            else {
                this.playing = false;
                if (anim.onComplete) anim.onComplete();
            }
        }
        else {
            this.currentFrame = nextFrame;
            this.setTexture(this.textures[anim.frames[nextFrame]]);
        }
    }
};

game.Animation.prototype.updateTransform = function() {
    if (this.currentAnim) this.updateAnimation();
    game.PIXI.Sprite.prototype.updateTransform.call(this);
};

/**
    Create animation from frames starting with name.
    @method fromFrames
    @static
    @param {String} name
    @return {Animation}
**/
game.Animation.fromFrames = function(name) {
    var textures = [];
    for (var i in game.Texture.cache) {
        if (i.indexOf(name) === 0) textures.push(game.Texture.cache[i]);
    }
    if (textures.length > 0) return new game.Animation(textures);
};


game.AssetLoader = game.PIXI.AssetLoader;
game.blendModes = game.PIXI.blendModes;

/**
    http://www.goodboydigital.com/pixijs/docs/classes/BaseTexture.html
    @class BaseTexture
**/
game.BaseTexture = game.PIXI.BaseTexture;

/**
    http://www.goodboydigital.com/pixijs/docs/classes/BitmapText.html
    @class BitmapText
**/
game.BitmapText = game.PIXI.BitmapText;
game.CanvasRenderer = game.PIXI.CanvasRenderer;

/**
    http://www.goodboydigital.com/pixijs/docs/classes/DisplayObjectContainer.html
    @class Container
    @extends game.DisplayObject
**/
game.Container = game.PIXI.DisplayObjectContainer;

/**
    http://www.goodboydigital.com/pixijs/docs/classes/DisplayObject.html
    @class DisplayObject
**/
game.DisplayObject = game.PIXI.DisplayObject;

/**
    Remove from it's parent.
    @method remove
**/
game.DisplayObject.prototype.remove = function() {
    if (this.parent) this.parent.removeChild(this);
};

/**
    Add to container.
    @method addTo
    @param {game.DisplayObject|game.Container} container
**/
game.DisplayObject.prototype.addTo = function(container) {
    container.addChild(this);
    return this;
};

/**
    http://www.goodboydigital.com/pixijs/docs/classes/Graphics.html
    @class Graphics
    @extends game.DisplayObject
**/
game.Graphics = game.PIXI.Graphics;
game.HitCircle = game.PIXI.Circle;
game.HitEllipse = game.PIXI.Ellipse;
game.HitPolygon = game.PIXI.Polygon;
game.HitRectangle = game.PIXI.Rectangle;

game.Point = game.PIXI.Point = game.Vector;

/**
    http://www.goodboydigital.com/pixijs/docs/classes/RenderTexture.html
    @class RenderTexture
**/
game.RenderTexture = game.PIXI.RenderTexture;

/**
    http://www.goodboydigital.com/pixijs/docs/classes/Spine.html
    @class Spine
    @extends game.DisplayObject
    @constructor
    @param {String} id Asset ID
    @param {Object} [properties] Properties to merge to this animation
**/
game.Spine = function(id, properties) {
    game.PIXI.Spine.call(this, game.paths[id] || id);
    game.merge(this, properties);
};

game.Spine.prototype = Object.create(game.PIXI.Spine.prototype);
game.Spine.prototype.constructor = game.Spine;

/**
    Play animation.
    @method play
    @param {String} anim Name of animation.
    @param {Boolean} loop Animation looping.
    @param {Boolean} after Start after current animation.
**/
game.Spine.prototype.play = function(anim, loop, after) {
    if (after) this.state.addAnimationByName(anim, !!loop);
    else this.state.setAnimationByName(anim, !!loop);
};

/**
    Mix two animations for smooth transition.
    @method mix
    @param {String} from Animation name to mix from.
    @param {String} to Animation name to mix to.
    @param {Number} value Percent of mix.
**/
game.Spine.prototype.mix = function(from, to, value) {
    this.stateData.setMixByName(from, to, value / 100);
};

/**
    http://www.goodboydigital.com/pixijs/docs/classes/Sprite.html
    @class Sprite
    @extends game.DisplayObject
    @constructor
    @param {String} texture
    @param {Number} [x]
    @param {Number} [y]
    @param {Object} [properties]
**/
game.Sprite = function(texture, x, y, properties) {
    if (typeof texture === 'string') {
        texture = game.paths[texture] || texture;
        texture = game.Texture.fromFrame(texture);
    }
    game.PIXI.Sprite.call(this, texture);

    game.merge(this, properties);

    this.position.set(x * game.scale, y * game.scale);

    // Auto bind touch events for mobile
    if (game.device.mobile && !this.tap && this.click) this.tap = this.click;
    if (game.device.mobile && !this.touchmove && this.mousemove) this.touchmove = this.mousemove;
    if (game.device.mobile && !this.touchstart && this.mousedown) this.touchstart = this.mousedown;
    if (game.device.mobile && !this.touchend && this.mouseup) this.touchend = this.mouseup;
    if (game.device.mobile && !this.touchendoutside && this.mouseupoutside) this.touchendoutside = this.mouseupoutside;
};

game.Sprite.prototype = Object.create(game.PIXI.Sprite.prototype);
game.Sprite.prototype.constructor = game.Sprite;

game.Sprite.prototype.setTexture = function(texture) {
    if (typeof texture === 'string') {
        texture = game.paths[texture] || texture;
        texture = game.Texture.fromFrame(texture);
    }
    game.PIXI.Sprite.prototype.setTexture.call(this, texture);
};

/**
    Crop sprite.
    @method crop
    @param {Number} x The x coordinate of left-top point to crop
    @param {Number} y The y coordinate of left-top point to crop
    @param {Number} width The width of sprite to crop to
    @param {Number} height The height of sprite to crop to
    @chainable
**/
game.Sprite.prototype.crop = function(x, y, width, height) {
    var texture = new game.PIXI.Texture(this.texture, new game.HitRectangle(x, y, width, height));
    this.setTexture(texture);
    return this;
};

/**
    Position sprite to system center.
    @method center
    @param {Number} offsetX Offset x coordinate to system center
    @param {Number} offsetY Offset y coordinate to system center
    @chainable
**/
game.Sprite.prototype.center = function(offsetX, offsetY) {
    this.position.x = game.system.width / 2 - this.width / 2 + this.width * this.anchor.x;
    this.position.y = game.system.height / 2 - this.height / 2 + this.height * this.anchor.y;
    this.position.x += offsetX || 0;
    this.position.y += offsetY || 0;
    return this;
};

game.Sprite.fromFrame = game.PIXI.Sprite.fromFrame;
game.Sprite.fromImage = game.PIXI.Sprite.fromImage;

game.Stage = game.PIXI.Stage;

/**
    http://www.goodboydigital.com/pixijs/docs/classes/Text.html
    @class Text
**/
game.Text = game.PIXI.Text;

/**
    http://www.goodboydigital.com/pixijs/docs/classes/Texture.html
    @class Texture
**/
game.Texture = game.PIXI.Texture;
game.Texture.fromAsset = function(id) {
    var path = game.paths[id] || id;
    var texture = game.PIXI.TextureCache[path];

    if (!texture) {
        texture = game.Texture.fromFrame(path);
    }

    return texture;
};

/**
    @property {Object} TextureCache
    @for game.Core
**/
game.TextureCache = game.PIXI.TextureCache;

/**
    http://www.goodboydigital.com/pixijs/docs/classes/TilingSprite.html
    @class TilingSprite
    @extends game.DisplayObject
    @constructor
    @param {String|game.Texture} texture Texture to be repeated
    @param {Number} width Sprite width
    @param {Number} height Sprite height
    @param {Object} [properties] Properties to be merged into this sprite
**/
game.TilingSprite = function(path, width, height, properties) {
    /**
        Texture scroll speed
        @property {game.Point} speed
    **/
    this.speed = new game.Point();
    path = game.paths[path] || path;
    var texture = path instanceof game.Texture ? path : path instanceof game.RenderTexture ? path : game.Texture.fromFrame(this.path || path);
    game.PIXI.TilingSprite.call(this, texture, width || texture.width, height || texture.height);
    game.merge(this, properties);
};

game.TilingSprite.prototype = Object.create(game.PIXI.TilingSprite.prototype);
game.TilingSprite.prototype.constructor = game.TilingSprite;

/**
    Update tile position with speed.
    @method update
**/
game.TilingSprite.prototype.update = function() {
    this.tilePosition.x += this.speed.x * game.system.delta;
    this.tilePosition.y += this.speed.y * game.system.delta;
};

/**
    @class SpriteSheet
    @extends game.Class
    @constructor
    @param {String} id Asset ID
    @param {Number} width Sprite frame width
    @param {Number} height Sprite frame height
**/
game.createClass('SpriteSheet', {
    /**
        List of textures.
        @property {Array} textures
    **/
    textures: [],
    /**
        Number of frames.
        @property {Number} frames
    **/
    frames: 0,
    /**
        Width of frame.
        @property {Number} width
    **/
    width: 0,
    /**
        Height of frame.
        @property {Number} height
    **/
    height: 0,
    /**
        Asset id of texture to use as spritesheet.
        @property {String} texture
    **/
    texture: null,
    /**
        @property {Number} _sx
        @private
    **/
    _sx: 0,
    /**
        @property {Number} _sy
        @private
    **/
    _sy: 0,

    init: function(id, width, height) {
        this.width = width;
        this.height = height;
        var baseTexture = game.TextureCache[game.paths[id]];
        this.sx = Math.floor(baseTexture.width / this.width);
        this.sy = Math.floor(baseTexture.height / this.height);
        this.frames = this.sx * this.sy;

        for (var i = 0; i < this.frames; i++) {
            var x = (i % this.sx) * this.width;
            var y = Math.floor(i / this.sx) * this.height;
            var texture = new game.Texture(baseTexture, new game.HitRectangle(x, y, this.width, this.height));
            this.textures.push(texture);
        }
    },

    /**
        Create sprite from specific frame.
        @method frame
        @param {Number} index Frame index
        @return {game.Sprite}
    **/
    frame: function(index) {
        index = index.limit(0, this.frames - 1);
        return new game.Sprite(this.textures[index]);
    },

    /**
        Create animation from spritesheet.
        @method anim
        @param {Number|Array} frames List or number of frames
        @param {Number} [startIndex] The index to begin with, default to 0
        @param {Boolean} [onlyTextures] Return only textures
        @return {game.Animation|Array}
    **/
    anim: function(frames, startIndex, onlyTextures) {
        startIndex = startIndex || 0;
        frames = frames || this.frames;
        var textures = [];
        if (frames.length > 0) {
            for (var i = 0; i < frames.length; i++) {
                textures.push(this.textures[startIndex + frames[i]]);
            }
        }
        else {
            for (var i = 0; i < frames; i++) {
                textures.push(this.textures[startIndex + i]);
            }
        }
        if (onlyTextures) return textures;
        return new game.Animation(textures);
    }
});

/**
    @class Video
    @extends game.Class
    @constructor
    @param {String} source
**/
game.createClass('Video', {
    /**
        @property {Boolean} loop
        @default false
    **/
    loop: false,
    /**
        Video element.
        @property {Video} videoElem
    **/
    videoElem: null,
    /**
        Video sprite.
        @property {game.Sprite} sprite
    **/
    sprite: null,

    init: function() {
        this.videoElem = document.createElement('video');
        this.videoElem.addEventListener('ended', this._complete.bind(this));

        var urls = Array.prototype.slice.call(arguments);
        var source;
        for (var i = 0; i < urls.length; i++) {
            source = document.createElement('source');
            source.src = game.getMediaPath(urls[i]);
            this.videoElem.appendChild(source);
        }

        var videoTexture = game.PIXI.VideoTexture.textureFromVideo(this.videoElem);
        videoTexture.baseTexture.addEventListener('loaded', this._loaded.bind(this));

        this.sprite = new game.Sprite(videoTexture);
    },

    /**
        @method _loaded
        @private
    **/
    _loaded: function() {
        if (typeof this._loadCallback === 'function') this._loadCallback();
    },

    /**
        @method _complete
        @private
    **/
    _complete: function() {
        if (typeof this._completeCallback === 'function') this._completeCallback();
    },

    /**
        @method onLoaded
        @param {Function} callback
    **/
    onLoaded: function(callback) {
        this._loadCallback = callback;
    },

    /**
        @method onComplete
        @param {Function} callback
    **/
    onComplete: function(callback) {
        this._completeCallback = callback;
    },

    /**
        @method play
    **/
    play: function() {
        this.videoElem.loop = !!this.loop;
        this.videoElem.play();
    },

    /**
        @method stop
        @param {Boolean} remove
    **/
    stop: function(remove) {
        this.videoElem.pause();
        if (remove) this.sprite.remove();
    }
});

});
