# Input

Source: https://palermo.tryprofound.com/docs/input

## Input 
A versatile input component for text, email, password, and other form inputs
with support for icons, validation, and suggestions. 

## Basic Usage 
Simple input fields with labels and placeholders. 

 Preview Code 

 Basic Input 

 With Placeholder 

 Required Field 

## Sizes 
Input components come in three sizes: mini, small, and regular. 

 Preview Code 

 Mini Input 

 Small Input 

 Regular Input 

## States 
Different input states for various use cases. 

 Preview Code 

 Normal State 

 Disabled State 

 Read Only State 

 Error State 
 This field is required 

## With Icons 
Add icons to enhance input functionality and visual appeal. 

 Preview Code 

 With Start Icon 

 With End Icon 

 With Both Icons 

## Form Example 
Complete form example showing real-world usage. 

 Preview Code 

 First Name 

 Last Name 

 Email Address 

We'll never share your email with anyone else 

 Phone Number 

 Address 

 Password 

Must be at least 8 characters long 

## With Suggestions 
 SuggestionInput wraps Input with a filtered suggestions dropdown. Import it from @repo/design-system/components/primitives/form/suggestion-input ; it accepts every Input prop plus suggestions , onSuggestionSelect , maxSuggestions (default 6), renderSuggestion , and forceShowDropdown (skeleton rows while loading). 

 Preview Code 

 Search with Suggestions 

Start typing to see suggestions 

## Usage 

## Properties 

Prop 
Type 
Description 

 label 

 string 

Label text for the input field 

 endLabel 

 ReactNode 

Content shown at the end of the label row 

 placeholder 

 string 

Placeholder text when input is empty 

 type 

 string 

HTML input type (text, password, email, etc.) 

 size 

 'small' 'regular' 

Size of the input 

 disabled 

 boolean 

Whether the input is disabled 

 readOnly 

 boolean 

Whether the input is read-only 

 required 

 boolean 

Whether the input is required 

 error 

 boolean 

Whether to display the input in error state 

 errorMessage 

 string 

Error message to display 

 iconStart 

 ReactNode 

Icon to display at the start of the input 

 iconEnd 

 ReactNode 

Icon to display at the end of the input 

 onEndIconClick 

 (e: React.MouseEvent) => void 

Callback fired when the end icon is clicked; renders the end icon as a focusable button (requires endIconLabel) 

 endIconLabel 

 string 

Accessible name for the end icon button; required when onEndIconClick is set 

 preInputNode 

 ReactNode 

Node rendered before the input element 

 hint 

 string ReactNode 

Helper text displayed below the input 

 value 

 string 

Controlled input value 

 onChange 

 (e: ChangeEvent<HTMLInputElement>) => void 

Callback function to handle input change 

 onFocus 

 (e: FocusEvent<HTMLInputElement>) => void 

Callback function to handle input focus 

 onBlur 

 (e: FocusEvent<HTMLInputElement>) => void 

Callback function to handle input blur 

 onKeyDown 

 (e: KeyboardEvent<HTMLInputElement>) => void 

Callback function to handle input key down 

 autoFocus 

 boolean 

Whether to auto focus the input 

 autoComplete 

 'off' 'on' 

Whether to auto complete the input 

 className 

 string 

Additional CSS classes to apply to the input container 

 inputClassName 

 string 

Additional CSS classes to apply to the input element 

 inputWrapperClassName 

 string 

Additional CSS classes to apply to the input wrapper 

 id 

 string 

Unique identifier for the input 

 name 

 string 

Name attribute for the input 

 nativeClipboardSource 

 boolean 

Mark the input as a native clipboard source for shortcut scopes 

 inputRest 

 ComponentPropsWithoutRef<'input'> 

Extra props spread onto the native input element 

 Previous Filter Builder 
 Next 
 Multi-step Form
