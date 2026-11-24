# Textarea

Source: https://palermo.tryprofound.com/docs/textarea

## Textarea 
A multi-line text input component for longer text content and messages. 

## Sizes 
Different sizes for various use cases. 

 Preview Code 

 Regular size 
 This is a regular textarea with content 

 Small size 
 This is a small textarea 

## Error States 
Textarea with error styling and messages. 

 Preview Code 

 Regular with error 
 This is an error hint 

 Small with error 
 This is an error hint 

## Disabled 
Disabled textarea for read-only scenarios. 

 Preview Code 

 Regular disabled 
 This textarea is disabled 

 Small disabled 
 This textarea is disabled 

## Read Only 
Read-only textarea for displaying content. 

 Preview Code 

 Regular read-only 
 This is read-only content This textarea is read-only 

 Small read-only 
 This is read-only content This textarea is read-only 

## Chromeless 
 variant="chromeless" drops the field's background, border, padding, shadow, and
hover tint so the text sits on whatever surface it is embedded in. Reach for it
when editing text in place — in a document, a card, or a title row — where a
visible input box would read as a form rather than as the text being edited. The
surrounding container supplies the affordance instead. 
Prefer this over re-styling a control field through contentClassName : the
control surface sets dark: , hover: , and focus-visible: classes that a
caller's unprefixed overrides cannot reach. 

 Preview Code 

 A chromeless field carries no surface of its own, so the card around it is the affordance. Use it for editing text in place, where a visible input box would read as a form. 

 A control field renders its own background, border, padding, and shadow. A control field, for comparison 

## Usage 

## Properties 

Prop 
Type 
Description 

 label 

 string 

Label text for the textarea field 

 placeholder 

 string 

Placeholder text when textarea is empty 

 disabled 

 boolean 

Whether the textarea is disabled 

 readOnly 

 boolean 

Whether the textarea is read-only 

 size 

 'small' 'regular' 

Size of the textarea 

 variant 

 'control' 'chromeless' 

Whether the field renders its own surface. 'chromeless' drops the background, border, padding, shadow, and hover tint for editing text in place. 

 id 

 string 

Unique identifier for the textarea 

 hint 

 string 

Helper text displayed below the textarea 

 value 

 string 

Controlled textarea value 

 error 

 boolean 

Whether to display the textarea in error state 

 errorMessage 

 string 

Error message to display below the textarea 

 onChange 

 (e: ChangeEvent<HTMLTextAreaElement>) => void 

Callback function to handle input change 

 endLabel 

 React.ReactNode 

End label to display below the textarea 

 fieldSizing 

 boolean 

Whether to use fixed or content field sizing 

 className 

 string 

Additional CSS classes to apply to the textarea container 

 contentClassName 

 string 

Additional CSS classes to apply to the textarea element 

 inputRest 

 ComponentPropsWithoutRef<'textarea'> 

Extra props spread onto the native textarea element 

 containerRef 

 RefObject<HTMLDivElement> 

Ref to the container element 

 Previous Tabs 
 Next 
 Toast
