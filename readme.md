# PixiJs Slots Game Demo

### [Online DEMO](https://pixi-slots-game-kodewerfers-projects.vercel.app/)

---

<!-- ABOUT THE PROJECT -->

## About The Project

Demo Features:

* Loading screen
* Reel strip and position-based spinning
* Simple spinning animation and winning highlighting
* Win lines and points calculation
* Responsive UI ~~(until it breaks)~~

### Built With

* [![TypeScript][typescript-badge]][typescript-url]
* [![Vite][vite-badge]][vite-url]
* [![Pixi.js][pixi-badge]][pixi-url]

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

_Each reel is associated with a reel strip, which is a string array of symbols; and a **_position_** value that
determines the starting point for displaying symbols on the screen. The visible symbols for a reel are drawn
consecutively from its
current **_position_**. if the **_position_** reaches the end of the array, it loops back to the beginning to ensure
continuity (mod operator)._

The `StartSpinning()` function from `PSlotsGameMode` first calculates a random stopping position (spin target) for each
of the five reels. These target positions are then smoothly animated using gsap.to(), which tweens the reels from their
current positions to their new destinations.

The `onTick()` method of each `CReel` constantly "animates" the reel. When _**position**_ changes, it applies a blur
effect while swapping the texture of the sprites according to the reel strip's data. Because the _**position**_ is being
tweened, the reel will appear to be moving.

After a spin completes and `calculateActiveElements()` finishes, each `CReel` accesses a binary state matrix (1 and 0)
where each value indicates whether a symbol is part of a winning line. The reel then uses this matrix to apply color
overlays exclusively to active symbols in its own column.

`CSlotsGameUI` listens for the `EVENT_SPIN_STARTED` and `EVENT_SPIN_FINISHED` emitted by `PSlotsGameMode`, then UI
gets the data stored in the gamemode class to display it to the user.


[typescript-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white

[typescript-url]: https://www.typescriptlang.org/

[vite-badge]: https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E

[vite-url]: https://vitejs.dev/

[pixi-badge]: https://img.shields.io/badge/Pixi.js-22949b?style=for-the-badge&logo=pixi&logoColor=white

[pixi-url]: https://pixijs.com/