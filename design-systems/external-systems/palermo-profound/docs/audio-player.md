# Audio Player

Source: https://palermo.tryprofound.com/docs/audio-player

## Audio Player 
Play an audio file in a single control bar. The bar comes styled, and you can replace or recompose its controls. 

## Default player 
The audio player is one bar with play, skip back and forward 10 seconds, the timeline, playback speed, and volume. It’s the audio preset of @repo/player , the package behind the video player , so both players share their controls, translations, and states. 

 Preview Code 

## Install 
Add "@repo/player": "workspace:*" to the app’s dependencies, then import the audio preset from @repo/player/audio : 
The package is a styled layer on Video.js 10, and lint rejects @videojs/* imports outside it. Built on Video.js maps each Video.js import to its @repo/player path. 

## How the pieces fit together 
An audio player has three required parts: the player, the skin, and the media. Each part has one job and nests inside the part above it, so you can change one without touching the others. 
 Part Component What it owns 
 Player AudioPlayer Playback state for everything inside it. It renders no UI. 
 Skin AudioSkin The interface: control bar, error state, shortcuts. 
 Media Audio The source. It renders the native audio element and nothing else. 
 Additions UserPreferences Optional behavior. Render it inside the skin. 
Any component inside the player can read playback state with usePlayer from @repo/player/audio , even outside the skin. A transcript that follows the current time is one example: 
The video player has the same three parts, plus tracks and overlays the audio preset doesn’t use. How the pieces fit together on the video page covers them. 
Reference: Exports , Props . 

## Size the bar 
Put the width on the skin with className . The skin needs no wrapper element. The controls set the height, so the bar never stretches to fill a taller parent. 

## Responsive layout 
The bar responds to its own width, not the page. Below 512 px wide the skip buttons drop, then the time labels, so the timeline keeps its room. 
Reference: AudioSkin . 

## Internationalization 
Pass locale to AudioSkin to translate every label, tooltip, and screen reader announcement. The bar supports right-to-left (RTL) languages : with an RTL locale it sets its own text direction. 
 Internationalization on the video page has a live preview and covers server rendering, one language for several players, and your own strings. 

## Remember listener preferences 
Render UserPreferences inside the skin to keep the listener’s volume, mute, and speed from one player to the next, across page loads and visits: 
Audio and video players share one saved set of preferences. Remember viewer preferences covers when each setting is saved and restored, and how to read or clear the store. 

## Keyboard shortcuts 
The skin binds the playback shortcuts: play or pause, seek, volume, mute, jump to a percentage, and speed. They work while focus is inside the bar, so two players on one page don’t compete for keys. Keyboard shortcuts and gestures lists the keys. The audio bar has no pointer gestures and no captions, fullscreen, or picture-in-picture shortcuts. 

## Player states 
The skin and its default bar show these states without any code from you. 

## Buffering 
When playback waits for data for more than half a second, the Profound mark covers the play button and draws itself in a loop. The indicator is part of DefaultAudioControls , so a bar you build yourself has to render BufferingIndicator to keep it. 

## Error 
When the source can’t play, the bar shows a short message in place of its controls. Error on the video page covers what the message hides and who recovers from the failure. 

 Preview Code 

## Build your own control bar 

Not recommended 
The default bar keeps every player in the product consistent. Replace it only when a surface can’t use it, such as a row too narrow for the full bar. 
 DefaultAudioControls is the bar the skin renders by default. To replace it, compose the styled controls into your own bar and pass it to the skin through controls . 

 Preview Code 

The buttons and sliders are the ones the video player uses. Controls lists them with their import paths. The audio preset has no fullscreen, picture-in-picture, captions, quality, or audio track features, so leave those controls out of an audio bar. 
Reference: Exports , AudioSkin . 

## Reference 
Import the audio preset from @repo/player/audio . The names match Video.js, so the Video.js docs apply once you swap the import path. 

## Exports 
 Export Import What it does 
 AudioPlayer @repo/player/audio Owns the playback state. Renders no UI. 
 AudioSkin @repo/player/audio The control bar, the error state, and the keyboard shortcuts. 
 Audio @repo/player/audio Plays an audio file through the native audio element. 
 usePlayer @repo/player/audio Reads playback state and actions from any component inside AudioPlayer . 
 audioFeatures @repo/player/audio The feature set behind AudioPlayer . Pass it to createPlayer to extend it. 
 DefaultAudioControls @repo/player/audio/controls The default bar. Replace it through controls on AudioSkin . 
 @repo/player/audio also exports the AudioPlayerProps , AudioSkinProps , and AudioProps types. 

## Props 
These are the props @repo/player adds or changes. 

## AudioSkin 
 Prop Type Default What it does 
 className string Sets the width of the bar, for example w-full . See Size the bar . 
 controls ReactNode <DefaultAudioControls /> Replaces the default bar. 
 locale string The page language The language of labels and announcements. 

## Audio 
 Audio is the Video.js component, re-exported unchanged. It takes src and the props of the native audio element. Video.js docs: Audio . 
The video page documents everything both presets share: Controls for the styled buttons and sliders, Extensions and tracks for UserPreferences and I18nProvider , and Content Security Policy for the directives the player needs. 
Video.js docs: Presets . 

 Previous Alert 
 Next 
 Avatar 

 Audio player not working? 

 10 10 
 0:00 

 0:00 0:00 

 Audio player not working? 

 10 10 
 0:00 

 0:00 0:00 

 Audio player not working? 

 0:00
