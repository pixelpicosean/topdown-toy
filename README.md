# Topdown Shooting Toy

Small GTA like topdown shooting game for experimenting
heavily using FRP in game development.

## Engine

[Panda Engine - v1.13.5](https://github.com/pixelpicosean/panda.js)

## Info

The gamepad plugin is based on the official one, but
modified and improved(easier to get axes changes).

## Notes on Using FRP


### Name

Streams are more like something has happened, and require some actions
to be piped to. Properties are like any other normal variables, which are
just representing states.

So they should have better names:

- Event streams should be named as `whenSomeEventHappened` (when + ... + done)
- Properties should be named as a normal variable (something else better?)
- Stream handlers should have a meaningful name like `updatePlayerScore` (looks like an action)

### Pure Functions or Not

I believe the power of _pure function_, but it also makes your game a little
**slower**. This may change in the future when ECMAScript solves this issue.
But for now, we have to face it.

_Pure functions_ brings way much re-usable code, you can pipe them to any
stream/property and they should always work. But it seems that they are not
that useful as I've expected. The handlers need targets(sprites, physics bodies, ...).
It is not hard to wrap those targets, those game objects as properties. And you
can use stream combination methods to pass these objects to handlers, then you'll
make your great _pure functions_ work.

The problem is, does it **worth**?
