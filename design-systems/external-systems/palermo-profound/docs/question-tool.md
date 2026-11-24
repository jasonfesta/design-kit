# Question Tool

Source: https://palermo.tryprofound.com/docs/question-tool

## Question Tool 
The ask-user prompt. Takes over the composer card or sits inline as a
transcript card. 

## Kinds 
Single choice, multi choice, and free text. Choice prompts include an Other
field unless allowCustomAnswer is false. 

 Preview Code 

Single choice 

Question 
Which brand should this agent use? 

 1 Acme Primary monitored brand 2 Northwind 3 Contoso 

 Back 
 Skip 
 Submit ⏎ 

Multi choice 

Question 
Which platforms should we monitor? 

 ChatGPT Perplexity Gemini 

 Back 
 Skip 
 Submit Ctrl ⏎ 

Two columns 

Question 
What type of work do you do? 

 AEO/SEO Marketing Content Marketing Demand Generation Growth Marketing PR/Communications Product Marketing 

 Back 
 Skip 
 Submit Ctrl ⏎ 

Free text 

Question 
What should the agent optimize for? 

 Back 
 Skip 
 Submit ⏎ 

## States 
A multi-step prompt, a completed summary, and the standalone card used in a
transcript. 

 Preview Code 

Multi-step 

Questions 
Which brand should this agent use? 
1 of 3 

 1 Acme Primary monitored brand 2 Northwind 3 Contoso 

 ChatGPT Perplexity Gemini 

 Back 
 Skip 
 Next ⏎ 

Completed 

Question 
Which brand should this agent use? 

 1 Acme Primary monitored brand 2 Northwind 3 Contoso 

 Back 
 Skip 
 Submit ⏎ 

Card 

Question 
Which brand should this agent use? 

 1 Acme Primary monitored brand 2 Northwind 3 Contoso 

 Skip 
 Submit ⏎ 

## Usage 
 QuestionTool is presentational. Product chats own submit, skip, and
multi-question navigation, then pass the result in. 

## Properties 

Prop 
Type 
Description 

 questions 

 QuestionConfig[] 

Prompt list. Each item is single, multi, or text. A choice item may set layout: 'grid' to fill two columns top to bottom with short, label-only options; the Other field spans both. 

 questionIndex 

 number 

1-based index when the host owns navigation. Omit to let the card step locally. 

 totalQuestions 

 number 

Progress denominator. Defaults to questions.length. 

 toolCallId 

 string 

Resets local drafts when the host starts a new tool call. 

 answer 

 QuestionAnswer 

Completed answer from the host. Marks a single-question prompt done. 

 variant 

 'card' 'composer' 

Composer fills the takeover slot. Card is the inline transcript treatment. 

 chatStatus 

 string 

Host stream status. Disables the card variant while streaming. Ignored for composer. 

 allowSkip 

 boolean 

Shows the skip action. 

 submitLabel 

 string 

Primary action on the last question. 

 nextLabel 

 string 

Primary action on earlier questions in a multi-step prompt. 

 skipLabel 

 string 

Skip action copy. 

 onSubmitAnswer 

 (answer: QuestionAnswer) => void 

Called with the last answer, or the only answer on a single prompt. 

 onSubmitAnswers 

 (answers: QuestionAnswerMap) => void 

Called with every answer when the last question in a multi-step prompt is submitted. 

 onNextQuestion 

 () => void 

Called when the host owns navigation and the user advances. 

 onPreviousQuestion 

 () => void 

Called when the host owns navigation and the user goes back. 

 className 

 string 

Extra classes on the card frame. 

 choicesClassName 

 string 

Extra classes on the scrollable choices list, e.g. a scroll edge fade. 

 titlePlacement 

 'header' 'step' 

Where the composer variant shows the active question's title. `step` keeps it inside the animated step so it crossfades and resizes with the choices. 

 Previous Composer 
 Next 
 Dialog
