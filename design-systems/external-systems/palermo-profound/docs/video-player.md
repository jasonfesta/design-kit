# Video Player

Source: https://palermo.tryprofound.com/docs/video-player

Play video from any source. The player comes styled, and you can replace or recompose every part of it. 

## Default player 
This player uses the default skin with a title, a description, and chapters. Hover the timeline to see the chapter under the pointer, and open the settings menu to change quality, speed, captions, or audio track. To play audio in a single control bar, use the audio player . 

 Preview Code 

## Install 
Add "@repo/player": "workspace:*" to the app’s dependencies, then import the video preset from @repo/player/video : 

## Built on Video.js 
The player is a styled layer on Video.js 10 . Every Video.js component, pattern, and guide works here as written. The one difference is the import path: import from @repo/player , never from @videojs/* . The package owns the Video.js versions, and lint rejects @videojs/* imports anywhere else. 
 Video.js import Import here 
 @videojs/react/video @repo/player/video 
 @videojs/react/audio @repo/player/audio 
 @videojs/react/media/* @repo/player/media/* 
 @videojs/react/extensions/* @repo/player/extensions/* 
 @videojs/react/i18n @repo/player/i18n 
 createPlayer and feature sets, @videojs/react @repo/player/player 
 Buttons, sliders, and menus, @videojs/react @repo/player/ui/* , styled 
 Selectors such as selectTime , @videojs/react @repo/player/selectors 
When you need a Video.js export the package doesn’t have yet, add it to the package and import it from there. 

## How the pieces fit together 
A player has three required parts: the player, the skin, and the media. Each part has one job and nests inside the part above it, so you can change one without touching the others. 
 Part Component What it owns 
 Player VideoPlayer Playback state for everything inside it. It takes the title and the poster , and it renders no UI. 
 Skin VideoSkin The interface: control bar, poster, loading and error states, shortcuts, gestures. 
 Media Video , HlsJsVideo , others The source. It renders the media element and nothing else. 
 Tracks ChaptersTrack Extra data for the media. Render it as a child of the media. 
 Additions Title , MuxData Optional overlays and behavior. Render them inside the skin. 
Any component inside the player can read playback state with usePlayer , even outside the skin. A transcript next to the video is one example. The audio player has the same three required parts under @repo/player/audio . 
Reference: Player and skin , Props . Video.js docs: Architecture . 

## Size the player 
Put the size on the skin with className : a width and an aspect ratio. The skin needs no wrapper element. 
Two layouts need more than that: 

 A parent with a fixed height , such as a dialog body or a stretched grid cell. The skin’s base styles set its height to 100% of the parent, so that height wins over the aspect ratio and the player stretches. Add h-auto to keep the aspect ratio: className="aspect-video h-auto w-full" 

 A prerendered route . The loading skeleton fills the parent, so a parent without a size reserves no space. Size a wrapper instead, and let the skin fill it with size-full 

Reference: VideoSkin . 

## Responsive layout 
The control bar responds to the width of the player, not the page, so the same player works in a sidebar and in fullscreen. Drag the slider to see it: the captions button drops first, then the time labels, so the timeline keeps its room. A player 1280 px or wider, fullscreen included, steps its buttons, text, and on-screen indicators up one size. 

 Preview Code 

 Preview width 640 px 

## Play any source 
The player and the skin don’t know where the media comes from. You choose a media component for your source, and the title, controls, shortcuts, and states stay the same. 

## A video file 
 Video plays an MP4 or WebM file through the browser’s own element. Pass any URL the browser can fetch as src , including a signed URL. A file has no poster, so the player stays black until it plays. Set the poster to fix that. 

 Preview Code 

Leave crossOrigin off when the player loads no caption tracks or thumbnails from another origin. With crossOrigin set, the browser requires Cross-Origin Resource Sharing (CORS) headers from the file host, and a file from a host that doesn’t send them fails to play. 

## An HLS stream 
 HlsJsVideo plays any HTTP Live Streaming (HLS) URL ending in .m3u8 . The settings menu lists the qualities, captions, and audio tracks the stream declares. 

 Preview Code 

## A Mux asset 
 MuxVideo takes a playback ID instead of a URL. It also generates the poster and the timeline thumbnails from that ID. 

 Preview Code 

Set crossOrigin="anonymous" so the browser can load the thumbnails, which live on another domain. Mux sends the CORS headers that setting requires. 
To report playback quality for the same asset to Mux Data, add the MuxData extension from Monitor playback . 

## Add another source 
Video.js supports more sources than the ones on this page, including DASH, YouTube, Vimeo, and Cloudflare Stream. To use one, add its media component to @repo/player and import it from there. Each media component is one file in packages/player/src/media that re-exports the Video.js component by name, so apps never install a media library themselves. 
Reference: Media . Video.js docs: Media sources , Captions , Thumbnails . 

## Show video details 
The poster, the title, and the chapters tell the viewer what the video is before and during playback. All three are optional. The poster and the title are props of the player, and chapters are a child of the media. 

## Poster 
The poster is the image the player shows before playback. Set poster on the player, not on the media, to use your own image. It replaces any poster the media generates. 

 Preview Code 

A poster on Video only sets the browser’s own poster, which the skin never shows. 
To render the image yourself, for example with next/image , pass renderPoster to the skin. Spread the props you receive and read src from the state: 

## Title and description 
Set title on the player, then render Title inside the skin to show it. Without Title , the skin shows no title. Title takes an optional description for a second line, which hides on a narrow player. 

 Preview Code 

The player resolves the title in this order and shows the first one that has a value: 

The title you set on the player 

The title the media reports about itself 

 Title renders the resolved title and has no title prop of its own, so the player is the only place to set or override it. When neither source has a value, Title renders nothing, even with a description . Pass title={null} to the player to use the media’s title. 

## Chapters 
Chapters split the timeline into segments and name the segment under the pointer. Render ChaptersTrack as a child of the media, with start times in seconds from the start of the video. Hover the timeline in this player to see them. 

 Preview Code 

Reference: VideoPlayer , VideoSkin , Title , ChaptersTrack . Video.js docs: Add a poster . 

## Internationalization 
The player translates every label, tooltip, menu, and screen reader announcement, and it supports right-to-left (RTL) languages . This preview starts in Arabic. Pick another language, then hover a button or open the settings menu. 

 Preview Code 

 English Español Português Français Deutsch 日本語 العربية 

## Set the language 
Pass locale to the skin. VideoSkin and AudioSkin both take it. On a localized page, pass the locale your app already resolved. Without it, the server renders English and the browser switches to the page language after load, which React reports as a hydration mismatch. The browser downloads only the language pack in use. 

## Right-to-left languages 
 With locale set, the player sets its own text direction. An RTL locale such as ar mirrors the player even on a left-to-right page, as the preview shows. Without locale , the player follows the language and direction of the page. In an RTL language the title and the menus mirror, and the control bar keeps its order. 

## One language for several players 
Each skin already wraps its player in its own I18nProvider , so one player never needs a provider around it. To give several players the same language, wrap them in one I18nProvider from @repo/player/i18n and leave locale off each skin: 
The two providers don’t conflict, because the language resolves in this order: 

The locale on the skin 

The locale of the nearest I18nProvider around the player 

The language of the page 

A skin with its own locale keeps that language inside a provider that sets another one. 

## Translate your own text 
The player translates only its own interface. The title, the description, and the content of UpNext are your content, so pass them already translated from your CMS or database. 
The fixed text that @repo/player adds on top of Video.js defaults to English. Today that is the UpNext label and the name of its dismiss button. To translate it, wrap the component in I18nProvider with translations . The provider inherits the skin’s language, and the rest of the interface keeps its language pack: 
Don’t call registerI18n with only these strings. Registering any string for a locale stops Video.js from loading that locale’s pack, so the rest of the interface falls back to English. 
Reference: VideoSkin , Extensions and tracks . Video.js docs: Internationalization . 

## Remember viewer preferences 
 UserPreferences keeps the viewer’s volume, speed, captions, and audio language from one video to the next, across page loads and visits. It’s opt-in: render it inside the skin. Change a setting in this preview, then press Next video , which mounts a new player the way a route change does. 

 Preview Code 

 Next video 
 Forget preferences {} 

## What it saves 
The player saves a setting 400 ms after the viewer changes it, and restores it when the next video can take it. 
 Setting Saved as Restored when 
 Volume and mute A level from 0 to 1 The media attaches. Skipped when the media starts muted, as autoplay requires. 
 Speed The playback rate Each source loads. 
 Captions A language tag, and whether they are off The caption list arrives. 
 Audio track A language tag The audio track list arrives. 
Tracks are saved by language, not by id, because ids change between videos. Quality isn’t saved: renditions differ per video, and a manual pick is a reaction to the network at that moment. To cap data use and keep automatic switching, set maxAutoResolution on the source instead. 

## Start from the viewer’s locale 
Pass defaultCaptions and defaultAudio to choose tracks before the viewer has a preference. Each setting resolves in this order: 

The viewer’s saved choice 

The default you pass 

Whatever the media selects on its own 

A default is never saved, so it follows the locale if the locale changes. A language the viewer picks is saved together with the default it was picked under, and wins while that default stays the same. When the default changes, for example because the viewer switched the site language, the saved language is ignored and the new default applies. 
Turning captions off is saved separately from the language, so the saved language stays in the store, and switching the site language does not turn captions on again. Pass defaultCaptions="off" to start without captions. 
Languages match the exact tag first, then the base language. pt-BR matches a pt-BR track, then a pt track, and never pt-PT . 

## Read or clear the saved preferences 
 useUserPreferences is the store behind the component. Select from it the way you select from usePlayer , or call it outside React: 
The last line clears everything, for example on sign-out. The store is a Zustand store with persist and lives in localStorage under player:preferences . The server has no stored value, so render from it only after the component mounts. 
Reference: UserPreferences , useUserPreferences . Video.js docs: Remember user preferences . 

## Show content at a point in the video 
 TimedSlot renders its children over the video during a time range. It only decides when, where, and how the content appears; what goes inside is yours. UpNext is an extension built on it, and the skip button in this demo is a plain button inside a slot. Use the buttons under the player to jump to each range. 

 Preview Code 

## Slot options 
 Prop Values Default 
 start , end Seconds. A negative value counts back from the end. 0 , the end 
 open false hides the slot inside its range. true 
 placement bottom-end , bottom-start , top-end , top-start bottom-end 
 transitionIn , transitionOut slide , fade , scale , none slide , same 
A bottom slot moves up while the control bar is visible. Outside its range the slot stays mounted and hidden, so its content keeps its state. 

## Up next 
 UpNext is a card for the next item. It shows seconds before the end, 10 by default, and calls onComplete when the video ends, unless the viewer dismissed the card. It accepts placement , transitionIn , and transitionOut . 
Every part is optional: thumbnailSrc , label , title , and description . Pass title and description already translated, as they are your content. The label and the name of the dismiss button are player text. They default to English until you translate them, as Translate your own text shows. label also takes any node when you prefer to pass the text yourself. 
Reference: TimedSlot , UpNext . 

## Keyboard shortcuts and gestures 
The skin binds these keys. They work while focus is inside the player, so two players on one page don’t compete for keys. 
 Keys Action 
 Space , K Play or pause 
 ← → , J L Seek 10 seconds 
 ↑ ↓ Change the volume 
 M Mute 
 0 to 9 Jump to 0% through 90% 
 Home , End Jump to the start or the end 
 < , > Play slower or faster 
 C Toggle captions 
 F Toggle fullscreen 
 I Toggle picture-in-picture 
Pointer input depends on the device: 

 Mouse : a click plays or pauses 

 Touch : a tap shows or hides the controls 

 Mouse and touch : a double click or double tap seeks 10 seconds in the left or right third of the player, and toggles fullscreen in the center third 

Focus rings appear only during Tab navigation. While a control has keyboard focus, the control bar stays visible. 
Reference: Controls . Video.js docs: Keyboard shortcuts and gestures , Accessibility . 

## Player states 
The skin shows these states without any code from you. Each preview holds a player in one state. 

## Loading 
The player suspends while a route prerenders and shows a skeleton that fills its parent. In a prerendered route, size a wrapper around the player and give the skin size-full , so the skeleton reserves the same box. 

 Preview Code 

## Buffering 
When playback waits for data for more than half a second, the Profound mark draws itself in a loop. This preview forces the indicator on. 

 Preview Code 

## Error 
When the source can’t play, the skin shows a short message and turns the controls off. It never shows the browser’s raw error text. Recovery, such as refreshing an expired URL, is your app’s job: load a new source and the message clears. 

 Preview Code 

The audio player shows the same message in place of its controls. 
Reference: Controls . Video.js docs: Handle playback errors . 

## Monitor playback 
Playback monitoring is opt-in. Render an extension inside the skin, and it reports without adding any UI. The package includes one monitoring extension today, for Mux Data: 
Reference: Extensions and tracks . Video.js docs: Mux Data . 

## Build your own control bar 

Not recommended 
The default control bar keeps every player in the product consistent. Replace it only when a surface can’t use it, such as a preview too small for the full bar. 
To replace the default control bar, compose the same styled controls into your own bar and pass it to the skin through controls . Pass controls={null} to remove the bar. 

 Preview Code 

To keep the default bar and change only the timeline thumbnail, pass DefaultVideoControls with renderThumbnail : 
Reference: Controls , DefaultVideoControls . Video.js docs: Show and hide controls . 

## Reference 
Import everything from @repo/player . Each table gives the import path. Where @repo/player re-exports a Video.js module unchanged, the row links to the Video.js page that documents its props. 

## Player and skin 
 Export Import What it does Video.js docs 
 VideoPlayer @repo/player/video Owns the player state. Renders no UI. 
 VideoSkin @repo/player/video The interface around the media: control bar, poster, states, shortcuts, gestures. 
 DefaultVideoControls @repo/player/video/controls The default control bar. Replace it through controls on VideoSkin . 
 usePlayer @repo/player/video Reads playback state and actions from any component inside the player. usePlayer 
 videoFeatures @repo/player/video The feature set behind VideoPlayer . Pass it to createPlayer to extend it. Features 
 createPlayer @repo/player/player Creates a player for another feature set, such as liveVideoFeatures . createPlayer 
 @repo/player/video also exports the VideoPlayerProps , VideoSkinProps , and VideoProps types, and every other module exports the props type of its component, such as UpNextProps . @repo/player/player also exports videoFeatures , audioFeatures , liveVideoFeatures , and liveAudioFeatures . The audio preset has its own exports . 

## Props 
These are the props @repo/player adds or changes. Media components, MuxData , and I18nProvider keep their Video.js props, which the Media and Extensions and tracks tables link to. 

## VideoPlayer 
 Prop Type What it does 
 title string | null The title of the video. Without it, the player uses the title the media reports. 
 poster string | null The image shown before playback. It replaces the poster the media generates. 

## VideoSkin 
 Prop Type Default What it does 
 className string Sizes the player, for example aspect-video w-full . See Size the player . 
 controls ReactNode <DefaultVideoControls /> Replaces the default control bar. null removes it. 
 locale string The page language The language of labels and announcements. See Internationalization . 
 renderPoster (props, state) => element Renders the poster image yourself, for example with next/image . See Poster . 

## DefaultVideoControls 
 Prop Type What it does 
 renderThumbnail (props, state) => element Renders the timeline thumbnail image yourself. 

## Title 
 Prop Type What it does 
 description ReactNode A second line under the title. It hides on a player narrower than 448 px. 
 className string Classes for the title overlay. 
 Title has no title prop. It shows the title the player resolves, as Title and description explains. 

## ChaptersTrack 
 Prop Type What it does 
 chapters { startTime: number; title: string }[] Required. Start times are seconds from the start of the media. 

## UserPreferences 
 Prop Type What it does 
 defaultCaptions string Caption language to show until the viewer chooses one. off starts without captions. 
 defaultAudio string Audio language to select until the viewer chooses one. 

## useUserPreferences 
The store holds the saved values and two actions. Each value is undefined until the viewer changes that setting. 
 Field Type What it holds 
 volume , muted number , boolean The volume from 0 to 1, and whether the player is muted. 
 playbackRate number The playback speed. 
 captions , captionsLocale string The caption language the viewer picked, and the default it was picked under. 
 captionsOff boolean true when the viewer turned captions off. 
 audio , audioLocale string The audio language the viewer picked, and the default it was picked under. 
 save (preferences) => void Merges values into the store. UserPreferences calls it for you. 
 reset () => void Clears every saved value. 

## TimedSlot 
 Slot options lists start , end , open , placement , transitionIn , and transitionOut . TimedSlot also takes the props of a div . 

## UpNext 
 Prop Type Default What it does 
 title , description ReactNode The next item’s title and a short description. Pass them translated. 
 label ReactNode The translated “Up next” The line above the title. 
 thumbnailSrc string An image or GIF for the card. It hides on a player narrower than 448 px. 
 href string Makes the card a link. Without it, the card is a button. 
 seconds number 10 How long before the end the card shows. 
 onSelect () => void Called when the viewer clicks the card. 
 onComplete () => void Called when the media ends, unless the viewer dismissed the card. 
 placement , transitionIn , transitionOut see Slot options Where and how the card appears. 
 className string Classes for the slot around the card. 

## Controls 
 Component Import What it does 
 PlayButton , SeekButton , MuteButton , CaptionsButton , PiPButton , FullscreenButton , PlaybackRateButton @repo/player/ui/buttons/* Styled buttons for your own control bar. 
 TimeSlider , VolumeSlider , VolumePopover @repo/player/ui/sliders/* The timeline with thumbnails and chapters, the volume slider, and the mute button that opens it. 
 SettingsMenu , QualityMenu , AudioTrackMenu , CaptionsSubmenu , PlaybackRateSubmenu , PiPMenuItem @repo/player/ui/menus/* The settings menu and its sections. A section hides when the media has nothing to offer. 
 Title @repo/player/ui/display/title Shows the player title and an optional description while the controls are visible. 
 Container @repo/player/ui/layout/container The player surface. Use it when you build an interface without a skin. 
 TimedSlot @repo/player/ui/layout/timed-slot Shows any content over the video during a time range. 
 Poster , BufferingIndicator , ErrorMessage , SeekIndicator , VolumeIndicator , StatusIndicator @repo/player/ui/display/* The poster, the states, and the on-screen feedback the skin renders. 
 PlaybackHotkeys , StatusAnnouncer @repo/player/ui/behavior/* The playback shortcuts both skins bind, and the screen reader announcements. 
 VideoHotkeys , VideoGestures , VideoStatusIndicators @repo/player/video/* The shortcuts, gestures, and feedback of VideoSkin , for an interface without a skin. 
 Button , Time , ButtonTooltip , IsotypeLoader @repo/player/ui/buttons/button , @repo/player/ui/display/* The base button, the time display, the tooltip with a shortcut key, and the buffering mark. 
 SubmenuTrigger , SubmenuContent , RadioItem , MenuChevron @repo/player/ui/menus/* The parts for a settings section of your own. 

## Media 
 Media Import Plays Video.js docs 
 Video @repo/player/video An MP4 or WebM file, through the native element. Video 
 HlsJsVideo @repo/player/media/hlsjs-video Any HLS .m3u8 URL. HlsJsVideo 
 MuxVideo @repo/player/media/mux-video A Mux playback ID. MuxVideo 
 Audio , the media component for audio files, is part of the audio player . 

## Extensions and tracks 
 Export Import What it does Video.js docs 
 MuxData @repo/player/extensions/mux-data Opt-in playback monitoring. Renders no UI. Mux Data 
 UpNext @repo/player/extensions/up-next A card for the next item, shown before the media ends. 
 UserPreferences @repo/player/extensions/user-preferences Saves and restores the viewer’s volume, speed, captions, and audio language. 
 useUserPreferences @repo/player/store/user-preferences The store behind UserPreferences , with save and reset . 
 ChaptersTrack @repo/player/tracks/chapters-track Turns a list of chapters into timeline segments with a title on hover. 
 I18nProvider @repo/player/i18n Sets the language for several players at once. A skin’s locale does the same for one player. I18nProvider 
 registerI18n @repo/player/i18n Registers a full set of translations for a locale. See Translate your own text . registerI18n 
 useTranslator , useLocale , loadLocale @repo/player/i18n Read the active translator and locale, and load a language pack. Internationalization 
 selectTime , others @repo/player/selectors Selectors for usePlayer : the Video.js ones, plus derived ones such as selectHasError and selectSubtitleTracks . usePlayer 

## Content Security Policy 
If the app sets a Content Security Policy (CSP), allow blob: in media-src and worker-src . Streaming and chapters both load through blob: URLs. For Mux assets, also allow https://stream.mux.com in connect-src and media-src , and https://image.mux.com in img-src . Video.js components set inline styles, which may need 'unsafe-inline' in style-src . 
Video.js docs: Content Security Policy . 

 Previous Tooltip 

 Video player not working? 

 Demo video Captions and audio in six languages. 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 Demo video Drag the slider to resize the player. 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 Demo video A second line under the title. 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 فيديو تجريبي اختر لغة، ثم مرّر المؤشر فوق أحد الأزرار أو افتح قائمة الإعدادات. 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 Video 1 Change the volume, speed, captions or audio, then load the next video. 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 Video 1 A badge and a skip button show between 0:05 and 0:35. The next video appears 10 seconds before the end. 

 Intro 

 Skip intro 

 Up next Video 2 A short description of the video that plays next. 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Jump to the intro 
 Jump near the end 

 Video player not working? 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 0:00 

 0:00 0:00 
 Settings 

 Quality Auto 
 Audio 
 Speed 1× 
 Captions Off 

 Video player not working? 

 0:00
