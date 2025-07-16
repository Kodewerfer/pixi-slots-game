# PixiJs Slots Game Demo

### [Online DEMO](https://pixi-slots-game-kodewerfers-projects.vercel.app/)

---

<!-- ABOUT THE PROJECT -->

## About The Project

Demo Features:

* Loading screen
* Reel strip
* Simple spinning animation and winning highlighting.
* Win lines and points calculation
* Responsive UI ~~(until breaks)~~

Known Issues:

* `WebGL: INVALID_VALUE: texImage2D: width or height out of range`
    * Because the animation is texture swapping base, if the speed of the animation is too fast, the renderer will have
      a hard time catching up to it, resulting rendering textures with `0x0` pixels.
* Math.random()

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

* [![TypeScript][typescript-badge]][typescript-url]
* [![Vite][vite-badge]][vite-url]
* [![Pixi.js][pixi-badge]][pixi-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## Project Breakdown

### Structural Flow

#### Base Classes

This project extends the base classes of Pixi.js to provide additional functionalities such as life cycle events or
callbacks such as `onRezie()`.

* **PApp** - wrap around PIXI.Application, emits various life cycle events.
    * **PGameMode** - should be set to the PApp via `.CurrentGameMode`, a conceptual layer similar to the AGameMode from
      Unreal, handles the main logic within a level. has its own `onTick()`
    * **PLevel** - should be set to the PApp via `.CurrentLevel`, a conceptual layer that provides a container for all
      elements in a "level," and primarily handles layout or bootstrapping logics.
        * **CContainer** - extends PIXI.Container, provides additional callbacks such as  `onRezie()` `onTick()`
          `onAddedToStage()` `onRemovedFromStage()` etc.
            * **SSprite** - extends PIXI.Sprite, provides callbacks similar to  **CContainer**

A _`BaseResWidth` and _`BaseResHeight` need to be set to the **PApp** so that the optional`.reScaleWithBaseRes()` can be
called on containers or sprites.

#### Component Sub-Classes

* PApp - Main app
    * `PSlotsGameLevel` (PLevel) -Loading Screen
    * `CLoadingScreenUI` (CContainer)
    * `PSlotsGameMode` (PGameMode) - Set after loading screen.
    * `PSlotsGameLevel` (PLevel) -Main Screen
        * `CSlotsGameUI` (CContainer)
        * `CReelsWrapper` (CContainer)
            * 5 x `CReel` (CContainer) - For each column
                * (In each CReel) 3 x `SSymbolSprite` (SSprite)

### `Main.ts`

`Main.ts ` handles app initialization, display the loading screen while assets are loading and the reels are being
built.

### Business Logic Flow

The bulk of the business logic is in the subclass `PSlotsGameMode`, including `StartSpinning()` `calculateWinLines()`
then `addPointsToWins()` and finally `calculateActiveElements()`. The communication between each component is, by and
large, done via event emitters and listeners.

`StartSpinning()` generates a random spin target as the new _**position**_ value for each of the five reels, then set
the new position to each of the reels by using `gsap.to()`(tweening).

The `onTick()` method of each `CReel` constantly "animates" the reel. When _**position**_ changes, it applies a blur
effect while swapping the texture of the sprites according to the reel strip's data. Because the _**position**_ is being
tweened, the reel will appear to be moving.

After a spin finishes, and after `calculateActiveElements()` completes, each `CReel` will be able to access a matrix
that is composed of 1 and 0 that represent the "active state" of each sprite. `CReel` will then set the colour overlay
accordingly.

`CSlotsGameUI` listens for the `EVENT_SPIN_STARTED` and `EVENT_SPIN_FINISHED` emitted by `PSlotsGameMode`, who then
Access the data stored in the gamemode class to display it to the user.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


[typescript-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white

[typescript-url]: https://www.typescriptlang.org/

[vite-badge]: https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E

[vite-url]: https://vitejs.dev/

[pixi-badge]: https://img.shields.io/badge/Pixi.js-22949b?style=for-the-badge&logo=pixi&logoColor=white

[pixi-url]: https://pixijs.com/