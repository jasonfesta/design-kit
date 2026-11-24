# Toast

Source: https://palermo.tryprofound.com/docs/toast

## Toast 
A notification component that displays temporary messages to users,
typically for feedback on actions or system status. 

## Basic 
Basic toast notifications with different types and messages. 

 Preview Code 

 Show Success Toast 
 Show Warning Toast 
 Show Default Toast 

## Types 
Different toast types for various notification purposes. 

 Preview Code 

 Success 
 Warning 
 Default 

## Duration 
Control how long the toast notification stays visible. 

 Preview Code 

 Quick (1s) 
 Normal (3.5s) 
 Long (10s) 

## With Actions 
Toast notifications for different user actions and scenarios. 

 Preview Code 

 Upload Success 
 Unsaved Changes 
 New Message 

## Dismiss 
Control toast dismissal behavior and manual dismissal. 

 Preview Code 

 Show Dismissible Toast 
 Persistent Toast 

## Usage 

## Properties 

Prop 
Type 
Description 

 id 

 string 

Custom identifier for the toast (auto-generated if omitted) 

 heading 

 string 

The main title of the toast notification 

 description 

 string 

The description text of the toast notification 

 duration 

 number 

Duration in milliseconds before the toast auto-dismisses (0 = persistent) 

 type 

 'success' 'warning' 'default' 'progress' 'loading' 

The type of toast notification 

 actionLabel 

 string 

Label for the toast action button 

 onAction 

 () => void 

Callback fired when the action button is clicked 

 progress 

 number 

Progress value (0-100) for progress toasts 

 icon 

 React.ReactNode 

Custom icon to display in the toast 

 descriptionLineClamp 

 2 5 'none' 

How many lines of description copy to show 

## Toast Methods 

Prop 
Type 
Description 

 toast() 

 function 

Default toast method 

 toast.success() 

 function 

Success toast method 

 toast.warning() 

 function 

Warning toast method 

 toast.default() 

 function 

Default toast method (explicit) 

 toast.progress() 

 function 

Progress toast method (persists until dismissed) 

 toast.loading() 

 function 

Loading toast method (persists until dismissed) 

 toast.dismiss() 

 function 

Dismiss a specific toast by ID 

 toast.updateProgress() 

 function 

Update a progress toast's value and optional message 

 Previous Textarea 
 Next 
 Toggle Group
