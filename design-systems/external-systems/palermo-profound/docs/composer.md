# Composer

Source: https://palermo.tryprofound.com/docs/composer

## Composer 
The assistant input card. Pin activity chrome, mix layout slots, and
compare send/stop states. 

## Playground 
Set each activity state with a button. Mix slots and accents on the same card.
Success remounts so the halo replays. 

 Preview Code 

Ask a question… 

Activity 

 Idle 
 Working 
 Success 
 Disabled 

Accent 

 Blue 
 Red 
 Orange 
 Green 
 Purple 
 Gray 

Slots 

Footer start 
Footer end 
Attachments 
Disclaimer 
Bottom surface 
Top surface 
Top slot 
Queued actions 
Takeover 
Question tool 
Typed draft 
Validation 
Compact layout 

## Activity states 
Working paints the spectrum ring. Success is a one-shot halo. Disabled dims
the card. 

 Preview Code 

Idle 

Ask a question… 

Working 

Write a research agent that tracks competitor mentions. 

Success 

Write a research agent that tracks competitor mentions. 

Disabled 

Write a research agent that tracks competitor mentions. 

## Slots 
Surfaces the card can attach around the editor: footer start and end,
an always-interactive attachment strip inside the card, disclaimer, a tucked bottom surface, an
attached top surface (including queued actions), a floating top slot,
a takeover, the ask-user question tool, and validation copy. 

 Preview Code 

Footer start 

Ask a question… 

Footer end 

Ask a question… 

Compact 

Ask a question… 

Attachments 

brief.pdf 

brand-guidelines.docx 

Ask a question… 

Disclaimer 

Ask a question… 

AI can make mistakes. Check important info. 

Bottom surface 

Ask a question… 

Write a research agent 
Monitor brand mentions 

Top surface 

You have reached your usage limit 
 View usage 

Ask a question… 

Top slot 

Which brand should this agent use? 
The first turn is scoped to this brand. 

Ask a question… 

Queued actions 

2 Queued 

Compare visibility for Acme vs Northwind 

Draft a follow-up prompt for citations 

Ask a question… 

Takeover 

Pick a brand to continue. 

 Acme 
 Northwind 

Question tool 

Question 
Which brand should this agent use? 

 1 Acme Primary monitored brand 2 Northwind 3 Contoso 

 Back 
 Skip 
 Submit ⏎ 

Validation 

Ask a question… 

Add more detail before sending. 

## Question tool 
The ask-user prompt takes over the card through activeSlot . Single choice,
multi choice, free text, and multi-step prompts share the same chrome. 

 Preview Code 

Question 
Which brand should this agent use? 

 1 Acme Primary monitored brand 2 Northwind 3 Contoso 

 Back 
 Skip 
 Submit ⏎ 

## Send button 
Idle dims send. Typing enables it. Streaming swaps the control for stop. 

 Preview Code 

Idle 

Typing 

Streaming 

## Accents 
Working chrome can be tinted with the same appearance tokens as an agent. 

 Preview Code 

Blue 

Write a research agent that tracks competitor mentions. 

Red 

Write a research agent that tracks competitor mentions. 

Orange 

Write a research agent that tracks competitor mentions. 

Green 

Write a research agent that tracks competitor mentions. 

Purple 

Write a research agent that tracks competitor mentions. 

Gray 

Write a research agent that tracks competitor mentions. 

## Usage 
 Composer is presentational. Product chats derive activityState from
streaming and submit flags, then pass the result in. 

## Properties 

Prop 
Type 
Description 

 activityState 

 'idle' 'working' 'success' 'disabled' 

Visual chrome on the card. Working paints the spectrum ring. Success is a one-shot halo. Disabled dims the card. 

 activityAccent 

 string 

CSS color for the working spectrum and success pulse. Defaults to fill-blue. 

 pulseKey 

 number 

Increments so the success halo remounts and replays. 

 sendState 

 'idle' 'typing' 'streaming' 

Send/stop visual role. Derived from activity and sendDisabled when omitted. 

 sendDisabled 

 boolean 

Blocks submitting a new message. Stopping an in-flight response stays available. 

 onSubmit 

 () => void 

Called when the user submits from the send button. 

 onStop 

 () => void 

Called when the user clicks stop during streaming. 

 footerStart 

 ReactNode 

Slot on the leading edge of the composer footer. 

 footerEnd 

 ReactNode 

Slot on the trailing edge of the footer, before send/stop. 

 disclaimer 

 ReactNode 

Helper text rendered below the visible composer card. 

 topSlot 

 ReactNode 

Floating slot rendered above the card. 

 topElement 

 ReactNode 

Surface rendered immediately above and behind the composer card. Product queues sit here, not as an activity state. 

 bottomElement 

 ReactNode 

Surface tucked under the floating card. Paints its own background and rounding. 

 activeSlot 

 ReactNode 

Replaces the editor and footer when a product flow takes over the card. 

 attachments 

 ReactNode 

Attachment strip above the editor. Stays interactive when the card is disabled. 

 validationMessage 

 ReactNode 

Validation copy rendered beneath the card. 

 scrollControl 

 ReactNode 

Viewport control above every composer surface. Pass null when the preview owns spacing. 

 children 

 ReactNode 

Editor surface supplied by the consumer. 

 Previous Commandbar 
 Next 
 Question Tool
